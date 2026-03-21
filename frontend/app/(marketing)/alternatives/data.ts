export interface Competitor {
  slug: string
  name: string
  shortName: string
  description: string
  website: string
  pricing: string
  comparison: {
    feature: string
    matchMyResumes: string | boolean
    competitor: string | boolean
  }[]
}

export const competitors: Competitor[] = [
  {
    slug: "resumeworded",
    name: "ResumeWorded",
    shortName: "ResumeWorded",
    description:
      "ResumeWorded is an online resume optimizer that provides feedback on resume content and formatting. However, it lacks ATS scoring and real job matching capabilities.",
    website: "resumeworded.com",
    pricing: "Free (limited), Premium ($3-5/month)",
    comparison: [
      {
        feature: "ATS Resume Score",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Resume vs Job Description Matching",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "AI Resume Optimization",
        matchMyResumes: true,
        competitor: true,
      },
      {
        feature: "Cover Letter Generation",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Completely Free All Features",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Keyword Gap Analysis",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Application Tracking",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "No Signup Required",
        matchMyResumes: true,
        competitor: false,
      },
    ],
  },
  {
    slug: "jobscan",
    name: "Jobscan",
    shortName: "Jobscan",
    description:
      "Jobscan offers ATS resume checking and keyword matching against job descriptions. However, it charges per scan and lacks AI-powered resume optimization and cover letter generation.",
    website: "jobscan.co",
    pricing: "Free (1 scan/month), Premium ($99-199/year)",
    comparison: [
      {
        feature: "ATS Resume Score",
        matchMyResumes: true,
        competitor: true,
      },
      {
        feature: "Resume vs Job Description Matching",
        matchMyResumes: true,
        competitor: true,
      },
      {
        feature: "AI Resume Optimization",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Cover Letter Generation",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Completely Free All Features",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Pay Per Scan Model",
        matchMyResumes: false,
        competitor: true,
      },
      {
        feature: "Application Tracking",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Unlimited Checks",
        matchMyResumes: true,
        competitor: false,
      },
    ],
  },
  {
    slug: "resume-io",
    name: "Resume.io",
    shortName: "Resume.io",
    description:
      "Resume.io is primarily a resume builder with templates. While it offers editing tools, it lacks ATS scoring, AI optimization, and comprehensive job matching features.",
    website: "resume.io",
    pricing: "Free (limited), Premium ($2.99-8.99/month)",
    comparison: [
      {
        feature: "ATS Resume Score",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Resume Templates",
        matchMyResumes: false,
        competitor: true,
      },
      {
        feature: "AI Resume Optimization",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Cover Letter Generation",
        matchMyResumes: true,
        competitor: true,
      },
      {
        feature: "Job Description Matching",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Completely Free All Features",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Keyword Gap Analysis",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "No Paywall Features",
        matchMyResumes: true,
        competitor: false,
      },
    ],
  },
  {
    slug: "enhancv",
    name: "Enhancv",
    shortName: "Enhancv",
    description:
      "Enhancv is a resume builder focused on visual design. It offers some optimization suggestions but lacks ATS scoring, real job matching, and AI-powered resume optimization.",
    website: "enhancv.com",
    pricing: "Free (limited), Premium ($9.99-19.99/month)",
    comparison: [
      {
        feature: "ATS Resume Score",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Resume Design Templates",
        matchMyResumes: false,
        competitor: true,
      },
      {
        feature: "AI Resume Optimization",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Cover Letter Generation",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Job Description Matching",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Completely Free All Features",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "Keyword Analysis",
        matchMyResumes: true,
        competitor: false,
      },
      {
        feature: "No Credit Card Required",
        matchMyResumes: true,
        competitor: false,
      },
    ],
  },
]

export function getCompetitorBySlug(slug: string): Competitor | undefined {
  return competitors.find((c) => c.slug === slug)
}
