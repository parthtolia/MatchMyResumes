export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MatchMyResumes",
    url: "https://matchmyresumes.com",
    logo: "https://matchmyresumes.com/icon.png",
    description: "Match my resume to any job description. Free AI-powered ATS resume scoring, optimization, and cover letter generation.",
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function WebAppJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "MatchMyResumes",
    url: "https://matchmyresumes.com",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    description: "Match my resume to any job description. Free ATS scoring, AI resume optimization, cover letter generation, and keyword gap analysis.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Completely free — all features, no limits",
    },
    featureList: [
      "Match Resume to Job Description",
      "ATS Resume Scoring",
      "AI Resume Optimization",
      "Cover Letter Generation",
      "Keyword Gap Analysis",
      "Application Tracking",
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function BlogPostingJsonLd({ post }: { post: { title: string; description: string; date: string; slug: string } }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: `https://matchmyresumes.com/blog/${post.slug}`,
    author: {
      "@type": "Organization",
      name: "MatchMyResumes",
      url: "https://matchmyresumes.com",
    },
    publisher: {
      "@type": "Organization",
      name: "MatchMyResumes",
      logo: {
        "@type": "ImageObject",
        url: "https://matchmyresumes.com/icon.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://matchmyresumes.com/blog/${post.slug}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function ToolPageJsonLd({
  title,
  description,
  url,
  faqs,
}: {
  title: string
  description: string
  url: string
  faqs: { q: string; a: string }[]
}) {
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: "MatchMyResumes",
      url: "https://matchmyresumes.com",
    },
  }

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  )
}

export function FaqJsonLd() {
  const faqs = [
    { q: "What is an ATS and why does it matter?", a: "Applicant Tracking Systems (ATS) are software tools used by 99% of Fortune 500 companies to automatically filter resumes before a human ever sees them. A low ATS score means your resume gets rejected automatically, regardless of your qualifications." },
    { q: "How does the ATS Score work?", a: "We analyze your resume across 5 dimensions: Keyword Match, Semantic Match, Formatting, Quantification, and Section Completeness. Each is scored 0–100 and weighted to produce an overall compatibility score against your target job description." },
    { q: "Does the AI Optimizer fabricate experience?", a: "Never. Our AI only restructures and enhances existing content — it never invents skills, roles, or achievements you don't have. It integrates relevant keywords naturally while preserving 100% of your authentic experience." },
    { q: "What file formats are supported?", a: "We support PDF and DOCX resume uploads. For best results, use a standard single-column PDF without complex tables or graphics." },
    { q: "Is my data secure?", a: "Yes. Your resumes and job descriptions are stored securely in an encrypted database and are only accessible to you. We never share your data with third parties or use it to train AI models." },
    { q: "Is MatchMyResumes really free?", a: "Yes! All features — ATS scoring, JD matching, AI resume optimization, cover letter generation, and job tracking — are completely free with no limits." },
  ]

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
