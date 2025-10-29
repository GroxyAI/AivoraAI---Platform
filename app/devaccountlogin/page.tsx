"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { setDevAccount, isDevAccount, getUserProfile, saveUserProfile } from "@/lib/storage"
import { Shield, AlertTriangle, Eye, EyeOff, LogOut, RefreshCw } from "lucide-react"

export default function DevAccountLogin() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(isDevAccount())
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (username === "@devadmin" && password === "DeveloperAccount.64") {
      setDevAccount(true)
      setIsLoggedIn(true)
      alert("Developer account activated! You now have access to all features without restrictions.")
      router.push("/")
    } else {
      setError("Invalid credentials. Access denied.")
    }

    setIsLoading(false)
  }

  const handleSessionLogout = () => {
    if (confirm("Log out of current session? Your changes will be saved.")) {
      router.push("/")
    }
  }

  const handleAccountLogout = () => {
    if (
      confirm("Log out of developer account? This will restore any modified settings and clear developer privileges.")
    ) {
      // Recovery mode: restore @devadmin username if it was changed
      const profile = getUserProfile()
      if (profile && profile.isDevProfile) {
        profile.username = "@devadmin"
        profile.bio = "Official AivoraAI Developer Account"
        profile.profilePicture = "/aivora-mascot.png"
        saveUserProfile(profile)
      }

      setDevAccount(false)
      setIsLoggedIn(false)
      alert("Developer account logged out. All settings have been restored.")
      router.push("/")
    }
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
        <Card className="bg-zinc-800 border-zinc-700 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img src="/aivora-logo.png" alt="AivoraAI Logo" className="w-12 h-12 rounded-lg" />
            </div>
            <CardTitle className="text-white text-2xl">Developer Session</CardTitle>
            <p className="text-green-400 text-sm">Currently logged in as @devadmin</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-green-400 font-medium text-sm">Active Developer Session</span>
              </div>
              <p className="text-green-300 text-xs">
                You have full developer privileges. All content filters are disabled and you have unlimited access.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleSessionLogout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out of Session
              </Button>

              <Button
                onClick={handleAccountLogout}
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Log Out of Account (Recovery Mode)
              </Button>
            </div>

            <div className="pt-4 border-t border-zinc-700">
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/")}
                  className="text-zinc-400 hover:text-white text-sm"
                >
                  ← Back to App
                </Button>
              </div>
            </div>

            <div className="text-xs text-zinc-500 text-center space-y-1">
              <p className="text-yellow-400 font-medium">Recovery Mode Info:</p>
              <ul className="text-zinc-400 space-y-0.5">
                <li>• Session logout saves all changes</li>
                <li>• Account logout restores @devadmin settings</li>
                <li>• Recovery mode fixes any unauthorized changes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
      <Card className="bg-zinc-800 border-zinc-700 max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src="/aivora-logo.png" alt="AivoraAI Logo" className="w-12 h-12 rounded-lg" />
          </div>
          <CardTitle className="text-white text-2xl">Developer Access</CardTitle>
          <p className="text-zinc-400 text-sm">Aivora.ai Internal Use Only</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-red-400 font-medium text-sm">Restricted Access</span>
            </div>
            <p className="text-red-300 text-xs">
              This page is for authorized developers only. Developer accounts bypass all content filters and age
              verification requirements.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-zinc-300 mb-2">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@devadmin"
                className="bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400 focus:border-green-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter developer password"
                  className="bg-zinc-700 border-zinc-600 text-white placeholder-zinc-400 focus:border-green-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-500 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Activate Developer Mode
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-zinc-700">
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ← Back to App
              </Button>
            </div>
          </div>

          <div className="text-xs text-zinc-500 text-center space-y-1">
            <p>Developer privileges include:</p>
            <ul className="text-zinc-600 space-y-0.5">
              <li>• Bypass age verification</li>
              <li>• Unlimited token access</li>
              <li>• All content filters disabled</li>
              <li>• Premium model access</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
