import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side client using service role key (bypasses RLS for admin uploads)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file     = formData.get('file') as File | null
    const caption  = formData.get('caption') as string || ''

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const fileExt  = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `gallery/${fileName}`
    const buffer   = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabaseAdmin.storage
      .from('ekadya-media')
      .upload(filePath, buffer, { contentType: file.type, cacheControl: '3600' })

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

    const { data } = supabaseAdmin.storage.from('ekadya-media').getPublicUrl(filePath)
    const publicUrl = data.publicUrl

    // Insert into gallery table
    const { error: dbError } = await supabaseAdmin.from('gallery').insert({
      url: publicUrl,
      caption,
      type: file.type.startsWith('video') ? 'video' : 'image',
    })

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
