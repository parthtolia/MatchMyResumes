import LandingHero from "@/components/landing/LandingHero"
import LazySections from "@/components/landing/LazySections"
import { FaqJsonLd } from "@/components/JsonLd"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <FaqJsonLd />
      <LandingHero />
      <LazySections />
    </div>
  )
}
