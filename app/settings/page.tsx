"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { AppLayout } from "@/components/app-layout"
import { Settings, Moon, Bell, Shield, Info, Bot, AlertTriangle, Coins, Zap, FileText, Scale } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { notificationService, type NotificationPermission } from "@/lib/notifications"
import {
  getUserTokens,
  getPreferredModel,
  setPreferredModel,
  isPlatinumMember,
  getDaysUntilPlatinum,
  getAccountAge,
  updateUserActivity,
} from "@/lib/storage"

export default function SettingsPage() {
  const router = useRouter()
  const [aiPersonality, setAiPersonality] = useState("assistant")
  const [contentFilter, setContentFilter] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true,
  })
  const [soundEffects, setSoundEffects] = useState(true)
  const [tokens, setTokens] = useState(0)
  const [preferredModel, setPreferredModelState] = useState<"basic" | "advanced" | "premium">("basic")
  const [isPlatinum, setIsPlatinum] = useState(false)
  const [daysUntilPlatinum, setDaysUntilPlatinum] = useState(730)
  const [accountAge, setAccountAge] = useState(0)

  useEffect(() => {
    const savedPersonality = localStorage.getItem("ai-personality") || "assistant"
    const savedFilter = localStorage.getItem("content-filter") !== "false"
    const savedPushNotifications = localStorage.getItem("push-notifications") === "true"
    const savedSoundEffects = localStorage.getItem("sound-effects") !== "false"

    setAiPersonality(savedPersonality)
    setContentFilter(savedFilter)
    setPushNotifications(savedPushNotifications)
    setSoundEffects(savedSoundEffects)

    setTokens(getUserTokens())
    setPreferredModelState(getPreferredModel())

    setNotificationPermission(notificationService.getPermissionStatus())

    notificationService.registerServiceWorker()

    updateUserActivity()
    setIsPlatinum(isPlatinumMember())
    setDaysUntilPlatinum(getDaysUntilPlatinum())
    setAccountAge(getAccountAge())
  }, [])

  const handlePersonalityChange = (personality: string) => {
    setAiPersonality(personality)
    localStorage.setItem("ai-personality", personality)
  }

  const handleFilterChange = (enabled: boolean) => {
    setContentFilter(enabled)
    localStorage.setItem("content-filter", enabled.toString())
  }

  const handlePushNotificationChange = async (enabled: boolean) => {
    if (enabled) {
      const permission = await notificationService.requestPermission()
      setNotificationPermission(permission)

      if (permission.granted) {
        setPushNotifications(true)
        localStorage.setItem("push-notifications", "true")

        await notificationService.showNotification("Notifications Enabled!", {
          body: "You'll now receive notifications for new messages and character responses.",
          tag: "notification-enabled",
        })
      } else {
        setPushNotifications(false)
        localStorage.setItem("push-notifications", "false")
      }
    } else {
      setPushNotifications(false)
      localStorage.setItem("push-notifications", "false")
    }
  }

  const handleSoundEffectsChange = (enabled: boolean) => {
    setSoundEffects(enabled)
    localStorage.setItem("sound-effects", enabled.toString())
  }

  const handleModelChange = (model: "basic" | "advanced" | "premium") => {
    const modelCosts = { basic: 0, advanced: 50, premium: 100 }
    const cost = modelCosts[model]

    if (!isPlatinum && cost > tokens) {
      alert(
        `You need ${cost} tokens to use the ${model} model. You have ${tokens} tokens. Chat with characters to earn more, or use our service for 2 years to get Platinum!`,
      )
      return
    }

    setPreferredModel(model)
    setPreferredModelState(model)
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-zinc-900 text-white p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="h-8 w-8 text-indigo-400" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>

          <div className="space-y-4">
            {isPlatinum ? (
              <Card className="bg-gradient-to-r from-purple-900 to-pink-900 border-purple-500">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                      ⭐
                    </div>
                    Aivora.ai Platinum
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <span className="text-white font-medium">Status</span>
                    <span className="text-yellow-400 font-bold">PLATINUM MEMBER</span>
                  </div>
                  <div className="text-sm text-purple-200 space-y-1">
                    <p>🎉 Congratulations! You've been using Aivora.ai for {accountAge} days</p>
                    <p>✨ You now have unlimited access to all AI models</p>
                    <p>🚀 No tokens required - enjoy premium features for free!</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-zinc-800 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      ⭐
                    </div>
                    Aivora.ai Platinum
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-zinc-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Progress to Platinum</span>
                      <span className="text-zinc-400">{730 - daysUntilPlatinum}/730 days</span>
                    </div>
                    <div className="w-full bg-zinc-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((730 - daysUntilPlatinum) / 730) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-400 space-y-1">
                    <p>• Use Aivora.ai for 2 years (730 days) to unlock Platinum</p>
                    <p>• Get unlimited access to all AI models without tokens</p>
                    <p>• Only {daysUntilPlatinum} days left until Platinum!</p>
                    <p className="text-purple-400">• Account age: {accountAge} days</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Personality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      aiPersonality === "assistant"
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-zinc-600 hover:border-zinc-500"
                    }`}
                    onClick={() => handlePersonalityChange("assistant")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">AI Assistant</p>
                        <p className="text-sm text-zinc-400">Professional and helpful</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      aiPersonality === "chan"
                        ? "border-pink-500 bg-pink-500/10"
                        : "border-zinc-600 hover:border-zinc-500"
                    }`}
                    onClick={() => handlePersonalityChange("chan")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-lg">
                        ✨
                      </div>
                      <div>
                        <p className="text-white font-medium">AI-Chan</p>
                        <p className="text-sm text-zinc-400">Friendly anime-style personality</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Content Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Content Warning Filter</p>
                    <p className="text-sm text-zinc-400">Show red outline warnings for sensitive content</p>
                  </div>
                  <Switch checked={contentFilter} onCheckedChange={handleFilterChange} />
                </div>
                <div className="p-3 rounded-lg bg-zinc-700/50 border border-zinc-600">
                  <p className="text-sm text-zinc-300">
                    <span className="text-yellow-400">Note:</span> This app allows mature roleplay content including
                    violence and adult themes, similar to Character.AI. Content filters provide warnings but don't block
                    content.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Dark Mode</p>
                    <p className="text-sm text-zinc-400">Use dark theme</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Push Notifications</p>
                    <p className="text-sm text-zinc-400">
                      {notificationPermission.denied
                        ? "Notifications blocked - enable in browser settings"
                        : "Receive notifications for new messages"}
                    </p>
                  </div>
                  <Switch
                    checked={pushNotifications && notificationPermission.granted}
                    onCheckedChange={handlePushNotificationChange}
                    disabled={notificationPermission.denied}
                  />
                </div>
                {notificationPermission.denied && (
                  <div className="p-3 rounded-lg bg-red-900/20 border border-red-500">
                    <p className="text-sm text-red-400">
                      Notifications are blocked. To enable them, click the lock icon in your browser's address bar and
                      allow notifications.
                    </p>
                  </div>
                )}
                {pushNotifications && notificationPermission.granted && (
                  <div className="p-3 rounded-lg bg-green-900/20 border border-green-500">
                    <p className="text-sm text-green-400">
                      ✓ Notifications enabled! You'll receive alerts for new messages and character responses.
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Sound Effects</p>
                    <p className="text-sm text-zinc-400">Play sounds for interactions</p>
                  </div>
                  <Switch checked={soundEffects} onCheckedChange={handleSoundEffectsChange} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  {isPlatinum ? "Token System (Platinum - Unlimited)" : "Token System"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isPlatinum ? (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-700/50 to-pink-700/50 rounded-lg border border-purple-500">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                        ⭐
                      </div>
                      <span className="text-white font-medium">Platinum Access</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-400">∞</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <span className="text-white font-medium">Your Tokens</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-500">{tokens}</span>
                  </div>
                )}

                {!isPlatinum && (
                  <div className="text-sm text-zinc-400 space-y-1">
                    <p>• Earn 10 tokens for each chat with AI characters</p>
                    <p>• Use tokens to access larger, more powerful models</p>
                    <p>• Chat more to unlock premium features!</p>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-white font-medium">AI Model Selection</h4>

                  <div
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      preferredModel === "basic"
                        ? "border-green-500 bg-green-500/10"
                        : "border-zinc-600 hover:border-zinc-500"
                    }`}
                    onClick={() => handleModelChange("basic")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bot className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-white font-medium">Basic Model</p>
                          <p className="text-sm text-zinc-400">Fast responses, good quality</p>
                        </div>
                      </div>
                      <span className="text-green-500 font-medium">FREE</span>
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      preferredModel === "advanced"
                        ? "border-blue-500 bg-blue-500/10"
                        : !isPlatinum && tokens < 50
                          ? "border-zinc-700 opacity-50 cursor-not-allowed"
                          : "border-zinc-600 hover:border-zinc-500"
                    }`}
                    onClick={() => handleModelChange("advanced")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-white font-medium">Advanced Model</p>
                          <p className="text-sm text-zinc-400">Better reasoning, more creative</p>
                        </div>
                      </div>
                      <span
                        className={`font-medium ${
                          isPlatinum ? "text-yellow-400" : tokens < 50 ? "text-zinc-500" : "text-blue-500"
                        }`}
                      >
                        {isPlatinum ? "FREE" : "50 tokens"}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      preferredModel === "premium"
                        ? "border-purple-500 bg-purple-500/10"
                        : !isPlatinum && tokens < 100
                          ? "border-zinc-700 opacity-50 cursor-not-allowed"
                          : "border-zinc-600 hover:border-zinc-500"
                    }`}
                    onClick={() => handleModelChange("premium")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                        <div>
                          <p className="text-white font-medium">Premium Model</p>
                          <p className="text-sm text-zinc-400">Highest quality, most intelligent</p>
                        </div>
                      </div>
                      <span
                        className={`font-medium ${
                          isPlatinum ? "text-yellow-400" : tokens < 100 ? "text-zinc-500" : "text-purple-500"
                        }`}
                      >
                        {isPlatinum ? "FREE" : "100 tokens"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                >
                  Clear Chat History
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                >
                  Export Data
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Legal & Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                  onClick={() => router.push("/terms")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Terms of Service
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                  onClick={() => router.push("/guidelines")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Community Guidelines
                </Button>
                <div className="text-xs text-zinc-500 pt-2">Learn about our policies and community standards</div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Version</span>
                  <span className="text-white">2.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Build</span>
                  <span className="text-white">2024.1</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
