'use client'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { href: '#gallery',    label: 'Gallery',    emoji: '📸' },
  { href: '#milestones', label: 'Journey',    emoji: '⭐' },
  { href: '#letters',    label: 'Letters',    emoji: '💌' },
  { href: '#age',        label: 'Age',        emoji: '⏰' },
  { href: '/admin',      label: 'Admin',      emoji: '🔐' },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass border-b border-white/20 shadow-lg' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#" className="font-fairy text-2xl text-gradient-rose">
            🌸 Ekadya
          </a>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <a
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-full font-fairy text-sm hover:bg-white/30 transition-all duration-200 flex items-center gap-1"
                style={{color:'#5A1F8A', fontWeight:600}}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
          {/* Mobile menu button */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? '✕' : '🌸'}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden glass border-t border-white/20 px-6 py-4 flex flex-col gap-2">
            {NAV_ITEMS.map(item => (
              <a
                key={item.href}
                href={item.href}
                className="py-2 font-fairy flex items-center gap-2 hover:opacity-70 transition-opacity"
                style={{color:'#5A1F8A', fontWeight:600}}
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        )}
      </nav>
    </>
  )
}
