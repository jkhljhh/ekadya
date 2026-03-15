'use client'
import { useEffect, useRef, useState } from 'react'

const BIRTH_DATE = new Date('2025-12-10') // Ekadya's birth date — Dec 10, 2025

function getFullAge() {
  const now  = new Date()
  const diff = now.getTime() - BIRTH_DATE.getTime()
  const totalSeconds = Math.floor(diff / 1000)
  const totalMinutes = Math.floor(diff / 60000)
  const totalHours   = Math.floor(diff / 3600000)
  const totalDays    = Math.floor(diff / 86400000)
  const totalWeeks   = Math.floor(totalDays / 7)
  const totalMonths  = Math.floor(totalDays / 30.44)

  const months = Math.floor(totalDays / 30.44)
  const remDays = Math.floor(totalDays - months * 30.44)
  const hours   = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()

  return { totalSeconds, totalMinutes, totalHours, totalDays, totalWeeks, totalMonths, months, remDays, hours, minutes, seconds }
}

function Digit({ value, label }: { value: number; label: string }) {
  const [prev, setPrev] = useState(value)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (value !== prev) {
      setAnimate(true)
      const t = setTimeout(() => { setPrev(value); setAnimate(false) }, 400)
      return () => clearTimeout(t)
    }
  }, [value, prev])

  return (
    <div className="flex flex-col items-center">
      <div className="glass rounded-2xl p-4 md:p-6 min-w-[80px] md:min-w-[100px] text-center garden-glow border border-white/30 overflow-hidden relative">
        <div
          className={`font-display font-black text-3xl md:text-5xl text-gradient-rose transition-all duration-400 ${animate ? 'translate-y-[-20px] opacity-0' : 'translate-y-0 opacity-100'}`}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {String(value).padStart(2, '0')}
        </div>
      </div>
      <p className="font-fairy text-xs mt-2 text-center" style={{color:'#5A1F8A', fontWeight:600}}>{label}</p>
    </div>
  )
}

export default function AgeCounterSection() {
  const [age, setAge] = useState(getFullAge())
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()

  }, [])

  useEffect(() => {
    const interval = setInterval(() => setAge(getFullAge()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section ref={sectionRef} id="age" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF0FA] via-[#FDE8FF] to-[#E8F4FF]" />
      <div className="orb absolute w-96 h-96 bg-[#FFD6E0] opacity-25 -top-20 left-1/2 -translate-x-1/2" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-5xl mb-4" style={{ animation: 'float 4s ease-in-out infinite' }}>⏰</div>
          <h2 className="font-display font-black text-5xl md:text-7xl text-gradient-rose mb-4">
            She Has Been<br/>With Us For...
          </h2>
          <p className="font-body italic text-xl mb-16" style={{color:'#5A1F8A', fontWeight:500}}>
            Every second is a gift. Every moment, precious.
          </p>

          {/* Live Clock */}
          <div className="flex items-center justify-center gap-3 md:gap-6 mb-16">
            <Digit value={age.months}  label="Months"  />
            <div className="text-garden-rose text-3xl font-bold pb-6">:</div>
            <Digit value={age.remDays} label="Days"    />
            <div className="text-garden-rose text-3xl font-bold pb-6">:</div>
            <Digit value={age.hours}   label="Hours"   />
            <div className="text-garden-rose text-3xl font-bold pb-6">:</div>
            <Digit value={age.minutes} label="Minutes" />
            <div className="text-garden-rose text-3xl font-bold pb-6">:</div>
            <Digit value={age.seconds} label="Seconds" />
          </div>

          {/* Fun stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Days',    value: age.totalDays.toLocaleString(),    emoji: '🌞' },
              { label: 'Total Hours',   value: age.totalHours.toLocaleString(),   emoji: '⭐' },
              { label: 'Total Minutes', value: age.totalMinutes.toLocaleString(), emoji: '💫' },
              { label: 'Total Seconds', value: age.totalSeconds.toLocaleString(), emoji: '✨' },
            ].map((s, i) => (
              <div key={i} className="glass rounded-3xl p-5 border border-white/30">
                <div className="text-2xl mb-2">{s.emoji}</div>
                <div className="font-display font-bold text-xl md:text-2xl text-gradient-rose" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {s.value}
                </div>
                <div className="font-fairy text-xs mt-1" style={{color:'#5A1F8A', fontWeight:600}}>{s.label}</div>
              </div>
            ))}
          </div>

          <p className="font-fairy text-garden-rose text-lg mt-10" style={{ animation: 'pulse-soft 3s ease-in-out infinite' }}>
            🌸 And counting... every second more magical than the last 🌸
          </p>
        </div>
      </div>
    </section>
  )
}
