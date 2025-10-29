"use client"
import { Button } from "@/components/ui/button"
import { MessageCircle, Sparkles, Users, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-indigo-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <img src="/aivora-logo.png" alt="Aivora.ai Logo" className="w-10 h-10 rounded-lg" />
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Aivora.ai
          </span>
        </div>

        <Link href="/account">
          <Button variant="outline" className="border-zinc-600 text-white hover:bg-zinc-800 bg-transparent">
            Account Settings
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Chat with AI Characters
          </h1>

          <p className="text-xl md:text-2xl text-zinc-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Create unique AI personalities, have meaningful conversations, and explore endless possibilities with our
            advanced chat platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/chat">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg rounded-full flex items-center gap-3 min-w-[200px]"
              >
                <MessageCircle className="h-5 w-5" />
                Chat Now
              </Button>
            </Link>

            <Link href="/characters">
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-600 text-white hover:bg-zinc-800 px-8 py-4 text-lg rounded-full flex items-center gap-3 min-w-[200px] bg-transparent"
              >
                <Users className="h-5 w-5" />
                Create Characters
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700">
              <Sparkles className="h-12 w-12 text-indigo-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">AI Personalities</h3>
              <p className="text-zinc-400">
                Create custom AI characters with unique personalities, backgrounds, and conversation styles.
              </p>
            </div>

            <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700">
              <Shield className="h-12 w-12 text-indigo-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">Private & Secure</h3>
              <p className="text-zinc-400">
                Your conversations are private with optional PIN protection and local storage by default.
              </p>
            </div>

            <div className="bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-700">
              <Zap className="h-12 w-12 text-indigo-400 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">Instant Access</h3>
              <p className="text-zinc-400">
                No signup required. Start chatting immediately and set up your account when you're ready.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-3xl border border-indigo-500/30">
            <h2 className="text-2xl font-bold mb-4">Ready to start your AI conversation?</h2>
            <p className="text-zinc-300 mb-6">Jump right in - no account setup required!</p>
            <Link href="/chat">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 text-lg rounded-full"
              >
                Start Chatting Now
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-zinc-500 border-t border-zinc-800">
        <p>&copy; 2024 Aivora.ai. All rights reserved.</p>
      </footer>
    </div>
  )
}
