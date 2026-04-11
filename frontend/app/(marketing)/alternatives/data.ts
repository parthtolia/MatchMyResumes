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
  {
    slug: "zety",
    name: "Zety",
    shortName: "Zety",
    description: "Zety is a resume builder focused on visually polished templates. While it helps with formatting and design, it lacks real ATS scoring, job description matching, and AI-powered optimization — the features that actually get resumes past automated screeners.",
    website: "zety.com",
    pricing: "Free (limited), Premium ($5.99-23.70/month)",
    comparison: [
      { feature: "ATS Resume Score", matchMyResumes: true, competitor: false },
      { feature: "Resume vs Job Description Matching", matchMyResumes: true, competitor: false },
      { feature: "AI Resume Optimization", matchMyResumes: true, competitor: false },
      { feature: "Cover Letter Generation", matchMyResumes: true, competitor: true },
      { feature: "Completely Free All Features", matchMyResumes: true, competitor: false },
      { feature: "Keyword Gap Analysis", matchMyResumes: true, competitor: false },
      { feature: "Application Tracking", matchMyResumes: true, competitor: false },
      { feature: "No Signup Required", matchMyResumes: true, competitor: false },
    ],
  },
  {
    slug: "kickresume",
    name: "Kickresume",
    shortName: "Kickresume",
    description: "Kickresume offers resume templates and basic AI writing suggestions. However, it doesn't provide real ATS compatibility scoring or job description matching — critical tools for today's job market where 75% of resumes are rejected by ATS before a human sees them.",
    website: "kickresume.com",
    pricing: "Free (limited), Premium ($19/month)",
    comparison: [
      { feature: "ATS Resume Score", matchMyResumes: true, competitor: false },
      { feature: "Resume vs Job Description Matching", matchMyResumes: true, competitor: false },
      { feature: "AI Resume Optimization", matchMyResumes: true, competitor: true },
      { feature: "Cover Letter Generation", matchMyResumes: true, competitor: true },
      { feature: "Completely Free All Features", matchMyResumes: true, competitor: false },
      { feature: "Keyword Gap Analysis", matchMyResumes: true, competitor: false },
      { feature: "Application Tracking", matchMyResumes: true, competitor: false },
      { feature: "No Signup Required", matchMyResumes: true, competitor: false },
    ],
  },
  {
    slug: "novorume",
    name: "Novoresume",
    shortName: "Novoresume",
    description: "Novoresume provides visually appealing resume templates with a drag-and-drop builder. While it handles formatting well, it lacks the core analytical features — ATS scoring, job description keyword matching, and AI optimization — that modern job seekers need to maximize their chances.",
    website: "novoresume.com",
    pricing: "Free (basic), Premium ($9.99-19.99/month)",
    comparison: [
      { feature: "ATS Resume Score", matchMyResumes: true, competitor: false },
      { feature: "Resume vs Job Description Matching", matchMyResumes: true, competitor: false },
      { feature: "AI Resume Optimization", matchMyResumes: true, competitor: false },
      { feature: "Cover Letter Generation", matchMyResumes: true, competitor: true },
      { feature: "Completely Free All Features", matchMyResumes: true, competitor: false },
      { feature: "Keyword Gap Analysis", matchMyResumes: true, competitor: false },
      { feature: "Application Tracking", matchMyResumes: true, competitor: false },
      { feature: "No Signup Required", matchMyResumes: true, competitor: false },
    ],
  },
  {
    slug: "rezi",
    name: "Rezi",
    shortName: "Rezi",
    description: "Rezi focuses on ATS-friendly resume formatting and includes some keyword analysis. However, its real-time job description matching and AI optimization are limited in the free tier, and its ATS scoring methodology is less comprehensive than tools built specifically for matching accuracy.",
    website: "rezi.ai",
    pricing: "Free (limited), Pro ($29/month), Lifetime ($129)",
    comparison: [
      { feature: "ATS Resume Score", matchMyResumes: true, competitor: true },
      { feature: "Resume vs Job Description Matching", matchMyResumes: true, competitor: false },
      { feature: "AI Resume Optimization", matchMyResumes: true, competitor: true },
      { feature: "Cover Letter Generation", matchMyResumes: true, competitor: true },
      { feature: "Completely Free All Features", matchMyResumes: true, competitor: false },
      { feature: "Keyword Gap Analysis", matchMyResumes: true, competitor: false },
      { feature: "Application Tracking", matchMyResumes: true, competitor: false },
      { feature: "No Signup Required", matchMyResumes: true, competitor: false },
    ],
  },
  {
    slug: "topresume",
    name: "TopResume",
    shortName: "TopResume",
    description: "TopResume is a professional resume writing service where human writers revise your resume — for a significant fee. If you're looking for an automated, instant, and free way to optimize your resume with ATS scoring and AI assistance, TopResume operates in a completely different model.",
    website: "topresume.com",
    pricing: "Resume writing services from $149-$349+",
    comparison: [
      { feature: "ATS Resume Score", matchMyResumes: true, competitor: false },
      { feature: "Resume vs Job Description Matching", matchMyResumes: true, competitor: false },
      { feature: "AI Resume Optimization", matchMyResumes: true, competitor: false },
      { feature: "Cover Letter Generation", matchMyResumes: true, competitor: true },
      { feature: "Completely Free All Features", matchMyResumes: true, competitor: false },
      { feature: "Keyword Gap Analysis", matchMyResumes: true, competitor: false },
      { feature: "Application Tracking", matchMyResumes: true, competitor: false },
      { feature: "No Signup Required", matchMyResumes: true, competitor: false },
    ],
  },
  {
    slug: "linkedin-resume-builder",
    name: "LinkedIn Resume Builder",
    shortName: "LinkedIn",
    description: "LinkedIn's resume builder auto-populates your profile into a resume format. While convenient for LinkedIn users, it lacks ATS scoring, job description matching, AI optimization, and keyword analysis — and the resulting resumes are often generic and difficult to customize for specific roles.",
    website: "linkedin.com/resume-builder",
    pricing: "Free with LinkedIn account (Premium features require $39.99/month LinkedIn Premium)",
    comparison: [
      { feature: "ATS Resume Score", matchMyResumes: true, competitor: false },
      { feature: "Resume vs Job Description Matching", matchMyResumes: true, competitor: false },
      { feature: "AI Resume Optimization", matchMyResumes: true, competitor: false },
      { feature: "Cover Letter Generation", matchMyResumes: true, competitor: false },
      { feature: "Completely Free All Features", matchMyResumes: true, competitor: false },
      { feature: "Keyword Gap Analysis", matchMyResumes: true, competitor: false },
      { feature: "Application Tracking", matchMyResumes: true, competitor: false },
      { feature: "No Signup Required", matchMyResumes: true, competitor: false },
    ],
  },
  {
    slug: "canva-resume-builder",
    name: "Canva Resume Builder",
    shortName: "Canva",
    description: "Canva's resume builder excels at visual design, offering hundreds of visually striking templates. However, visually complex Canva resumes often fail ATS parsing entirely — the very systems that screen 75%+ of job applications. MatchMyResumes prioritizes ATS compatibility alongside AI optimization.",
    website: "canva.com/resumes",
    pricing: "Free (basic templates), Canva Pro $12.99/month (premium templates)",
    comparison: [
      { feature: "ATS Resume Score", matchMyResumes: true, competitor: false },
      { feature: "Resume vs Job Description Matching", matchMyResumes: true, competitor: false },
      { feature: "AI Resume Optimization", matchMyResumes: true, competitor: false },
      { feature: "Cover Letter Generation", matchMyResumes: true, competitor: false },
      { feature: "Completely Free All Features", matchMyResumes: true, competitor: false },
      { feature: "Keyword Gap Analysis", matchMyResumes: true, competitor: false },
      { feature: "Application Tracking", matchMyResumes: true, competitor: false },
      { feature: "ATS-Compatible Output", matchMyResumes: true, competitor: false },
    ],
  },
  {
    slug: "indeed-resume-builder",
    name: "Indeed Resume Builder",
    shortName: "Indeed",
    description: "Indeed's resume builder creates a basic resume stored on Indeed's platform, which makes applying to Indeed jobs faster. However, it lacks ATS scoring, AI optimization, cover letter generation, and keyword analysis — and resumes are designed for Indeed's ecosystem rather than optimized for ATS systems across all job boards.",
    website: "indeed.com/create-resume",
    pricing: "Free",
    comparison: [
      { feature: "ATS Resume Score", matchMyResumes: true, competitor: false },
      { feature: "Resume vs Job Description Matching", matchMyResumes: true, competitor: false },
      { feature: "AI Resume Optimization", matchMyResumes: true, competitor: false },
      { feature: "Cover Letter Generation", matchMyResumes: true, competitor: false },
      { feature: "Completely Free All Features", matchMyResumes: true, competitor: true },
      { feature: "Keyword Gap Analysis", matchMyResumes: true, competitor: false },
      { feature: "Application Tracking", matchMyResumes: true, competitor: false },
      { feature: "No Signup Required", matchMyResumes: true, competitor: false },
    ],
  },
]

export function getCompetitorBySlug(slug: string): Competitor | undefined {
  return competitors.find((c) => c.slug === slug)
}
