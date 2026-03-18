"use client"

import Link from "next/link"
import { useState } from "react"
import type { ResumeExample } from "./data"

const categories = [
  "All",
  "Technology",
  "Healthcare",
  "Finance",
  "Marketing",
  "Education",
  "Design",
  "Management",
  "Data & Analytics",
]

export function ResumeExamplesGrid({
  examples,
}: {
  examples: ResumeExample[]
}) {
  const [activeCategory, setActiveCategory] = useState("All")

  const filtered =
    activeCategory === "All"
      ? examples
      : examples.filter((e) => e.category === activeCategory)

  return (
    <>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-violet-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((example) => (
          <article
            key={example.slug}
            className="group rounded-2xl border border-white/10 bg-[#111118] p-6 hover:border-violet-500/40 transition-all flex flex-col"
          >
            <span className="inline-block w-fit text-xs font-medium text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full mb-4">
              {example.category}
            </span>
            <Link href={`/resume-examples/${example.slug}`}>
              <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">
                {example.title}
              </h2>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-5 flex-1">
              {example.description}
            </p>
            <Link
              href={`/resume-examples/${example.slug}`}
              className="text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
            >
              View Example &rarr;
            </Link>
          </article>
        ))}
      </div>
    </>
  )
}
