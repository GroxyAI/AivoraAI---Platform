"use client"

import type React from "react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { BottomNavigation } from "./bottom-navigation"
import { PinEntry } from "./pin-entry"
import { PinSetupWizard } from "./pin-setup-wizard"
import { ChatSidebar } from "./chat-sidebar"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showSetupWizard, setShowSetupWizard] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const checkPinStatus = () => {
      const savedProfile = localStorage.getItem("userProfile")

      if (!savedProfile) {
        setShowSetupWizard(true)
        setIsLoading(false)
        return
      }

      const profile = JSON.parse(savedProfile)

      if (!profile.pinEnabled) {
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }

      const sessionAuth = sessionStorage.getItem("pinAuthenticated")
      if (sessionAuth === "true") {
        setIsAuthenticated(true)
      }

      setIsLoading(false)
    }

    checkPinStatus()
  }, [])

  const handlePinSuccess = () => {
    setIsAuthenticated(true)
    sessionStorage.setItem("pinAuthenticated", "true")
  }

  const handleSetupPin = () => {
    setShowSetupWizard(true)
  }

  const handleSetupComplete = () => {
    setShowSetupWizard(false)
    setIsAuthenticated(true)
    sessionStorage.setItem("pinAuthenticated", "true")
  }

  const handleSkipSetup = () => {
    setShowSetupWizard(false)
    setIsAuthenticated(true)
  }

  const getActiveTab = (): "chat" | "characters" | "settings" | "account" => {
    if (pathname === "/characters") return "characters"
    if (pathname === "/settings") return "settings"
    if (pathname === "/account") return "account"
    if (pathname === "/" || pathname === "/chat" || pathname.startsWith("/chat/")) return "chat"
    return "chat"
  }

  const handleTabChange = (tab: "chat" | "characters" | "settings" | "account") => {
    switch (tab) {
      case "chat":
        router.push("/chat")
        break
      case "characters":
        router.push("/characters")
        break
      case "settings":
        router.push("/settings")
        break
      case "account":
        router.push("/account")
        break
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (showSetupWizard) {
    return <PinSetupWizard onComplete={handleSetupComplete} onSkip={handleSkipSetup} />
  }

  if (!isAuthenticated) {
    return <PinEntry onSuccess={handlePinSuccess} onSetupPin={handleSetupPin} />
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex">
      <ChatSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center p-4 border-b border-zinc-800">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-zinc-800"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {children}
        <BottomNavigation activeTab={getActiveTab()} onTabChange={handleTabChange} />
      </div>
    </div>
  )
}
