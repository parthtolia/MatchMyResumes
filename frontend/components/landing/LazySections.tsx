"use client"
import dynamic from "next/dynamic"

const LandingSections = dynamic(() => import("./LandingSections"), {
  loading: () => <div className="min-h-screen" />,
})

export default function LazySections() {
  return <LandingSections />
}
