'use client'
import { useEffect, useState } from 'react'

const PETALS = ['🌸', '🌺', '🌼', '🍀', '🦋', '✨', '💫', '🌷', '⭐', '🌻']

interface Petal {
  id: number
  emoji: string
  left: number
  delay: number
  duration: number
  size: number
}

export default function FloatingPetals() {
  const [petals, setPetals] = useState<Petal[]>([])

  useEffect(() => {
    const generated: Petal[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      emoji: PETALS[i % PETALS.length],
      left: Math.random() * 100,
      delay: Math.random() * 12,
      duration: 8 + Math.random() * 8,
      size: 12 + Math.random() * 18,
    }))
    setPetals(generated)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {petals.map(p => (
        <div
          key={p.id}
          className="absolute select-none"
          style={{
            left: `${p.left}%`,
            top: '-30px',
            fontSize: `${p.size}px`,
            animationName: 'petal-fall',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            opacity: 0,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  )
}
