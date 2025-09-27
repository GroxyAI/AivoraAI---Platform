"use client"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Heart, Users, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function GuidelinesPage() {
  const router = useRouter()

  return (
    <AppLayout>
      <div className="min-h-screen bg-zinc-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold">Community Guidelines</h1>
          </div>

          <div className="space-y-8">
            <div className="text-zinc-400 text-sm">Last updated: {new Date().toLocaleDateString()}</div>

            <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
              <p className="text-zinc-300 leading-relaxed">
                Welcome to Aivora.ai! Our community guidelines help create a safe, respectful, and enjoyable environment
                for all users. By using our platform, you agree to follow these guidelines.
              </p>
            </div>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-red-400" />
                <h2 className="text-xl font-semibold text-white">Be Respectful and Kind</h2>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                <p className="text-zinc-300">Treat all users and AI characters with respect and kindness.</p>
                <ul className="list-disc list-inside text-zinc-400 space-y-1 ml-4">
                  <li>Use polite and considerate language</li>
                  <li>Respect different perspectives and experiences</li>
                  <li>Avoid harassment, bullying, or discriminatory behavior</li>
                  <li>Be patient with new users learning the platform</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Content Standards</h2>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                <p className="text-zinc-300">Our content filtering system helps maintain community standards.</p>
                <ul className="list-disc list-inside text-zinc-400 space-y-1 ml-4">
                  <li>Mature themes are allowed in appropriate contexts (roleplay, creative writing)</li>
                  <li>Excessive violence or graphic content may be filtered</li>
                  <li>Illegal activities should not be promoted or detailed</li>
                  <li>Respect content warnings and filters when they appear</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-green-400" />
                <h2 className="text-xl font-semibold text-white">Character Creation</h2>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                <p className="text-zinc-300">Guidelines for creating and sharing AI characters.</p>
                <ul className="list-disc list-inside text-zinc-400 space-y-1 ml-4">
                  <li>Create original characters or properly credit inspirations</li>
                  <li>Avoid impersonating real people without clear fictional context</li>
                  <li>Character descriptions should be appropriate for the intended audience</li>
                  <li>Respect intellectual property when creating fan-based characters</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-semibold text-white">Safety and Well-being</h2>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                <p className="text-zinc-300">We prioritize user safety and mental health.</p>
                <ul className="list-disc list-inside text-zinc-400 space-y-1 ml-4">
                  <li>Crisis resources are available through chat commands (*info for self harm*)</li>
                  <li>Report concerning behavior through app settings</li>
                  <li>Take breaks if conversations become overwhelming</li>
                  <li>Remember that AI responses are generated, not human advice</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Prohibited Content</h2>
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <p className="text-red-300 mb-3">The following content is strictly prohibited:</p>
                <ul className="list-disc list-inside text-red-400 space-y-1 ml-4">
                  <li>Content involving minors in inappropriate situations</li>
                  <li>Non-consensual or exploitative content</li>
                  <li>Hate speech, discrimination, or targeted harassment</li>
                  <li>Doxxing or sharing personal information</li>
                  <li>Spam, scams, or malicious content</li>
                  <li>Content that violates laws or regulations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Enforcement</h2>
              <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                <p className="text-zinc-300">
                  Violations of these guidelines may result in content removal, account warnings, temporary suspensions,
                  or permanent bans depending on severity.
                </p>
                <p className="text-zinc-400">
                  We review reports fairly and provide appeals processes for disputed actions.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Reporting</h2>
              <div className="bg-zinc-800/50 rounded-lg p-4 space-y-3">
                <p className="text-zinc-300">If you encounter content or behavior that violates these guidelines:</p>
                <ul className="list-disc list-inside text-zinc-400 space-y-1 ml-4">
                  <li>Use the report features in the app</li>
                  <li>Contact support through account settings</li>
                  <li>Provide specific details about the violation</li>
                  <li>Block users if needed for your safety</li>
                </ul>
              </div>
            </section>

            <div className="bg-indigo-900/20 border border-indigo-800 rounded-lg p-6 text-center">
              <p className="text-indigo-300">
                Thank you for helping make Aivora.ai a welcoming community for everyone. Together, we can create amazing
                AI experiences while maintaining a safe and respectful environment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
