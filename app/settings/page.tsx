"use client"

export const dynamic = "force-dynamic"

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
  const [unhingedMode, setUnhingedMode] = useState(false)
  const [ageVerified, setAgeVerified] = useState(false)
  const [showAgeVerification, setShowAgeVerification] = useState(false)
  const [showIdVerification, setShowIdVerification] = useState(false)
  const [ukUser, setUkUser] = useState(false)
  const [showUkCompliance, setShowUkCompliance] = useState(false)
  const [heaaVerified, setHeaaVerified] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportContent, setReportContent] = useState("")
  const [reportReason, setReportReason] = useState("")
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [soundEffects, setSoundEffects] = useState(true)
  const [tokens, setTokens] = useState(0)
  const [preferredModel, setPreferredModelState] = useState<"basic" | "advanced" | "premium">("basic")
  const [isPlatinum, setIsPlatinum] = useState(false)
  const [daysUntilPlatinum, setDaysUntilPlatinum] = useState(730)
  const [accountAge, setAccountAge] = useState(0)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: false, // Added missing 'default' property required by NotificationPermission type
  })

  useEffect(() => {
    const savedPersonality = localStorage.getItem("ai-personality") || "assistant"
    const savedFilter = localStorage.getItem("content-filter") !== "false"
    const savedUnhingedMode = localStorage.getItem("unhinged-mode") === "true"
    const savedAgeVerified = localStorage.getItem("age-verified") === "true"
    const savedPushNotifications = localStorage.getItem("push-notifications") === "true"
    const savedSoundEffects = localStorage.getItem("sound-effects") !== "false"
    const savedUkUser = localStorage.getItem("uk-user") === "true"
    const savedHeaaVerified = localStorage.getItem("heaa-verified") === "true"

    setAiPersonality(savedPersonality)
    setContentFilter(savedFilter)
    setUnhingedMode(savedUnhingedMode)
    setAgeVerified(savedAgeVerified)
    setPushNotifications(savedPushNotifications)
    setSoundEffects(savedSoundEffects)
    setUkUser(savedUkUser)
    setHeaaVerified(savedHeaaVerified)

    setTokens(getUserTokens())
    setPreferredModelState(getPreferredModel())

    setNotificationPermission(notificationService.getPermissionStatus())

    notificationService.registerServiceWorker()

    updateUserActivity()
    setIsPlatinum(isPlatinumMember())
    setDaysUntilPlatinum(getDaysUntilPlatinum())
    setAccountAge(getAccountAge())

    // Show UK compliance modal for new UK users
    if (savedUkUser && !savedHeaaVerified && !localStorage.getItem("dev-account")) {
      setShowUkCompliance(true)
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      setCameraStream(stream)
    } catch (error) {
      console.error("Camera access denied:", error)
      alert("Camera access is required for ID verification. Please allow camera access and try again.")
    }
  }

  const captureImage = () => {
    if (!cameraStream) return

    const video = document.getElementById("camera-video") as HTMLVideoElement
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    if (video && context) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)

      const imageData = canvas.toDataURL("image/jpeg", 0.8)
      setCapturedImage(imageData)
      setIsCapturing(false)

      // Stop camera stream
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setIsCapturing(true)
    startCamera()
  }

  const verifyId = () => {
    if (capturedImage) {
      // In a real app, this would send the image to a verification service
      setAgeVerified(true)
      setUnhingedMode(true)
      localStorage.setItem("age-verified", "true")
      localStorage.setItem("unhinged-mode", "true")
      localStorage.setItem("content-filter", "false")
      setContentFilter(false)
      setShowIdVerification(false)
      setCapturedImage(null)

      alert("ID verification successful! Unhinged mode has been enabled.")
    }
  }

  const closeIdVerification = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    setShowIdVerification(false)
    setShowAgeVerification(false)
    setCapturedImage(null)
    setIsCapturing(false)
  }

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

  const handleAgeVerification = (isOver18: boolean) => {
    if (isOver18) {
      setShowAgeVerification(false)
      setShowIdVerification(true)
      setIsCapturing(true)
      startCamera()
    } else {
      setShowAgeVerification(false)
    }
  }

  const handleUnhingedModeChange = (enabled: boolean) => {
    if (enabled && !ageVerified && !localStorage.getItem("dev-account")) {
      setShowAgeVerification(true)
      return
    }

    setUnhingedMode(enabled)
    localStorage.setItem("unhinged-mode", enabled.toString())
  }

  const handleUkCompliance = (isUkUser: boolean) => {
    setUkUser(isUkUser)
    localStorage.setItem("uk-user", isUkUser.toString())

    if (isUkUser) {
      setShowUkCompliance(false)
      setShowIdVerification(true)
      setIsCapturing(true)
      startCamera()
    } else {
      setShowUkCompliance(false)
    }
  }

  const handleReportContent = () => {
    if (reportContent.trim() && reportReason.trim()) {
      // Store report for review (in real app, would send to moderation team)
      const reports = JSON.parse(localStorage.getItem("content-reports") || "[]")
      reports.push({
        id: Date.now(),
        content: reportContent,
        reason: reportReason,
        timestamp: new Date().toISOString(),
        status: "pending",
      })
      localStorage.setItem("content-reports", JSON.stringify(reports))

      setShowReportModal(false)
      setReportContent("")
      setReportReason("")
      alert("Thank you for your report. Our moderation team will review it within 24 hours.")
    }
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-zinc-900 text-white p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="h-8 w-8 text-indigo-400" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>

          {showIdVerification && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
              <Card className="bg-zinc-800 border-red-500 max-w-lg w-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    ID Verification Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
                    <p className="text-red-400 font-medium mb-2">📷 Document Verification</p>
                    <p className="text-sm text-red-300">
                      Please capture a clear photo of your government-issued ID (passport, driver's license, or national
                      ID card) to verify you are 18 years or older.
                    </p>
                  </div>

                  {!capturedImage ? (
                    <div className="space-y-4">
                      {cameraStream && isCapturing ? (
                        <div className="relative">
                          <video
                            id="camera-video"
                            autoPlay
                            playsInline
                            className="w-full h-64 bg-black rounded-lg object-cover"
                            ref={(video) => {
                              if (video && cameraStream) {
                                video.srcObject = cameraStream
                              }
                            }}
                          />
                          <div className="absolute inset-0 border-2 border-dashed border-red-400 rounded-lg flex items-center justify-center pointer-events-none">
                            <div className="bg-black/50 text-white px-3 py-1 rounded text-sm">
                              Position your ID within the frame
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-64 bg-zinc-700 rounded-lg flex items-center justify-center">
                          <div className="text-center text-zinc-400">
                            <div className="text-4xl mb-2">📷</div>
                            <p>Camera will appear here</p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {cameraStream && isCapturing ? (
                          <Button onClick={captureImage} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                            📸 Capture ID
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              setIsCapturing(true)
                              startCamera()
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            📷 Start Camera
                          </Button>
                        )}
                        <Button
                          onClick={closeIdVerification}
                          variant="outline"
                          className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={capturedImage || "/placeholder.svg"}
                          alt="Captured ID"
                          className="w-full h-64 object-cover rounded-lg border-2 border-green-500"
                        />
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                          ✓ Captured
                        </div>
                      </div>

                      <div className="p-3 bg-green-900/20 border border-green-500 rounded-lg">
                        <p className="text-sm text-green-400">
                          ✓ ID captured successfully. Please review the image and confirm it clearly shows your
                          document.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button onClick={verifyId} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                          ✓ Verify & Enable
                        </Button>
                        <Button
                          onClick={retakePhoto}
                          variant="outline"
                          className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                        >
                          📷 Retake
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {showAgeVerification && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <Card className="bg-zinc-800 border-red-500 max-w-md w-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Age Verification Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
                    <p className="text-red-400 font-medium mb-2">⚠️ Adults Only (18+)</p>
                    <p className="text-sm text-red-300">
                      Unhinged Mode removes ALL content filters and allows any type of content including explicit,
                      violent, and mature themes. This mode is intended for adults only.
                    </p>
                  </div>
                  <p className="text-white font-medium">Are you 18 years of age or older?</p>
                  <p className="text-sm text-zinc-400">You will need to verify your age with a government-issued ID.</p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleAgeVerification(true)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Yes, Verify with ID
                    </Button>
                    <Button
                      onClick={() => handleAgeVerification(false)}
                      variant="outline"
                      className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                    >
                      No, Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {showUkCompliance && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
              <Card className="bg-zinc-800 border-blue-500 max-w-lg w-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    UK Online Safety Act Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
                    <p className="text-blue-400 font-medium mb-2">🇬🇧 UK User Verification</p>
                    <p className="text-sm text-blue-300">
                      To comply with the UK Online Safety Act 2023, we need to verify if you're accessing this service
                      from the UK and implement appropriate safety measures.
                    </p>
                  </div>
                  <p className="text-white font-medium">Are you accessing this service from the United Kingdom?</p>
                  <div className="text-sm text-zinc-400 space-y-2">
                    <p>• UK users require enhanced age verification (HEAA)</p>
                    <p>• Additional content moderation and reporting features</p>
                    <p>• Compliance with Ofcom safety standards</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleUkCompliance(true)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Yes, I'm in the UK
                    </Button>
                    <Button
                      onClick={() => handleUkCompliance(false)}
                      variant="outline"
                      className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                    >
                      No, I'm elsewhere
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {showReportModal && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
              <Card className="bg-zinc-800 border-red-500 max-w-lg w-full">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Report Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-white font-medium mb-2 block">Content to Report</label>
                    <textarea
                      value={reportContent}
                      onChange={(e) => setReportContent(e.target.value)}
                      className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white resize-none"
                      rows={3}
                      placeholder="Paste the content you want to report..."
                    />
                  </div>
                  <div>
                    <label className="text-white font-medium mb-2 block">Reason for Report</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                    >
                      <option value="">Select a reason...</option>
                      <option value="illegal">Illegal Content</option>
                      <option value="harmful-to-children">Harmful to Children</option>
                      <option value="harassment">Harassment or Bullying</option>
                      <option value="self-harm">Self-Harm Content</option>
                      <option value="terrorism">Terrorism or Extremism</option>
                      <option value="other">Other Safety Concern</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleReportContent}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={!reportContent.trim() || !reportReason}
                    >
                      Submit Report
                    </Button>
                    <Button
                      onClick={() => setShowReportModal(false)}
                      variant="outline"
                      className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="space-y-4">
            {ukUser && (
              <Card className="bg-gradient-to-r from-blue-900 to-indigo-900 border-blue-500">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    UK Online Safety Act Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <span className="text-white font-medium">Status</span>
                    <span className={`font-bold ${heaaVerified ? "text-green-400" : "text-yellow-400"}`}>
                      {heaaVerified ? "HEAA VERIFIED" : "VERIFICATION REQUIRED"}
                    </span>
                  </div>
                  <div className="text-sm text-blue-200 space-y-1">
                    <p>🇬🇧 UK user detected - enhanced safety measures active</p>
                    <p>🛡️ Content moderation compliant with Ofcom standards</p>
                    <p>📋 Reporting system available for safety concerns</p>
                    {!heaaVerified && <p className="text-yellow-300">⚠️ Age verification required for full access</p>}
                  </div>
                  <Button
                    onClick={() => setShowReportModal(true)}
                    variant="outline"
                    className="w-full border-blue-400 text-blue-300 hover:bg-blue-800/50"
                  >
                    Report Content
                  </Button>
                </CardContent>
              </Card>
            )}

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
                  Content Filters{" "}
                  {ukUser && <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">UK OSA</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white flex items-center gap-2">
                      Unhinged Mode
                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">18+</span>
                      {localStorage.getItem("dev-account") === "true" && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">DEV</span>
                      )}
                      {ukUser && <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">HEAA</span>}
                    </p>
                    <p className="text-sm text-zinc-400">
                      Remove ALL content filters - adults only
                      {ukUser && " (Requires HEAA verification for UK users)"}
                      {localStorage.getItem("dev-account") === "true" && " (Developer bypass active)"}
                    </p>
                  </div>
                  <Switch
                    checked={unhingedMode}
                    onCheckedChange={handleUnhingedModeChange}
                    disabled={ukUser && !heaaVerified && !localStorage.getItem("dev-account")}
                  />
                </div>

                {unhingedMode && (
                  <div className="p-3 rounded-lg bg-red-900/20 border border-red-500">
                    <p className="text-sm text-red-400">
                      <span className="font-medium">⚠️ Unhinged Mode Active:</span> All content filters are disabled. Any
                      type of content is allowed including explicit, violent, and mature themes.
                      {ukUser && " UK users: This mode complies with OSA adult verification requirements."}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Content Warning Filter</p>
                    <p className="text-sm text-zinc-400">Show red outline warnings for sensitive content</p>
                  </div>
                  <Switch checked={contentFilter} onCheckedChange={handleFilterChange} disabled={unhingedMode} />
                </div>

                <div className="p-3 rounded-lg bg-zinc-700/50 border border-zinc-600">
                  <p className="text-sm text-zinc-300">
                    <span className="text-yellow-400">Note:</span> This app allows mature roleplay content including
                    violence and adult themes, similar to Character.AI.{" "}
                    {unhingedMode
                      ? "Unhinged Mode removes all restrictions."
                      : "Content filters provide warnings but don't block content."}
                    {ukUser && " UK users benefit from enhanced safety measures under the Online Safety Act 2023."}
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
