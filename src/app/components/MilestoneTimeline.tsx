'use client'
import { useEffect, useRef, useState } from 'react'
import type { Milestone } from '@/lib/supabase'
import { format } from 'date-fns'

interface Props { milestones: Milestone[] }

const DEFAULT_MILESTONES: Omit<Milestone, 'id' | 'created_at'>[] = [
  { title: 'She Arrived! 🎉',       description: 'The most magical day — Ekadya entered the world and stole every heart.',      date: '2025-12-10', emoji: '👶', media_url: '' },
  { title: 'First Smile 😍',         description: 'She smiled at Mama for the first time and the whole world lit up.',           date: '2025-12-28', emoji: '😊', media_url: '' },
  { title: 'Eyes Wide Open 👀',      description: 'Started following lights and faces — so curious, so alert!',                  date: '2026-01-05', emoji: '👁️', media_url: '' },
  { title: 'First Coo 🎵',           description: "Ekadya found her voice — the sweetest sounds we've ever heard.",              date: '2026-01-15', emoji: '🎶', media_url: '' },
  { title: '3 Months Strong! 🌸',   description: 'Three whole months of joy, love, and endless wonder. You are our everything.',  date: '2026-03-10', emoji: '🎂', media_url: '' },
]

type Star = { width: string; height: string; left: string; top: string; opacity: number; duration: string; delay: string }

export default function MilestoneTimeline({ milestones }: Props) {
  const displayMilestones = milestones.length > 0 ? milestones : DEFAULT_MILESTONES as Milestone[]
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    // Generate stars only on client to avoid hydration mismatch
    setStars(Array.from({ length: 50 }, () => ({
      width:    `${1 + Math.random() * 3}px`,
      height:   `${1 + Math.random() * 3}px`,
      left:     `${Math.random() * 100}%`,
      top:      `${Math.random() * 100}%`,
      opacity:  0.2 + Math.random() * 0.6,
      duration: `${2 + Math.random() * 3}s`,
      delay:    `${Math.random() * 3}s`,
    })))
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="milestones" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FDE8FF] to-[#1A0A2E]" />
      {/* Stars background — rendered client-only to avoid hydration mismatch */}
      <div className="absolute inset-0">
        {stars.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: s.width,
              height: s.height,
              left: s.left,
              top: s.top,
              opacity: s.opacity,
              animation: `pulse-soft ${s.duration} ease-in-out infinite`,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-5xl mb-4" style={{ animation: 'float 5s ease-in-out infinite' }}>⭐</div>
          <h2 className="font-display font-black text-5xl md:text-7xl mb-4">
            <span className="text-gradient-gold">Her Journey</span>
          </h2>
          <p className="font-body italic text-xl" style={{color:'#C9B1FF', fontWeight:500, textShadow:'0 1px 4px rgba(0,0,0,0.4)'}}>
            Every milestone, a star in her constellation
          </p>
        </div>

        {/* Timeline */}
        <div className="relative milestone-line">
          {displayMilestones.map((m, i) => {
            const isLeft = i % 2 === 0
            return (
              <div
                key={m.id || i}
                className={`relative flex mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'} ${isLeft ? 'justify-start' : 'justify-end'}`}
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                {/* Card */}
                <div
                  className={`w-[44%] cursor-pointer transition-all duration-300 ${activeIndex === i ? 'scale-105' : 'hover:scale-102'}`}
                  onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                >
                  <div className="glass-dark rounded-3xl p-6 border border-white/10 garden-glow hover:border-garden-rose/30">
                    <div className="text-4xl mb-3">{m.emoji}</div>
                    <h3 className="font-display font-bold text-xl mb-2" style={{color:'rgba(255,255,255,0.97)', textShadow:'0 1px 4px rgba(0,0,0,0.3)'}}>{m.title}</h3>
                    <p className="font-body text-sm italic mb-3" style={{color:'rgba(220,200,255,0.9)', lineHeight:'1.6'}}>{m.description}</p>
                    <div className="flex items-center gap-2 text-xs font-fairy" style={{color:'#FFD166'}}>
                      <span>🌸</span>
                      <span>{format(new Date(m.date), 'MMMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>

                {/* Center dot */}
                <div
                  className="absolute left-1/2 top-8 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-garden-rose bg-garden-blush z-10 flex items-center justify-center"
                  style={{ boxShadow: '0 0 20px rgba(255,107,157,0.6)', animation: `glow-pulse 2s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}
                >
                  <div className="w-2 h-2 rounded-full bg-garden-rose" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
