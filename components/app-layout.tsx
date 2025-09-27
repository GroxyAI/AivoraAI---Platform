"use client"

import type React from "react"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { BottomNavigation } from "./bottom-navigation"
import { PinEntry } from "./pin-entry"
import { PinSetupWizard } from "./pin-setup-wizard"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showSetupWizard, setShowSetupWizard] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkPinStatus = () => {
      const savedProfile = localStorage.getItem("userProfile")

      if (!savedProfile) {
        // No profile exists, show setup wizard
        setShowSetupWizard(true)
        setIsLoading(false)
        return
      }

      const profile = JSON.parse(savedProfile)

      if (!profile.pinEnabled) {
        // PIN not enabled, allow access
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }

      // PIN is enabled, check if already authenticated in this session
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
    <div className="min-h-screen bg-zinc-900">
      {children}
      <BottomNavigation activeTab={getActiveTab()} onTabChange={handleTabChange} />
    </div>
  )
}
