import { createClient } from '@supabase/supabase-js'

const supabaseUrl      = (process.env.NEXT_PUBLIC_SUPABASE_URL      || '').trim()
const supabaseAnonKey  = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  || '').trim()

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Milestone = {
  id: string
  title: string
  description: string
  date: string
  emoji: string
  media_url?: string
  created_at: string
}

export type LoveLetter = {
  id: string
  author: string
  relation: string
  message: string
  color: string
  created_at: string
}

export type GalleryItem = {
  id: string
  url: string
  caption?: string
  type: 'image' | 'video'
  created_at: string
}

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic', 'bmp', 'tiff', 'tif']
const VIDEO_EXTS = ['mp4', 'mov', 'webm', 'avi', 'mkv']
const BUCKET     = 'ekadya-media'
const PAGE_SIZE  = 100 // Supabase max per request

// ─── List ALL files in a bucket folder with pagination ────────────────────────
async function listAllFiles(folder: string) {
  const allFiles: { name: string; id: string; created_at: string }[] = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(folder, {
        limit: PAGE_SIZE,
        offset,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error || !data || data.length === 0) break
    allFiles.push(...(data as typeof allFiles))
    if (data.length < PAGE_SIZE) break // last page
    offset += PAGE_SIZE
  }

  return allFiles
}

// ─── Convert a storage file entry to a GalleryItem ───────────────────────────
function toGalleryItem(
  file: { name: string; id: string; created_at: string },
  folder: string
): GalleryItem | null {
  if (!file.name || file.name === '.emptyFolderPlaceholder') return null
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (![...IMAGE_EXTS, ...VIDEO_EXTS].includes(ext)) return null

  const filePath = folder ? `${folder}/${file.name}` : file.name
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)

  return {
    id: file.id || filePath,
    url: data.publicUrl,
    caption: '',
    type: VIDEO_EXTS.includes(ext) ? 'video' : 'image',
    created_at: file.created_at || new Date().toISOString(),
  }
}

// ─── Read ALL images from the bucket (paginated) ─────────────────────────────
// Only scans the 'gallery/' subfolder to avoid duplicates.
// Falls back to root scan only if gallery/ returns 0 results.
export async function getGalleryFromBucket(): Promise<GalleryItem[]> {
  try {
    // Primary: scan gallery/ subfolder (where all uploads go)
    const galleryFiles = await listAllFiles('gallery')
    const results: GalleryItem[] = []

    for (const f of galleryFiles) {
      const item = toGalleryItem(f, 'gallery')
      if (item) results.push(item)
    }

    // Fallback: if gallery/ is empty, try root (older uploads)
    if (results.length === 0) {
      const rootFiles = await listAllFiles('')
      for (const f of rootFiles) {
        const item = toGalleryItem(f, '')
        if (item) results.push(item)
      }
    }

    return results
  } catch (err) {
    console.error('Bucket scan error:', err)
    return []
  }
}

// ─── Fetch gallery: DB table first (fast), fallback to bucket scan ────────────
export async function getGallery(): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data && data.length > 0) return data
  } catch { /* fall through */ }

  return getGalleryFromBucket()
}

// ─── ONE-TIME SYNC: copies every bucket file into the gallery DB table ────────
// Skips files already in the table (by URL). Inserts in batches of 50.
// Calls onProgress(done, total) so you can show a progress bar.
export async function syncBucketToGalleryTable(
  onProgress?: (done: number, total: number) => void
): Promise<{ inserted: number; skipped: number; errors: number }> {
  // 1. Get all bucket files
  const bucketItems = await getGalleryFromBucket()
  const total = bucketItems.length

  if (total === 0) return { inserted: 0, skipped: 0, errors: 0 }

  // 2. Get all URLs already in the DB table
  const { data: existing } = await supabase
    .from('gallery')
    .select('url')
  const existingUrls = new Set((existing || []).map((r: { url: string }) => r.url))

  // 3. Filter to only new items
  const toInsert = bucketItems.filter(item => !existingUrls.has(item.url))

  let inserted = 0
  let errors   = 0
  const skipped = bucketItems.length - toInsert.length

  if (toInsert.length === 0) {
    onProgress?.(total, total)
    return { inserted: 0, skipped, errors: 0 }
  }

  // 4. Insert in batches of 50 to avoid request size limits
  const BATCH = 50
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH).map(item => ({
      url:        item.url,
      caption:    item.caption || '',
      type:       item.type,
      created_at: item.created_at,
    }))

    const { error } = await supabase.from('gallery').insert(batch)

    if (error) {
      console.error('Batch insert error:', error)
      errors += batch.length
    } else {
      inserted += batch.length
    }

    onProgress?.(skipped + inserted + errors, total)
  }

  return { inserted, skipped, errors }
}

// ─── Upload file to Supabase Storage ─────────────────────────────────────────
export async function uploadMedia(file: File): Promise<{ url: string | null; error: string | null }> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
  const filePath = `gallery/${fileName}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, { cacheControl: '3600', upsert: false })

  if (error) {
    console.error('Upload error:', error)
    if (error.message?.includes('Bucket not found') || (error as any).statusCode === 400) {
      return { url: null, error: 'BUCKET_NOT_FOUND' }
    }
    return { url: null, error: error.message }
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  return { url: data.publicUrl, error: null }
}

// ─── Add single item to gallery DB table ─────────────────────────────────────
export async function addToGallery(url: string, caption: string, type: 'image' | 'video' = 'image') {
  try {
    const { error } = await supabase.from('gallery').insert({ url, caption, type })
    if (error) console.warn('addToGallery failed:', error.message)
  } catch (e) {
    console.warn('addToGallery error:', e)
  }
}

// ─── Fetch milestones ─────────────────────────────────────────────────────────
export async function getMilestones(): Promise<Milestone[]> {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .order('date', { ascending: true })
    if (error) return []
    return data || []
  } catch { return [] }
}

// ─── Fetch love letters ───────────────────────────────────────────────────────
export async function getLoveLetters(): Promise<LoveLetter[]> {
  try {
    const { data, error } = await supabase
      .from('love_letters')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) return []
    return data || []
  } catch { return [] }
}

// ─── Add milestone ────────────────────────────────────────────────────────────
export async function addMilestone(milestone: Omit<Milestone, 'id' | 'created_at'>) {
  const { error } = await supabase.from('milestones').insert(milestone)
  if (error) console.error(error)
}

// ─── Add love letter ──────────────────────────────────────────────────────────
export async function addLoveLetter(letter: Omit<LoveLetter, 'id' | 'created_at'>) {
  const { error } = await supabase.from('love_letters').insert(letter)
  if (error) console.error(error)
}
