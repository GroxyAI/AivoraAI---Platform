"use client"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TermsPage() {
  const router = useRouter()

  return (
    <AppLayout>
      <div className="min-h-screen bg-zinc-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold">Terms of Service</h1>
          </div>

          <div className="prose prose-invert max-w-none space-y-8">
            <div className="text-zinc-400 text-sm">Last updated: {new Date().toLocaleDateString()}</div>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-zinc-300 leading-relaxed">
                By accessing and using Aivora.ai, you accept and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Service Description</h2>
              <p className="text-zinc-300 leading-relaxed">
                Aivora.ai is an AI-powered chat platform that allows users to create and interact with AI characters.
                Our service includes character creation, chat functionality, and premium features through our token
                system and Platinum membership.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. User Accounts and Data</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Users can create accounts to save their chat history, characters, and preferences. We offer both local
                storage and cloud storage options:
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                <li>Local storage keeps all data on your device</li>
                <li>Cloud storage syncs data across devices (requires account setup)</li>
                <li>Users control their data storage preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Token System and Platinum Membership</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Our service includes a token-based system for accessing premium AI models:
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                <li>Users earn 10 tokens per successful chat interaction</li>
                <li>Premium models require token expenditure</li>
                <li>Platinum membership (earned after 2 years of usage) provides unlimited access</li>
                <li>Tokens and membership status are non-transferable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Content and Conduct</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Users are responsible for their interactions and content created on the platform:
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                <li>Content filtering is in place to maintain community standards</li>
                <li>Users must comply with our Community Guidelines</li>
                <li>Harmful, illegal, or abusive content is prohibited</li>
                <li>We reserve the right to moderate content and suspend accounts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Privacy and Security</h2>
              <p className="text-zinc-300 leading-relaxed">
                We implement security measures including optional PIN protection for user privacy. Chat data is
                processed to provide AI responses but is not used for training purposes without explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Service Availability</h2>
              <p className="text-zinc-300 leading-relaxed">
                We strive to maintain service availability but cannot guarantee uninterrupted access. Maintenance,
                updates, or technical issues may temporarily affect service availability.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
              <p className="text-zinc-300 leading-relaxed">
                Aivora.ai is provided "as is" without warranties of any kind. We are not liable for any damages arising
                from the use of our service, including but not limited to data loss or service interruptions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. Changes to Terms</h2>
              <p className="text-zinc-300 leading-relaxed">
                We reserve the right to modify these terms at any time. Users will be notified of significant changes,
                and continued use of the service constitutes acceptance of updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">10. Contact Information</h2>
              <p className="text-zinc-300 leading-relaxed">
                For questions about these Terms of Service, please contact us through the app's support features or
                account settings.
              </p>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
