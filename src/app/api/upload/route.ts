import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  // Initialise inside the handler so it only runs at request time,
  // not at build time when env vars are not available on Vercel.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Missing Supabase env vars' }, { status: 500 })
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey)

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

    const { error: dbError } = await supabaseAdmin.from('gallery').insert({
      url: publicUrl,
      caption,
      type: file.type.startsWith('video') ? 'video' : 'image',
    })

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

    return NextResponse.json({ url: publicUrl })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
