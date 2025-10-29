"use client"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield } from "lucide-react"
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

          <div className="mb-8 p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-400" />
              <h3 className="text-blue-400 font-semibold">UK Online Safety Act 2023 Compliance</h3>
            </div>
            <p className="text-blue-300 text-sm">
              This service complies with the UK Online Safety Act 2023. UK users benefit from enhanced safety measures
              including age verification, content moderation, and reporting systems as required by Ofcom regulations.
            </p>
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
              <h2 className="text-xl font-semibold text-white mb-4">3. UK Online Safety Act 2023 Compliance</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                For users accessing our service from the United Kingdom, we implement additional safety measures in
                compliance with the Online Safety Act 2023:
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                <li>
                  <strong>Age Verification:</strong> UK users require Highly Effective Age Assurance (HEAA) to access
                  certain content
                </li>
                <li>
                  <strong>Content Moderation:</strong> Enhanced filtering for primary priority content harmful to
                  children
                </li>
                <li>
                  <strong>Reporting System:</strong> Comprehensive content reporting and complaints process
                </li>
                <li>
                  <strong>Risk Assessment:</strong> Regular evaluation of content risks and safety measures
                </li>
                <li>
                  <strong>Transparency:</strong> Clear information about our content moderation policies and procedures
                </li>
              </ul>
              <p className="text-zinc-300 leading-relaxed mt-4">
                UK users under 18 are protected from accessing primary priority content including content promoting
                suicide, self-harm, eating disorders, and pornographic material until age verification is completed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. User Accounts and Data</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Users can create accounts to save their chat history, characters, and preferences. We offer both local
                storage and cloud storage options:
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                <li>Local storage keeps all data on your device</li>
                <li>Cloud storage syncs data across devices (requires account setup)</li>
                <li>Users control their data storage preferences</li>
                <li>UK users benefit from additional data protection measures under OSA 2023</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Token System and Platinum Membership</h2>
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
              <h2 className="text-xl font-semibold text-white mb-4">6. Content and Conduct</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Users are responsible for their interactions and content created on the platform:
              </p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                <li>Content filtering is in place to maintain community standards</li>
                <li>Users must comply with our Community Guidelines</li>
                <li>Harmful, illegal, or abusive content is prohibited</li>
                <li>We reserve the right to moderate content and suspend accounts</li>
                <li>UK users benefit from enhanced content moderation under OSA 2023 requirements</li>
                <li>Content reporting system available for safety concerns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Age Verification and Safety Measures</h2>
              <p className="text-zinc-300 leading-relaxed mb-4">To ensure user safety and legal compliance:</p>
              <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
                <li>Users must be 13 years or older to use basic features</li>
                <li>Adult content and unhinged mode require age verification (18+)</li>
                <li>UK users require HEAA verification for accessing certain content</li>
                <li>ID verification may be required for age-restricted features</li>
                <li>Crisis intervention resources are provided for self-harm content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Privacy and Security</h2>
              <p className="text-zinc-300 leading-relaxed">
                We implement security measures including optional PIN protection for user privacy. Chat data is
                processed to provide AI responses but is not used for training purposes without explicit consent. UK
                users receive additional privacy protections as required under the Online Safety Act 2023.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. Service Availability</h2>
              <p className="text-zinc-300 leading-relaxed">
                We strive to maintain service availability but cannot guarantee uninterrupted access. Maintenance,
                updates, or technical issues may temporarily affect service availability.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">10. Limitation of Liability</h2>
              <p className="text-zinc-300 leading-relaxed">
                Aivora.ai is provided "as is" without warranties of any kind. We are not liable for any damages arising
                from the use of our service, including but not limited to data loss or service interruptions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">11. Changes to Terms</h2>
              <p className="text-zinc-300 leading-relaxed">
                We reserve the right to modify these terms at any time. Users will be notified of significant changes,
                and continued use of the service constitutes acceptance of updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">12. Contact Information</h2>
              <p className="text-zinc-300 leading-relaxed">
                For questions about these Terms of Service, please contact us through the app's support features or
                account settings. {/* Added UK-specific contact info */}
                UK users can also report safety concerns through our OSA-compliant reporting system.
              </p>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
