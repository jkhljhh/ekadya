import { getGallery, getMilestones, getLoveLetters } from '@/lib/supabase'
import MagicCursor from './components/MagicCursor'
import FloatingPetals from './components/FloatingPetals'
import Navigation from './components/Navigation'
import HeroSection from './components/HeroSection'
import GallerySection from './components/GallerySection'
import MilestoneTimeline from './components/MilestoneTimeline'
import LoveLettersSection from './components/LoveLettersSection'
import AgeCounterSection from './components/AgeCounterSection'
import Footer from './components/Footer'

export const revalidate = 60 // revalidate every minute

export default async function Home() {
  // Fetch data from Supabase — falls back to demo data if tables are empty
  const [gallery, milestones, letters] = await Promise.all([
    getGallery().catch(() => []),
    getMilestones().catch(() => []),
    getLoveLetters().catch(() => []),
  ])

  return (
    <main className="relative">
      <MagicCursor />
      <FloatingPetals />
      <Navigation />
      <HeroSection />
      <GallerySection items={gallery} />
      <MilestoneTimeline milestones={milestones} />
      <LoveLettersSection letters={letters} />
      <AgeCounterSection />
      <Footer />
    </main>
  )
}
