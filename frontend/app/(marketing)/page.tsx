import LandingHero from "@/components/landing/LandingHero"
import LazySections from "@/components/landing/LazySections"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <LandingHero />
      <LazySections />
    </div>
  )
}
