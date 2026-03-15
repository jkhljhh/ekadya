'use client'
import { useEffect, useRef } from 'react'

export default function MagicCursor() {
  const mainRef  = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)
  const sparklesRef = useRef<HTMLDivElement[]>([])
  const mousePos = useRef({ x: 0, y: 0 })
  const trailPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const main  = mainRef.current
    const trail = trailRef.current
    if (!main || !trail) return

    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      main.style.left = e.clientX + 'px'
      main.style.top  = e.clientY + 'px'

      // Occasionally spawn sparkle
      if (Math.random() < 0.15) spawnSparkle(e.clientX, e.clientY)
    }

    const onDown = () => {
      main.classList.add('clicking')
      trail.classList.add('clicking')
    }
    const onUp = () => {
      main.classList.remove('clicking')
      trail.classList.remove('clicking')
    }

    // Trail animation
    let raf: number
    const animateTrail = () => {
      trailPos.current.x += (mousePos.current.x - trailPos.current.x) * 0.12
      trailPos.current.y += (mousePos.current.y - trailPos.current.y) * 0.12
      trail.style.left = trailPos.current.x + 'px'
      trail.style.top  = trailPos.current.y + 'px'
      raf = requestAnimationFrame(animateTrail)
    }
    animateTrail()

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('mouseup', onUp)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mouseup', onUp)
      cancelAnimationFrame(raf)
    }
  }, [])

  function spawnSparkle(x: number, y: number) {
    const el = document.createElement('div')
    const size = 6 + Math.random() * 8
    const emojis = ['✨', '🌸', '⭐', '💫', '🦋', '🌺']
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)]
    const dx1 = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 20)
    const dy1 = -(10 + Math.random() * 20)
    const dx2 = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 30)
    const dy2 = -(30 + Math.random() * 30)
    el.style.cssText = `
      position:fixed; left:${x}px; top:${y}px;
      font-size:${size}px; pointer-events:none; z-index:99997;
      transform:translate(-50%,-50%);
      --sx: calc(-50% + ${dx1}px); --sy: calc(-50% + ${dy1}px);
      --ex: calc(-50% + ${dx2}px); --ey: calc(-50% + ${dy2}px);
      animation: sparkle-fly 0.8s ease-out forwards;
    `
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 800)
  }

  return (
    <>
      <style>{`
        @keyframes sparkle-fly {
          0%   { transform:translate(-50%,-50%) scale(0) rotate(0deg); opacity:1; }
          50%  { transform:translate(var(--sx, -50%), var(--sy, -50%)) scale(1.2) rotate(180deg); opacity:1; }
          100% { transform:translate(var(--ex, -50%), var(--ey, -50%)) scale(0) rotate(360deg); opacity:0; }
        }
      `}</style>
      <div ref={mainRef}  className="cursor-main"  />
      <div ref={trailRef} className="cursor-trail" />
    </>
  )
}
