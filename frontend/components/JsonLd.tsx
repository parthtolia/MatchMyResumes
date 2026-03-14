export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MatchMyResumes",
    url: "https://matchmyresumes.com",
    logo: "https://matchmyresumes.com/icon.png",
    description: "AI-powered ATS resume optimization suite.",
    sameAs: [],
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
    description: "Optimize your resume for ATS, generate tailored cover letters, and track your job applications with AI-powered insights.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free tier available with premium plans",
    },
    featureList: [
      "ATS Resume Scoring",
      "AI Resume Optimization",
      "Cover Letter Generation",
      "Job Description Analysis",
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function FaqJsonLd() {
  const faqs = [
    { q: "What is an ATS and why does it matter?", a: "Applicant Tracking Systems (ATS) are software tools used by 99% of Fortune 500 companies to automatically filter resumes before a human ever sees them. A low ATS score means your resume gets rejected automatically, regardless of your qualifications." },
    { q: "How does the ATS Score work?", a: "We analyze your resume across 5 dimensions: Keyword Match, Semantic Match, Formatting, Quantification, and Section Completeness. Each is scored 0–100 and weighted to produce an overall compatibility score against your target job description." },
    { q: "Does the AI Optimizer fabricate experience?", a: "Never. Our AI only restructures and enhances existing content — it never invents skills, roles, or achievements you don't have. It integrates relevant keywords naturally while preserving 100% of your authentic experience." },
    { q: "What file formats are supported?", a: "We support PDF and DOCX resume uploads. For best results, use a standard single-column PDF without complex tables or graphics." },
    { q: "Is my data secure?", a: "Yes. Your resumes and job descriptions are stored securely in an encrypted database and are only accessible to you. We never share your data with third parties or use it to train AI models." },
    { q: "Can I cancel my subscription anytime?", a: "Absolutely. There are no contracts or lock-ins. Cancel anytime from your account settings and you'll retain access until the end of your billing period." },
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
