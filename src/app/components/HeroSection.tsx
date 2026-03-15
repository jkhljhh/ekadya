'use client'
import { useEffect, useRef, useState } from 'react'

const BIRTH_DATE = new Date('2025-12-10') // Ekadya's birth date — Dec 10, 2025

function getAge() {
  const now = new Date()
  const diffMs = now.getTime() - BIRTH_DATE.getTime()
  const days   = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const months = Math.floor(days / 30.44)
  const weeks  = Math.floor(days / 7)
  const hours  = Math.floor(diffMs / (1000 * 60 * 60))
  return { days, months, weeks, hours }
}

export default function HeroSection() {
  const [age, setAge] = useState(getAge())
  const [mounted, setMounted] = useState(false)
  const orb1 = useRef<HTMLDivElement>(null)
  const orb2 = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => setAge(getAge()), 60000)

    // Parallax orbs on mouse move
    const onMove = (e: MouseEvent) => {
      const { innerWidth: w, innerHeight: h } = window
      const rx = (e.clientX / w - 0.5) * 2
      const ry = (e.clientY / h - 0.5) * 2
      if (orb1.current) {
        orb1.current.style.transform = `translate(${rx * 30}px, ${ry * 20}px)`
      }
      if (orb2.current) {
        orb2.current.style.transform = `translate(${rx * -20}px, ${ry * -15}px)`
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => { clearInterval(interval); window.removeEventListener('mousemove', onMove) }
  }, [])

  const name = 'Ekadya'.split('')

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF0FA] via-[#FDE8FF] to-[#E8F4FF]">
      {/* Background Orbs */}
      <div ref={orb1} className="orb absolute w-[600px] h-[600px] bg-[#FFD6E0] opacity-40 -top-32 -left-32 transition-transform duration-700 ease-out" />
      <div ref={orb2} className="orb absolute w-[500px] h-[500px] bg-[#C9B1FF] opacity-30 bottom-0 right-0 transition-transform duration-700 ease-out" />
      <div className="orb absolute w-[300px] h-[300px] bg-[#B8F0D8] opacity-25 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Garden illustration top */}
      <div className="absolute top-0 left-0 right-0 flex justify-around opacity-60 text-4xl pt-4 animate-pulse-soft">
        {['🌸','🌺','🌼','🌷','🌸','🌺','🌼','🌷','🌸'].map((f,i)=>(
          <span key={i} style={{ animationDelay:`${i*0.3}s`, display:'inline-block', animation:`float ${3+i*0.4}s ease-in-out infinite` }}>{f}</span>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Crown */}
        <div
          className="text-6xl mb-4 inline-block"
          style={{ animation: 'bounce-soft 2s ease-in-out infinite', filter: 'drop-shadow(0 0 20px rgba(255,209,102,0.8))' }}
        >
          👑
        </div>

        {/* Subtitle */}
        <p
          className="font-fairy text-xl md:text-2xl mb-4 tracking-wide hero-subtitle"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(20px)', transition: 'all 1s ease 0.3s' }}
        >
          Welcome to the magical world of
        </p>

        {/* Animated Name */}
        <h1
          ref={titleRef}
          className="font-display font-black text-[5rem] md:text-[9rem] lg:text-[11rem] leading-none mb-2"
          style={{ lineHeight: 1 }}
        >
          {name.map((letter, i) => (
            <span
              key={i}
              className="inline-block text-gradient-magical"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0) rotate(0deg)' : 'translateY(60px) rotate(10deg)',
                transition: `all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${0.5 + i * 0.1}s`,
                filter: 'drop-shadow(0 4px 20px rgba(255,107,157,0.4))',
              }}
            >
              {letter}
            </span>
          ))}
        </h1>

        {/* Tagline */}
        <p
          className="font-body italic text-xl md:text-3xl mt-4 mb-10 hero-tagline"
          style={{ opacity: mounted ? 1 : 0, transition: 'all 1s ease 1.2s' }}
        >
          Our most precious flower 🌸 3 months of pure magic
        </p>

        {/* Age Stats */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(30px)', transition: 'all 1s ease 1.5s' }}
        >
          {[
            { value: age.months, label: 'Months Old', emoji: '🌙' },
            { value: age.weeks,  label: 'Weeks Old',  emoji: '🌟' },
            { value: age.days,   label: 'Days Old',   emoji: '☀️' },
            { value: age.hours,  label: 'Hours Old',  emoji: '⭐' },
          ].map((stat, i) => (
            <div
              key={i}
              className="glass rounded-3xl p-5 garden-glow border border-white/40"
              style={{ '--rotate': `${(i % 2 === 0 ? 1 : -1) * (i + 1)}deg` } as React.CSSProperties}
            >
              <div className="text-3xl mb-1">{stat.emoji}</div>
              <div
                className="font-display font-bold text-3xl md:text-4xl text-gradient-rose"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {stat.value.toLocaleString()}
              </div>
              <div className="font-body text-sm mt-1 stat-label-text">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div
          className="mt-16 flex flex-col items-center gap-2 text-garden-rose/60"
          style={{ opacity: mounted ? 1 : 0, transition: 'all 1s ease 2s' }}
        >
          <span className="font-fairy text-sm" style={{color:'#6B2FA0', fontWeight:600}}>Scroll to explore her magical world</span>
          <div className="flex flex-col items-center gap-1 animate-bounce-soft">
            <div className="w-0.5 h-8 bg-gradient-to-b from-garden-rose to-transparent rounded-full" />
            <span className="text-lg">🌸</span>
          </div>
        </div>
      </div>

      {/* Bottom flowers */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around text-4xl pb-4 opacity-50">
        {['🌿','🌸','🌿','🌺','🍀','🌷','🍀','🌼','🌿'].map((f,i)=>(
          <span key={i} style={{ display:'inline-block', animation:`float ${4+i*0.5}s ease-in-out infinite`, animationDelay:`${i*0.2}s` }}>{f}</span>
        ))}
      </div>
    </section>
  )
}
