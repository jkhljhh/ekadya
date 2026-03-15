export default function Footer() {
  return (
    <footer className="relative py-20 px-6 overflow-hidden bg-[#1A0A2E]">
      <div className="orb absolute w-80 h-80 bg-[#C9B1FF] opacity-10 top-0 left-1/2 -translate-x-1/2" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <div className="text-6xl mb-6" style={{ animation: 'float 5s ease-in-out infinite' }}>🌸</div>
        <h3 className="font-display font-black text-4xl md:text-5xl text-gradient-rose mb-4">
          Ekadya
        </h3>
        <p className="font-body italic text-lg mb-2" style={{color:'rgba(201,177,255,0.9)', textShadow:'0 1px 4px rgba(0,0,0,0.3)'}}>
          Born to bloom. Destined to shine.
        </p>
        <p className="font-fairy text-sm" style={{color:'rgba(201,177,255,0.55)'}}>
          Made with infinite love 💕
        </p>

        <div className="flex justify-center gap-3 mt-8 text-2xl">
          {['🌸','🌺','🌼','🌷','✨','💫','⭐','🦋','🌿'].map((f, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                animation: `float ${3+i*0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                opacity: 0.7,
              }}
            >
              {f}
            </span>
          ))}
        </div>

        <p className="font-fairy text-xs mt-8" style={{color:'rgba(201,177,255,0.3)'}}>
          © {new Date().getFullYear()} — A magical world created for the most precious flower 🌸
        </p>
      </div>
    </footer>
  )
}
