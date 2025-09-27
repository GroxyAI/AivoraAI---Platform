"use client"
import { Button } from "@/components/ui/button"
import { Menu, Maximize2, Sparkles, MessageCircle, Users, Settings } from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getCharacters, getRecentChats, getUserProfile, type Character, type ChatSession } from "@/lib/storage"

export default function HomePage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [recentChats, setRecentChats] = useState<ChatSession[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    const savedCharacters = getCharacters()
    const recent = getRecentChats(3)
    const profile = getUserProfile()

    setCharacters(savedCharacters)
    setRecentChats(recent)
    setUserProfile(profile)
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    let timeGreeting = "Good evening"

    if (hour < 12) timeGreeting = "Good morning"
    else if (hour < 18) timeGreeting = "Good afternoon"

    return userProfile?.username ? `${timeGreeting}, ${userProfile.username}!` : `${timeGreeting}!`
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col pb-16">
        {/* Header */}
        <header className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800">
            <Menu className="h-6 w-6" />
          </Button>

          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Upgrade your plan
          </Button>

          <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800">
            <Maximize2 className="h-6 w-6" />
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-medium text-white mb-2">{getGreeting()}</h1>
              <p className="text-zinc-400 text-lg">What would you like to do today?</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Link href="/chat">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-2xl flex items-center gap-3">
                  <MessageCircle className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-semibold">Start Chatting</div>
                    <div className="text-sm text-indigo-200">Choose a character</div>
                  </div>
                </Button>
              </Link>

              <Link href="/characters">
                <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white p-6 rounded-2xl flex items-center gap-3">
                  <Users className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-semibold">Manage Characters</div>
                    <div className="text-sm text-zinc-400">Create & edit AI personalities</div>
                  </div>
                </Button>
              </Link>

              <Link href="/settings">
                <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white p-6 rounded-2xl flex items-center gap-3">
                  <Settings className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-semibold">Settings</div>
                    <div className="text-sm text-zinc-400">Customize your experience</div>
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  )
}
