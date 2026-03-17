import Link from "next/link"
import { Logo } from "@/components/ui/Logo"

export const metadata = {
  title: "Privacy Policy – MatchMyResumes",
  description: "Learn how MatchMyResumes collects, uses, and protects your personal data, resumes, and job descriptions.",
  alternates: { canonical: "https://matchmyresumes.com/privacy" },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <Link href="/"><Logo /></Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← Back to Home</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16 prose prose-invert prose-sm">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: March 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
          <p className="text-gray-400 leading-relaxed">We collect information you provide directly — including your name, email address, resume files, and job descriptions you upload. We also collect usage data such as pages visited, features used, and performance metrics to improve the service.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
          <ul className="text-gray-400 space-y-2 list-disc list-inside leading-relaxed">
            <li>To provide and improve MatchMyResumes features (ATS scoring, AI optimization, cover letter generation)</li>
            <li>To authenticate your account</li>
            <li>To send transactional emails (account confirmations)</li>
            <li>To analyze aggregate usage trends for product improvement</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">3. Data Storage and Security</h2>
          <p className="text-gray-400 leading-relaxed">Your data is stored in encrypted databases hosted on secure cloud infrastructure. Resume files and job descriptions are only accessible by you. We use industry-standard TLS encryption for all data in transit and AES-256 encryption for data at rest.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">4. AI Processing</h2>
          <p className="text-gray-400 leading-relaxed">Your resume and job description content is sent to third-party AI providers (Groq, Google Gemini) solely to provide analysis and optimization results. Your data is not used to train AI models and is not stored by these providers beyond the immediate request.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">5. Third-Party Services</h2>
          <p className="text-gray-400 leading-relaxed">We use Clerk for authentication and Supabase for database hosting. Each of these services has their own privacy policies and data handling practices. We share only the minimum data necessary for these services to function.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">6. Data Retention</h2>
          <p className="text-gray-400 leading-relaxed">We retain your account data for as long as your account is active. You may request deletion of your account and all associated data at any time by contacting us at <a href="mailto:support@matchmyresumes.com" className="text-violet-400 hover:text-violet-300">support@matchmyresumes.com</a>.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
          <p className="text-gray-400 leading-relaxed">You have the right to access, correct, export, or delete your personal data at any time. To exercise these rights, contact us at the email below.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">8. Contact</h2>
          <p className="text-gray-400 leading-relaxed">For privacy-related questions, contact us at <a href="mailto:support@matchmyresumes.com" className="text-violet-400 hover:text-violet-300">support@matchmyresumes.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
