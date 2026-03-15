'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase, getGalleryFromBucket, type GalleryItem } from '@/lib/supabase'

interface Props { items: GalleryItem[] }

const PLACEHOLDER_GRADIENTS = [
  ['#FFD6E0', '#C9B1FF'],
  ['#B8F0D8', '#FFD166'],
  ['#FFD6E0', '#B8F0D8'],
  ['#C9B1FF', '#FFD6E0'],
  ['#FFD166', '#FF6B9D'],
  ['#B8F0D8', '#C9B1FF'],
]

const PLACEHOLDER_EMOJIS = ['🌸','🌺','👶','💕','✨','🎀']

// Staggered entrance animation delays
const CARD_ROTATIONS = ['-1.5deg','1deg','-0.5deg','2deg','-1deg','0.5deg','1.5deg','-2deg']

export default function GallerySection({ items: initialItems }: Props) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems)
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set())
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  // ── Lightbox state ────────────────────────────────────────────────────
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [lightboxVisible, setLightboxVisible] = useState(false)
  const [lightboxClosing, setLightboxClosing] = useState(false)
  const touchStartX = useRef<number>(0)

  // ── Refresh from bucket (catches direct bucket uploads, not just DB inserts) ──
  useEffect(() => {
    // On mount: if server gave us 0 items, try fetching from bucket directly
    if (initialItems.length === 0) {
      getGalleryFromBucket().then(bucketItems => {
        if (bucketItems.length > 0) setItems(bucketItems)
      })
    }

    // Poll bucket every 10s so direct-bucket uploads appear without refresh
    const pollInterval = setInterval(async () => {
      const bucketItems = await getGalleryFromBucket()
      if (bucketItems.length > 0) {
        setItems(prev => {
          // Find genuinely new items (not in prev list)
          const prevIds = new Set(prev.map(p => p.id))
          const newOnes = bucketItems.filter(b => !prevIds.has(b.id))
          if (newOnes.length === 0) return prev
          // Mark new ones for highlight
          setNewItemIds(old => {
            const next = new Set(Array.from(old).concat(newOnes.map(n => n.id)))
            newOnes.forEach(n => setTimeout(() => {
              setNewItemIds(s => { const c = new Set(Array.from(s)); c.delete(n.id); return c })
            }, 4000))
            return next
          })
          return [...newOnes, ...prev]
        })
      }
    }, 10000)

    // Also subscribe to DB inserts (for admin-panel uploads that write to DB)
    const channel = supabase
      .channel('gallery-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gallery' },
        (payload) => {
          const newItem = payload.new as GalleryItem
          setItems(prev => {
            if (prev.some(p => p.id === newItem.id)) return prev
            return [newItem, ...prev]
          })
          setNewItemIds(prev => new Set(Array.from(prev).concat(newItem.id)))
          setTimeout(() => {
            setNewItemIds(prev => { const n = new Set(Array.from(prev)); n.delete(newItem.id); return n })
          }, 4000)
        }
      )
      .subscribe()

    return () => {
      clearInterval(pollInterval)
      supabase.removeChannel(channel)
    }
  }, [initialItems.length])

  // ── Intersection observer ─────────────────────────────────────────────
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.05 }
    )
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  // ── Lightbox helpers ──────────────────────────────────────────────────
  const displayItems = items.length > 0 ? items : []

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxVisible(true)
    setLightboxClosing(false)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = useCallback(() => {
    setLightboxClosing(true)
    setTimeout(() => {
      setLightboxVisible(false)
      setLightboxClosing(false)
      setLightboxIndex(null)
      document.body.style.overflow = ''
    }, 350)
  }, [])

  const goNext = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex + 1) % displayItems.length)
  }, [lightboxIndex, displayItems.length])

  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return
    setLightboxIndex((lightboxIndex - 1 + displayItems.length) % displayItems.length)
  }, [lightboxIndex, displayItems.length])

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxVisible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft')  goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxVisible, closeLightbox, goNext, goPrev])

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx < -50) goNext()
    if (dx >  50) goPrev()
  }

  const currentItem = lightboxIndex !== null ? displayItems[lightboxIndex] : null

  // ── Download handler ──────────────────────────────────────────────────
  const [downloading, setDownloading] = useState(false)
  const handleDownload = useCallback(async () => {
    if (!currentItem?.url) return
    setDownloading(true)
    try {
      // Fetch the image as a blob so the browser saves it instead of opening it
      const response = await fetch(currentItem.url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const ext = currentItem.url.split('.').pop()?.split('?')[0] || 'jpg'
      const filename = currentItem.caption
        ? `ekadya-${currentItem.caption.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.${ext}`
        : `ekadya-memory-${(lightboxIndex! + 1)}.${ext}`
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      // Fallback: open in new tab if blob fetch fails (e.g. CORS)
      window.open(currentItem.url, '_blank')
    } finally {
      setDownloading(false)
    }
  }, [currentItem, lightboxIndex])

  return (
    <section ref={sectionRef} id="gallery" className="relative py-32 px-4 md:px-6 overflow-hidden">
      {/* Background — slightly darker so white card shadows are visible */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #dce8ff 0%, #ecdeff 50%, #ffd6e8 100%)' }} />
      <div className="orb absolute w-80 h-80 bg-[#FFD6E0] opacity-30 top-20 -right-20 pointer-events-none" />
      <div className="orb absolute w-60 h-60 bg-[#C9B1FF] opacity-20 bottom-20 -left-10 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className={`text-center mb-16 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-5xl mb-4" style={{ animation: 'float 4s ease-in-out infinite' }}>📸</div>
          <h2 className="font-display font-black text-5xl md:text-7xl text-gradient-rose mb-4">
            Memory Garden
          </h2>
          <p className="font-body italic text-xl font-medium" style={{ color: '#5A1F8A' }}>
            Every photo, a petal in the story of Ekadya
          </p>
          <div className="flex justify-center gap-2 mt-4 text-2xl">
            {['🌸','🌺','🌼','🌷'].map((f, i) => (
              <span key={i} style={{ display: 'inline-block', animation: `float ${3 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}>{f}</span>
            ))}
          </div>
          {items.length > 0 && (
            <p className="font-fairy text-sm mt-3" style={{ color: '#9B72CF' }}>
              {items.length} precious {items.length === 1 ? 'memory' : 'memories'} captured ✨
            </p>
          )}
        </div>

        {/* ── Empty state ── */}
        {items.length === 0 && (
          <div className={`text-center py-20 transition-all duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-8xl mb-6" style={{ animation: 'float 4s ease-in-out infinite' }}>🌱</div>
            <p className="font-display font-bold text-2xl mb-2" style={{ color: '#9B72CF' }}>
              The garden is waiting to bloom
            </p>
            <p className="font-body italic" style={{ color: '#6B2FA0' }}>
              Upload Ekadya's first photo via the <a href="/admin" className="underline text-[#FF6B9D] hover:opacity-70">admin panel</a> 🌸
            </p>
          </div>
        )}

        {/* ── Masonry Grid ── */}
        {items.length > 0 && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4">
            {items.map((item, i) => {
              const [c1, c2] = PLACEHOLDER_GRADIENTS[i % 6]
              const isNew = newItemIds.has(item.id)
              // Vary aspect ratios using paddingBottom trick (bulletproof in all browsers)
              const pb = i % 4 === 0 ? '100%' : i % 4 === 1 ? '133%' : i % 4 === 2 ? '75%' : '150%'

              return (
                <div
                  key={item.id}
                  className={`break-inside-avoid mb-3 md:mb-4 cursor-pointer group transition-all duration-700 ${
                    visible ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    transitionDelay: `${Math.min(i * 0.06, 0.6)}s`,
                    transform: visible ? `rotate(${CARD_ROTATIONS[i % 8]})` : 'translateY(40px)',
                  }}
                  onClick={() => openLightbox(i)}
                >
                  {/* paddingBottom aspect ratio wrapper — works everywhere */}
                  <div
                    className="rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl"
                    style={{
                      position: 'relative',
                      width: '100%',
                      paddingBottom: pb,
                      boxShadow: isNew ? '0 0 0 3px #FF6B9D, 0 0 30px rgba(255,107,157,0.5)' : undefined,
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      transform: 'translateZ(0)', // GPU layer
                    }}
                  >
                    {/* All children absolutely positioned inside the padding box */}
                    {item.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.caption || 'Ekadya'}
                        loading="lazy"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                          display: 'block',
                        }}
                        className="group-hover:scale-105"
                      />
                    ) : (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `linear-gradient(135deg, ${c1}, ${c2})`,
                        }}
                      >
                        <div className="text-5xl" style={{ animation: `float ${3 + i * 0.3}s ease-in-out infinite` }}>
                          {PLACEHOLDER_EMOJIS[i % 6]}
                        </div>
                      </div>
                    )}

                    {/* NEW badge */}
                    {isNew && (
                      <div
                        className="font-fairy text-white text-xs"
                        style={{
                          position: 'absolute', top: 8, left: 8,
                          padding: '2px 8px', borderRadius: 999,
                          background: 'linear-gradient(135deg, #FF6B9D, #C9B1FF)',
                          animation: 'pulse-soft 1s ease-in-out infinite',
                          boxShadow: '0 0 12px rgba(255,107,157,0.6)',
                          zIndex: 10,
                        }}
                      >
                        ✨ New
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.05) 60%, transparent 100%)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                        padding: '10px',
                      }}
                    >
                      {item.caption && (
                        <p className="font-fairy text-white text-xs leading-tight drop-shadow-lg">{item.caption}</p>
                      )}
                      <p className="font-fairy text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>tap to open 🔍</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          FULLSCREEN CINEMATIC LIGHTBOX
      ══════════════════════════════════════════════════════════════════ */}
      {lightboxVisible && currentItem && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            background: 'rgba(8, 3, 20, 0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            animation: lightboxClosing
              ? 'lightbox-out 0.35s ease forwards'
              : 'lightbox-in 0.35s ease forwards',
          }}
          onClick={closeLightbox}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <style>{`
            @keyframes lightbox-in {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes lightbox-out {
              from { opacity: 1; }
              to   { opacity: 0; }
            }
            @keyframes photo-pop {
              0%   { transform: scale(0.88) translateY(20px); opacity: 0; }
              60%  { transform: scale(1.02) translateY(-4px); opacity: 1; }
              100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            @keyframes caption-rise {
              from { transform: translateY(20px); opacity: 0; }
              to   { transform: translateY(0); opacity: 1; }
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
          `}</style>

          {/* Ambient glow orbs behind photo */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="orb absolute w-96 h-96 bg-[#FF6B9D] opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="orb absolute w-72 h-72 bg-[#C9B1FF] opacity-8 top-1/4 left-1/4" style={{filter:'blur(80px)'}} />
          </div>

          {/* Main photo container */}
          <div
            className="relative flex flex-col items-center max-w-[92vw] max-h-[92vh] w-full"
            style={{ animation: lightboxClosing ? 'none' : 'photo-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Photo */}
            <div
              className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
              style={{
                maxHeight: 'calc(92vh - 100px)',
                boxShadow: '0 0 60px rgba(255,107,157,0.2), 0 0 120px rgba(201,177,255,0.1), 0 30px 80px rgba(0,0,0,0.6)',
              }}
            >
              {currentItem.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentItem.url}
                  alt={currentItem.caption || 'Ekadya'}
                  className="w-full h-auto block"
                  style={{
                    maxHeight: 'calc(92vh - 100px)',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <div
                  className="w-full aspect-video flex items-center justify-center text-9xl"
                  style={{
                    background: `linear-gradient(135deg, ${PLACEHOLDER_GRADIENTS[lightboxIndex! % 6][0]}, ${PLACEHOLDER_GRADIENTS[lightboxIndex! % 6][1]})`,
                  }}
                >
                  🌸
                </div>
              )}

              {/* Counter badge */}
              <div
                className="absolute top-3 right-3 px-3 py-1 rounded-full font-fairy text-xs text-white"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
              >
                {(lightboxIndex! + 1)} / {displayItems.length}
              </div>
            </div>

            {/* Caption + date */}
            <div
              className="mt-4 text-center px-4"
              style={{ animation: 'caption-rise 0.4s ease 0.2s both' }}
            >
              {currentItem.caption && (
                <p className="font-fairy text-white text-lg mb-1 drop-shadow-lg">
                  {currentItem.caption}
                </p>
              )}
              {currentItem.created_at && (
                <p className="font-body italic text-white/50 text-xs">
                  {new Date(currentItem.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              )}
              <p className="text-white/25 text-xs mt-2 font-fairy">
                ← swipe or use arrow keys →  •  esc to close
              </p>
            </div>
          </div>

          {/* Top-right toolbar: Download + Close */}
          <div className="absolute top-4 right-4 flex items-center gap-2">

            {/* Download button */}
            {currentItem?.url && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDownload() }}
                disabled={downloading}
                title="Download this photo"
                className="flex items-center gap-1.5 px-3 h-11 rounded-full text-white text-sm font-fairy transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60"
                style={{
                  background: downloading
                    ? 'rgba(255,255,255,0.08)'
                    : 'linear-gradient(135deg, rgba(255,107,157,0.7), rgba(201,177,255,0.7))',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  boxShadow: downloading ? 'none' : '0 0 16px rgba(255,107,157,0.3)',
                }}
              >
                {downloading ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>🌸</span>
                    <span className="hidden md:inline">Saving...</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    <span className="hidden md:inline">Download</span>
                  </>
                )}
              </button>
            )}

            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              ✕
            </button>
          </div>

          {/* Prev / Next arrows — only show if multiple photos */}
          {displayItems.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl transition-all duration-200 hover:scale-110 hover:bg-white/20"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext() }}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl transition-all duration-200 hover:scale-110 hover:bg-white/20"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                ›
              </button>
            </>
          )}

          {/* Dot strip */}
          {displayItems.length > 1 && displayItems.length <= 20 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
              {displayItems.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === lightboxIndex ? '20px' : '6px',
                    height: '6px',
                    background: i === lightboxIndex ? '#FF6B9D' : 'rgba(255,255,255,0.3)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
