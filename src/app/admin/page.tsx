'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadMedia, addToGallery, addMilestone, addLoveLetter, syncBucketToGalleryTable } from '@/lib/supabase'

type Tab = 'upload' | 'milestone' | 'letter'

export default function AdminPage() {
  const [tab, setTab]         = useState<Tab>('upload')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [driveLink, setDriveLink] = useState('')

  // ── Secret dev mode: tap the lock emoji 5 times to reveal sync panel ──
  const [devTaps, setDevTaps] = useState(0)
  const [devMode, setDevMode] = useState(false)
  const handleDevTap = () => {
    const next = devTaps + 1
    setDevTaps(next)
    if (next >= 5) { setDevMode(true); setDevTaps(0) }
  }

  // ── Sync state ──
  const [syncing, setSyncing]       = useState(false)
  const [syncDone, setSyncDone]     = useState(0)
  const [syncTotal, setSyncTotal]   = useState(0)
  const [syncResult, setSyncResult] = useState<{ inserted: number; skipped: number; errors: number } | null>(null)

  async function handleSync() {
    setSyncing(true); setSyncResult(null); setSyncDone(0); setSyncTotal(0)
    try {
      const result = await syncBucketToGalleryTable((done, total) => {
        setSyncDone(done); setSyncTotal(total)
      })
      setSyncResult(result)
    } catch (e) {
      setMessage('Sync failed: ' + String(e))
    } finally {
      setSyncing(false)
    }
  }

  // ── Gallery upload state ──
  const [caption, setCaption]     = useState('')
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])

  // ── Milestone state ──
  const [msTitle, setMsTitle] = useState('')
  const [msDesc, setMsDesc]   = useState('')
  const [msDate, setMsDate]   = useState('')
  const [msEmoji, setMsEmoji] = useState('🌸')

  // ── Letter state ──
  const [ltAuthor, setLtAuthor]     = useState('')
  const [ltRelation, setLtRelation] = useState('')
  const [ltMessage, setLtMessage]   = useState('')
  const [ltColor, setLtColor]       = useState('#FFD6E0')

  // ── Dropzone ──
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true); setMessage('')
    const urls: string[] = []
    for (const file of acceptedFiles) {
      const result = await uploadMedia(file)
      if (result.error === 'BUCKET_NOT_FOUND') {
        setMessage('Bucket not found — create a public bucket named ekadya-media in Supabase Storage first.')
        setUploading(false); return
      }
      if (result.error) {
        setMessage('Upload failed: ' + result.error)
        setUploading(false); return
      }
      if (result.url) {
        await addToGallery(result.url, caption || file.name, file.type.startsWith('video') ? 'video' : 'image')
        urls.push(result.url)
      }
    }
    setUploadedUrls(prev => [...prev, ...urls])
    setMessage(`${urls.length} photo${urls.length !== 1 ? 's' : ''} uploaded successfully!`)
    setUploading(false)
  }, [caption])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    multiple: true,
  })

  async function handleMilestone(e: React.FormEvent) {
    e.preventDefault()
    await addMilestone({ title: msTitle, description: msDesc, date: msDate, emoji: msEmoji, media_url: '' })
    setMessage('Milestone added!')
    setMsTitle(''); setMsDesc(''); setMsDate(''); setMsEmoji('🌸')
  }

  async function handleLetter(e: React.FormEvent) {
    e.preventDefault()
    await addLoveLetter({ author: ltAuthor, relation: ltRelation, message: ltMessage, color: ltColor })
    setMessage('Love letter added!')
    setLtAuthor(''); setLtRelation(''); setLtMessage('')
  }

  const EMOJI_OPTIONS = ['🌸','🌺','🌼','🌷','👶','😊','🎉','🎂','⭐','💕','🦋','🎀','👑','🌙','☀️']
  const COLOR_OPTIONS = ['#FFD6E0','#C9B1FF','#B8F0D8','#FFD166','#FF6B9D','#9B72CF']

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0FA] via-[#FDE8FF] to-[#E8F4FF] p-6">
      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <a href="/" className="inline-block font-fairy text-garden-rose hover:opacity-70 transition mb-4">
            ← Back to Ekadya's World
          </a>
          {/* Tap 5× to unlock dev mode */}
          <div
            className="text-5xl mb-2 cursor-default select-none"
            onClick={handleDevTap}
            title=""
          >
            🔐
          </div>
          <h1 className="font-display font-black text-4xl text-gradient-rose">Admin Panel</h1>
          <p className="font-body italic mt-1" style={{ color: '#9B72CF' }}>
            Add memories to Ekadya's magical garden
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-8 glass rounded-2xl p-2 border border-white/30">
          {(['upload', 'milestone', 'letter'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setMessage('') }}
              className={`flex-1 py-3 rounded-xl font-fairy text-sm capitalize transition-all duration-300 ${
                tab === t
                  ? 'bg-gradient-to-r from-garden-rose to-garden-violet text-white shadow-lg'
                  : 'hover:bg-white/30'
              }`}
              style={{ color: tab === t ? 'white' : '#9B72CF' }}
            >
              {t === 'upload' ? '📸 Upload Photos' : t === 'milestone' ? '⭐ Add Milestone' : '💌 Add Letter'}
            </button>
          ))}
        </div>

        {/* ── Toast message ── */}
        {message && (
          <div
            className="glass rounded-2xl p-4 mb-6 border text-center font-fairy"
            style={{
              borderColor: message.toLowerCase().includes('fail') || message.toLowerCase().includes('not found')
                ? 'rgba(255,100,100,0.4)' : 'rgba(107,203,150,0.4)',
              color: message.toLowerCase().includes('fail') || message.toLowerCase().includes('not found')
                ? '#c0392b' : '#2D8A5F',
            }}
          >
            {message.toLowerCase().includes('fail') || message.toLowerCase().includes('not found') ? '❌ ' : '✅ '}
            {message}
          </div>
        )}

        {/* ══════════════════════════════════
            UPLOAD TAB
        ══════════════════════════════════ */}
        {tab === 'upload' && (
          <div className="space-y-6">

            {/* ── Hidden dev panel: Sync Bucket → Table ── */}
            {devMode && (
              <div className="rounded-3xl p-6 border-2 border-[#C9B1FF]/50 bg-[#F5EAFF]/80">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
                  <div className="flex-1 min-w-0">
                    <p className="font-fairy text-xs text-[#9B72CF] uppercase tracking-widest mb-1">Developer Tools</p>
                    <h3 className="font-fairy font-bold text-[#5A1F8A] mb-1">🔄 Sync Bucket → Gallery Table</h3>
                    <p className="text-xs font-body text-[#6B2FA0]">
                      Reads every file in the storage bucket and inserts missing ones into the gallery DB table. Run once to fix missing photos.
                    </p>
                  </div>
                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="shrink-0 px-5 py-3 rounded-2xl font-fairy font-bold text-white text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: syncing ? 'rgba(155,114,207,0.4)' : 'linear-gradient(135deg, #9B72CF, #C9B1FF)',
                      boxShadow: syncing ? 'none' : '0 0 20px rgba(155,114,207,0.4)',
                    }}
                  >
                    {syncing ? '⏳ Syncing...' : '🔄 Run Sync'}
                  </button>
                </div>

                {/* Progress bar */}
                {syncing && syncTotal > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-fairy text-[#6B2FA0] mb-1">
                      <span>Copying files to table...</span>
                      <span>{syncDone} / {syncTotal}</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-white/50 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: syncTotal > 0 ? `${Math.round((syncDone / syncTotal) * 100)}%` : '0%',
                          background: 'linear-gradient(90deg, #FF6B9D, #C9B1FF)',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Result */}
                {syncResult && !syncing && (
                  <div className="mt-4 p-4 rounded-2xl bg-white/40 border border-white/50">
                    <p className="font-fairy font-bold text-[#5A1F8A] mb-3">✅ Sync Complete!</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-[#B8F0D8]/60 rounded-xl p-3">
                        <div className="font-display font-black text-2xl text-[#2D8A5F]">{syncResult.inserted}</div>
                        <div className="font-fairy text-xs text-[#2D8A5F] mt-0.5">Added</div>
                      </div>
                      <div className="bg-[#FFD6E0]/60 rounded-xl p-3">
                        <div className="font-display font-black text-2xl text-[#9B72CF]">{syncResult.skipped}</div>
                        <div className="font-fairy text-xs text-[#9B72CF] mt-0.5">Already existed</div>
                      </div>
                      <div className="bg-[#FFF3CD]/60 rounded-xl p-3">
                        <div className="font-display font-black text-2xl text-[#856404]">{syncResult.errors}</div>
                        <div className="font-fairy text-xs text-[#856404] mt-0.5">Errors</div>
                      </div>
                    </div>
                    {syncResult.inserted > 0 && (
                      <p className="font-fairy text-xs text-[#5A1F8A] mt-3 text-center">
                        🌸 <a href="/" className="underline text-[#FF6B9D]">Reload the main page</a> to see all photos!
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => { setDevMode(false); setDevTaps(0) }}
                  className="mt-4 text-xs font-fairy hover:opacity-80 transition-opacity"
                  style={{ color: 'rgba(155,114,207,0.5)' }}
                >
                  hide dev tools
                </button>
              </div>
            )}

            {/* ── Caption input ── */}
            <div className="glass rounded-3xl p-6 border border-white/30">
              <label className="block font-fairy text-sm mb-2" style={{ color: '#9B72CF' }}>
                Caption (optional)
              </label>
              <input
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="e.g. First bath 🛁"
                className="w-full bg-white/50 rounded-xl px-4 py-3 font-body text-[#1A0A2E] border border-white/40 focus:outline-none focus:border-garden-rose/50 placeholder:text-[#9B72CF]/50"
              />
            </div>

            {/* ── Dropzone ── */}
            <div
              {...getRootProps()}
              className={`glass rounded-3xl p-12 border-2 border-dashed transition-all duration-300 cursor-pointer text-center ${
                isDragActive ? 'border-garden-rose scale-[1.02]' : 'border-white/40 hover:border-garden-rose/50'
              }`}
              style={{ background: isDragActive ? 'rgba(255,214,224,0.2)' : undefined }}
            >
              <input {...getInputProps()} />
              <div className="text-6xl mb-4" style={{ animation: 'float 4s ease-in-out infinite' }}>
                {isDragActive ? '🌸' : '📁'}
              </div>
              <p className="font-display font-bold text-xl mb-2" style={{ color: '#9B72CF' }}>
                {isDragActive ? 'Drop the petals here!' : 'Drag & drop photos or videos'}
              </p>
              <p className="font-body italic text-sm" style={{ color: 'rgba(155,114,207,0.6)' }}>
                or click to browse — JPG, PNG, GIF, MP4 supported
              </p>
              {uploading && (
                <div className="mt-4 flex items-center justify-center gap-2 font-fairy" style={{ color: '#FF6B9D' }}>
                  <span style={{ display: 'inline-block', animation: 'spin-slow 1s linear infinite' }}>🌸</span>
                  <span>Uploading to Ekadya's garden...</span>
                </div>
              )}
            </div>

            {/* ── Google Drive helper ── */}
            <div className="glass rounded-3xl p-6 border border-white/30">
              <h3 className="font-fairy font-bold mb-3" style={{ color: '#9B72CF' }}>📂 Import from Google Drive</h3>
              <input
                value={driveLink}
                onChange={e => setDriveLink(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full bg-white/50 rounded-xl px-4 py-3 font-body text-sm text-[#1A0A2E] border border-white/40 focus:outline-none focus:border-garden-rose/50 placeholder:text-[#9B72CF]/50"
              />
              {driveLink && (
                <p className="mt-3 text-xs font-body italic" style={{ color: '#9B72CF' }}>
                  💡 Open the link → select all (Ctrl+A) → Download as ZIP → extract → drag files above.
                </p>
              )}
            </div>

            {/* ── Uploaded previews ── */}
            {uploadedUrls.length > 0 && (
              <div className="glass rounded-3xl p-6 border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-fairy font-bold" style={{ color: '#6BCB96' }}>
                    ✅ Uploaded ({uploadedUrls.length})
                  </h3>
                  <a href="/#gallery" className="font-fairy text-sm underline hover:opacity-70" style={{ color: '#FF6B9D' }}>
                    View in Gallery →
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {uploadedUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Upload ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-white text-xl">🔍</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════
            MILESTONE TAB
        ══════════════════════════════════ */}
        {tab === 'milestone' && (
          <form onSubmit={handleMilestone} className="glass rounded-3xl p-8 border border-white/30 space-y-5">
            <div>
              <label className="block font-fairy text-sm mb-2" style={{ color: '#9B72CF' }}>Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map(e => (
                  <button
                    key={e} type="button"
                    onClick={() => setMsEmoji(e)}
                    className={`text-2xl p-2 rounded-xl transition-all duration-200 ${msEmoji === e ? 'scale-125 shadow-lg' : 'hover:bg-white/30'}`}
                    style={{ background: msEmoji === e ? '#FFD6E0' : undefined }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            {[
              { label: 'Title', value: msTitle, set: setMsTitle, placeholder: 'e.g. First Smile 😊', type: 'text' },
              { label: 'Date',  value: msDate,  set: setMsDate,  placeholder: '', type: 'date' },
            ].map(f => (
              <div key={f.label}>
                <label className="block font-fairy text-sm mb-2" style={{ color: '#9B72CF' }}>{f.label}</label>
                <input
                  required type={f.type} value={f.value}
                  onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-white/50 rounded-xl px-4 py-3 font-body text-[#1A0A2E] border border-white/40 focus:outline-none focus:border-garden-rose/50 placeholder:text-[#9B72CF]/50"
                />
              </div>
            ))}
            <div>
              <label className="block font-fairy text-sm mb-2" style={{ color: '#9B72CF' }}>Description</label>
              <textarea
                required value={msDesc} onChange={e => setMsDesc(e.target.value)}
                rows={3} placeholder="Describe this magical moment..."
                className="w-full bg-white/50 rounded-xl px-4 py-3 font-body text-[#1A0A2E] border border-white/40 focus:outline-none focus:border-garden-rose/50 placeholder:text-[#9B72CF]/50 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 rounded-2xl text-white font-fairy font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg"
              style={{ background: 'linear-gradient(135deg, #FF6B9D, #9B72CF)' }}
            >
              ⭐ Add Milestone
            </button>
          </form>
        )}

        {/* ══════════════════════════════════
            LETTER TAB
        ══════════════════════════════════ */}
        {tab === 'letter' && (
          <form onSubmit={handleLetter} className="glass rounded-3xl p-8 border border-white/30 space-y-5">
            <div>
              <label className="block font-fairy text-sm mb-2" style={{ color: '#9B72CF' }}>Card Color</label>
              <div className="flex gap-3">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c} type="button"
                    onClick={() => setLtColor(c)}
                    className={`w-10 h-10 rounded-full transition-all duration-200 ${ltColor === c ? 'scale-125' : 'hover:scale-110'}`}
                    style={{
                      background: c,
                      boxShadow: ltColor === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
            {[
              { label: 'Your Name', value: ltAuthor,   set: setLtAuthor,   placeholder: 'e.g. Mama' },
              { label: 'Relation',  value: ltRelation, set: setLtRelation, placeholder: 'e.g. Your Mama' },
            ].map(f => (
              <div key={f.label}>
                <label className="block font-fairy text-sm mb-2" style={{ color: '#9B72CF' }}>{f.label}</label>
                <input
                  required value={f.value} onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-white/50 rounded-xl px-4 py-3 font-body text-[#1A0A2E] border border-white/40 focus:outline-none focus:border-garden-rose/50 placeholder:text-[#9B72CF]/50"
                />
              </div>
            ))}
            <div>
              <label className="block font-fairy text-sm mb-2" style={{ color: '#9B72CF' }}>Your Message to Ekadya 💕</label>
              <textarea
                required value={ltMessage} onChange={e => setLtMessage(e.target.value)}
                rows={5} placeholder="Write your heart out to this little princess..."
                className="w-full bg-white/50 rounded-xl px-4 py-3 font-body text-[#1A0A2E] border border-white/40 focus:outline-none focus:border-garden-rose/50 placeholder:text-[#9B72CF]/50 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 rounded-2xl text-white font-fairy font-bold text-lg hover:scale-[1.02] transition-transform shadow-lg"
              style={{ background: 'linear-gradient(135deg, #FF6B9D, #9B72CF)' }}
            >
              💌 Send Love Letter
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
