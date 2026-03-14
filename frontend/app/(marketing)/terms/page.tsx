import Link from "next/link"
import { Logo } from "@/components/ui/Logo"

export const metadata = {
  title: "Terms of Service – MatchMyResumes",
  description: "Read the terms and conditions for using MatchMyResumes, including acceptable use, subscriptions, and data handling.",
  alternates: { canonical: "https://matchmyresumes.com/terms" },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5">
        <Link href="/"><Logo /></Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← Back to Home</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: March 2026</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-400 leading-relaxed">By accessing or using MatchMyResumes, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
          <p className="text-gray-400 leading-relaxed">MatchMyResumes provides AI-powered resume optimization, ATS scoring, cover letter generation, and job application tracking tools. The service is provided on an "as is" basis and features may change over time.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
          <p className="text-gray-400 leading-relaxed">You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access to your account. You must be at least 16 years old to use this service.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">4. Acceptable Use</h2>
          <ul className="text-gray-400 space-y-2 list-disc list-inside leading-relaxed">
            <li>You may not use the service for any unlawful purpose</li>
            <li>You may not attempt to reverse-engineer, scrape, or exploit the service</li>
            <li>You may not upload malicious files or content that infringes third-party rights</li>
            <li>You may not share your account with others or resell access to the service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">5. Intellectual Property</h2>
          <p className="text-gray-400 leading-relaxed">You retain all rights to your resume content and uploaded files. By using the service, you grant MatchMyResumes a limited license to process your content solely to provide the requested features. The MatchMyResumes platform, branding, and technology remain the property of MatchMyResumes.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">6. Subscriptions and Billing</h2>
          <p className="text-gray-400 leading-relaxed">Paid subscriptions are billed monthly in advance. You may cancel at any time and will retain access until the end of your current billing period. We do not offer refunds for partial months. Prices may change with 30 days notice.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">7. Disclaimer of Warranties</h2>
          <p className="text-gray-400 leading-relaxed">MatchMyResumes does not guarantee job placement or interview callbacks. ATS scores are estimates based on algorithmic analysis and may not reflect the exact scoring of any specific employer's ATS system. Results may vary.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h2>
          <p className="text-gray-400 leading-relaxed">To the maximum extent permitted by law, MatchMyResumes shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">9. Changes to Terms</h2>
          <p className="text-gray-400 leading-relaxed">We reserve the right to update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
          <p className="text-gray-400 leading-relaxed">For questions about these terms, contact us at <a href="mailto:support@matchmyresumes.com" className="text-violet-400 hover:text-violet-300">support@matchmyresumes.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
