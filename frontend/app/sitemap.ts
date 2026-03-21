import type { MetadataRoute } from "next"
import { blogPosts } from "./(marketing)/blog/posts"
import { resumeExamples } from "./(marketing)/resume-examples/data"
import { coverLetterExamples } from "./(marketing)/cover-letter-examples/data"
import { competitors } from "./(marketing)/alternatives/data"

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://matchmyresumes.com"

    const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }))

    const resumeExampleEntries: MetadataRoute.Sitemap = resumeExamples.map((ex) => ({
        url: `${baseUrl}/resume-examples/${ex.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }))

    const coverLetterEntries: MetadataRoute.Sitemap = coverLetterExamples.map((ex) => ({
        url: `${baseUrl}/cover-letter-examples/${ex.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }))

    const alternativeEntries: MetadataRoute.Sitemap = competitors.map((c) => ({
        url: `${baseUrl}/alternatives/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/ats-score-checker`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/resume-job-description-match`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/ai-resume-optimizer`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/cover-letter-generator`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/resume-examples`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        ...resumeExampleEntries,
        {
            url: `${baseUrl}/cover-letter-examples`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        ...coverLetterEntries,
        {
            url: `${baseUrl}/alternatives`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        ...alternativeEntries,
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        ...blogEntries,
        {
            url: `${baseUrl}/sign-in`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/sign-up`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ]
}
