'use client'
import { useEffect, useRef, useState } from 'react'
import type { LoveLetter } from '@/lib/supabase'

interface Props { letters: LoveLetter[] }

const DEFAULT_LETTERS: Omit<LoveLetter, 'id' | 'created_at'>[] = [
  {
    author: 'Mama',
    relation: 'Your Mama',
    color: '#FFD6E0',
    message: 'My darling Ekadya, the moment I held you for the first time, I understood what infinite love feels like. You are my heart walking outside my body. Every tiny breath you take fills my soul with a joy I never knew existed. Watch out world — this little girl is going to bloom into something extraordinary. I promise to water your wings every single day. All my love, forever and always. 🌸',
  },
  {
    author: 'Papa',
    relation: 'Your Papa',
    color: '#C9B1FF',
    message: 'Ekadya, my princess, you arrived and you rewrote the definition of beautiful. I have never been so nervous and so happy at the same time. I promise you — I will slay every dragon, move every mountain, and make sure every day is sprinkled with magic. You are my greatest adventure. 👑',
  },
  {
    author: 'Nani',
    relation: 'Your Nani',
    color: '#B8F0D8',
    message: 'My little flower! How quickly you have wrapped your tiny fingers around every single heart in this family. God has sent us the most precious angel. May your life always be full of laughter, love, and all the sweetness the world holds. Your Nani will always be your biggest fan! 💕',
  },
  {
    author: 'Nanu',
    relation: 'Your Nanu',
    color: '#FFD166',
    message: 'Ekadya — two months! Already you have made this whole family brighter. I cannot wait to spoil you rotten and tell you all the stories. You are our sunshine and the best thing to happen to us. The whole garden bloomed the day you arrived. ⭐',
  },
]

const ROTATIONS = ['-2deg', '1.5deg', '-1deg', '2.5deg', '-1.8deg', '1deg']

export default function LoveLettersSection({ letters }: Props) {
  const displayLetters = letters.length > 0 ? letters : DEFAULT_LETTERS as LoveLetter[]
  const [expanded, setExpanded] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (sectionRef.current) obs.observe(sectionRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="letters" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A0A2E] via-[#2D1B5E] to-[#FFF0FA]" />
      <div className="orb absolute w-96 h-96 bg-[#C9B1FF] opacity-20 top-20 right-0" />
      <div className="orb absolute w-80 h-80 bg-[#FFD6E0] opacity-15 bottom-0 left-0" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-5xl mb-4" style={{ animation: 'float 5s ease-in-out infinite' }}>💌</div>
          <h2 className="font-display font-black text-5xl md:text-7xl mb-4">
            <span className="text-gradient-rose">Letters of Love</span>
          </h2>
          <p className="font-body italic text-xl" style={{color:'#C9B1FF', fontWeight:500, textShadow:'0 1px 4px rgba(0,0,0,0.4)'}}>
            Words from hearts that beat for you, little one
          </p>
        </div>

        {/* Letter Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {displayLetters.map((letter, i) => (
            <div
              key={letter.id || i}
              className={`letter-card cursor-pointer transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
              style={{
                '--rotate': ROTATIONS[i % ROTATIONS.length],
                transitionDelay: `${i * 0.1}s`,
              } as React.CSSProperties}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <div
                className="rounded-3xl p-8 relative overflow-hidden shadow-2xl"
                style={{ background: `linear-gradient(135deg, ${letter.color}dd, ${letter.color}88)` }}
              >
                {/* Decorative corner flowers */}
                <div className="absolute top-3 right-4 text-2xl opacity-30">🌸</div>
                <div className="absolute bottom-3 left-4 text-xl opacity-25">🌺</div>

                {/* Wax seal */}
                <div
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-garden-rose to-garden-violet flex items-center justify-center text-white text-xl shadow-lg mb-4"
                  style={{ boxShadow: `0 0 20px ${letter.color}` }}
                >
                  💖
                </div>

                <div className="font-fairy text-xs mb-1 uppercase tracking-widest" style={{color:'rgba(26,10,46,0.55)'}}>
                  A letter from
                </div>
                <h3 className="font-display font-bold text-2xl mb-1" style={{color:'#1A0A2E'}}>{letter.author}</h3>
                <p className="font-fairy text-sm mb-4" style={{color:'rgba(26,10,46,0.65)'}}>{letter.relation}</p>

                <div
                  className="font-body leading-relaxed text-sm overflow-hidden transition-all duration-500"
                  style={{ maxHeight: expanded === i ? '500px' : '80px', color:'rgba(26,10,46,0.82)', lineHeight:'1.7' }}
                >
                  {letter.message}
                </div>

                <button className="mt-3 font-fairy text-xs hover:opacity-80 transition-opacity flex items-center gap-1" style={{color:'rgba(26,10,46,0.55)'}}>
                  {expanded === i ? '▲ Close' : '▼ Read more'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
