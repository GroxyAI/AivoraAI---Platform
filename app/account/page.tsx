"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AppLayout } from "@/components/app-layout"
import { User, Camera, Upload, Cloud, HardDrive, Shield, Lock, Fingerprint } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createUser, getUserByEmail } from "@/lib/cloud-storage"
import { BiometricAuth } from "@/lib/biometric-auth"

interface UserProfile {
  username: string
  bio: string
  profilePicture: string
  storageType: "local" | "cloud"
  pinEnabled: boolean
  pinHash: string
  biometricEnabled: boolean
}

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile>({
    username: "",
    bio: "",
    profilePicture: "",
    storageType: "local",
    pinEnabled: false,
    pinHash: "",
    biometricEnabled: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPinSetup, setShowPinSetup] = useState(false)
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [biometricSupported, setBiometricSupported] = useState(false)

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    }

    BiometricAuth.isSupported().then(setBiometricSupported)
  }, [])

  const saveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        saveProfile({ ...profile, profilePicture: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleStorageSwitch = async () => {
    setIsLoading(true)

    try {
      if (profile.storageType === "local") {
        if (!profile.username) {
          alert("Please set a username before switching to cloud storage")
          setIsLoading(false)
          return
        }

        const email = `${profile.username}@chatapp.local`

        try {
          let user = await getUserByEmail(email)
          if (!user) {
            user = await createUser({
              username: profile.username,
              email: email,
              profile_picture: profile.profilePicture,
              bio: profile.bio,
            })
          }

          localStorage.setItem("cloudUserId", user.id.toString())

          saveProfile({ ...profile, storageType: "cloud" })
        } catch (error) {
          console.error("Failed to create cloud account:", error)
          alert("Failed to switch to cloud storage. Please try again.")
          setIsLoading(false)
          return
        }
      } else {
        localStorage.removeItem("cloudUserId")
        saveProfile({ ...profile, storageType: "local" })
      }
    } catch (error) {
      console.error("Storage switch error:", error)
      alert("Failed to switch storage type. Please try again.")
    }

    setIsLoading(false)
  }

  const hashPin = (pin: string): string => {
    return btoa(pin + "salt").replace(/[^a-zA-Z0-9]/g, "")
  }

  const handlePinSetup = () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      alert("PIN must be exactly 4 digits")
      return
    }
    if (newPin !== confirmPin) {
      alert("PINs don't match")
      return
    }

    const hashedPin = hashPin(newPin)
    const updatedProfile = { ...profile, pinEnabled: true, pinHash: hashedPin }
    saveProfile(updatedProfile)
    setShowPinSetup(false)
    setNewPin("")
    setConfirmPin("")
  }

  const handlePinDisable = () => {
    if (confirm("Are you sure you want to disable PIN protection? Your chats will be accessible without a PIN.")) {
      const updatedProfile = { ...profile, pinEnabled: false, pinHash: "" }
      saveProfile(updatedProfile)
    }
  }

  const handleBiometricSetup = async () => {
    if (!profile.username) {
      alert("Please set a username before enabling Face ID")
      return
    }

    const result = await BiometricAuth.register(profile.username)
    if (result.success) {
      const updatedProfile = { ...profile, biometricEnabled: true }
      saveProfile(updatedProfile)
    } else {
      alert(`Failed to set up Face ID: ${result.error}`)
    }
  }

  const handleBiometricDisable = () => {
    if (confirm("Are you sure you want to disable Face ID? You'll need to use PIN or set up Face ID again.")) {
      BiometricAuth.removeBiometric()
      const updatedProfile = { ...profile, biometricEnabled: false }
      saveProfile(updatedProfile)
    }
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-zinc-900 text-white p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-8 w-8 text-indigo-400" />
            <h1 className="text-3xl font-bold">Account Settings</h1>
          </div>

          <div className="space-y-6">
            {/* Security Section */}
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* PIN Security */}
                <div className="flex items-center justify-between p-4 bg-zinc-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">
                      PIN Protection: {profile.pinEnabled ? "Enabled" : "Disabled"}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {profile.pinEnabled
                        ? "Your chats are protected with a 4-digit PIN"
                        : "Set up a PIN to keep your chats private"}
                    </p>
                  </div>
                  <Lock className={`h-5 w-5 ${profile.pinEnabled ? "text-green-400" : "text-zinc-400"}`} />
                </div>

                {/* Face ID/Biometric Security */}
                {biometricSupported && (
                  <div className="flex items-center justify-between p-4 bg-zinc-700 rounded-lg">
                    <div>
                      <p className="text-white font-medium">
                        Face ID: {profile.biometricEnabled ? "Enabled" : "Disabled"}
                      </p>
                      <p className="text-sm text-zinc-400">
                        {profile.biometricEnabled
                          ? "Use Face ID or Touch ID to unlock your chats"
                          : "Set up biometric authentication for quick access"}
                      </p>
                    </div>
                    <Fingerprint
                      className={`h-5 w-5 ${profile.biometricEnabled ? "text-green-400" : "text-zinc-400"}`}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2">
                  {!profile.pinEnabled ? (
                    <Button
                      onClick={() => setShowPinSetup(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Set Up PIN
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        onClick={() => setShowPinSetup(true)}
                        variant="outline"
                        className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                      >
                        Change PIN
                      </Button>
                      <Button
                        onClick={handlePinDisable}
                        variant="outline"
                        className="w-full border-red-600 text-red-400 hover:bg-red-900/20 bg-transparent"
                      >
                        Disable PIN
                      </Button>
                    </div>
                  )}

                  {/* Face ID controls */}
                  {biometricSupported && (
                    <>
                      {!profile.biometricEnabled ? (
                        <Button onClick={handleBiometricSetup} className="bg-purple-600 hover:bg-purple-700 text-white">
                          <Fingerprint className="h-4 w-4 mr-2" />
                          Set Up Face ID
                        </Button>
                      ) : (
                        <Button
                          onClick={handleBiometricDisable}
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-900/20 bg-transparent"
                        >
                          Disable Face ID
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Biometric not supported message */}
                {!biometricSupported && (
                  <div className="p-3 bg-amber-900/20 border border-amber-600/30 rounded-lg">
                    <p className="text-amber-400 text-sm">Face ID is not supported on this device or browser</p>
                  </div>
                )}

                {showPinSetup && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="bg-zinc-800 border-zinc-700 w-full max-w-md">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          {profile.pinEnabled ? "Change PIN" : "Set Up PIN"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">New PIN (4 digits)</label>
                          <Input
                            type="password"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value.slice(0, 4))}
                            placeholder="••••"
                            className="bg-zinc-700 border-zinc-600 text-white text-center text-2xl tracking-widest"
                            maxLength={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">Confirm PIN</label>
                          <Input
                            type="password"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.slice(0, 4))}
                            placeholder="••••"
                            className="bg-zinc-700 border-zinc-600 text-white text-center text-2xl tracking-widest"
                            maxLength={4}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setShowPinSetup(false)
                              setNewPin("")
                              setConfirmPin("")
                            }}
                            variant="outline"
                            className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handlePinSetup}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            Save PIN
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Section */}
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback className="bg-indigo-600 text-white text-xl">
                      {profile.username ? profile.username[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="profile-upload" className="cursor-pointer">
                      <Button
                        variant="outline"
                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                        asChild
                      >
                        <span>
                          <Camera className="h-4 w-4 mr-2" />
                          Change Photo
                        </span>
                      </Button>
                    </label>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-zinc-400">JPG, PNG or GIF (max 5MB)</p>
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Username</label>
                  <Input
                    value={profile.username}
                    onChange={(e) => saveProfile({ ...profile, username: e.target.value })}
                    placeholder="Enter your username"
                    className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
                  />
                  <p className="text-xs text-zinc-400">This is how the AI will address you in conversations</p>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Bio</label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => saveProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell the AI about yourself, your interests, preferences..."
                    className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400 min-h-[100px]"
                  />
                  <p className="text-xs text-zinc-400">The AI will use this information to personalize conversations</p>
                </div>
              </CardContent>
            </Card>

            {/* Storage Settings */}
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {profile.storageType === "local" ? <HardDrive className="h-5 w-5" /> : <Cloud className="h-5 w-5" />}
                  Data Storage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">
                      Current: {profile.storageType === "local" ? "Local Storage" : "Cloud Storage"}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {profile.storageType === "local"
                        ? "Data stored on your device only"
                        : "Data synced across all your devices"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile.storageType === "local" ? (
                      <HardDrive className="h-5 w-5 text-zinc-400" />
                    ) : (
                      <Cloud className="h-5 w-5 text-indigo-400" />
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleStorageSwitch}
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? (
                    "Switching..."
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Switch to {profile.storageType === "local" ? "Cloud" : "Local"} Storage
                    </>
                  )}
                </Button>

                <div className="text-xs text-zinc-400 space-y-1">
                  <p>
                    • Chats, characters, and settings will be{" "}
                    {profile.storageType === "local" ? "synced to cloud" : "stored locally"}
                  </p>
                  <p>
                    • {profile.storageType === "local" ? "Requires account creation" : "Data will be device-specific"}
                  </p>
                  <p>• This action cannot be undone easily</p>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                >
                  Export All Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-600 text-red-400 hover:bg-red-900/20 bg-transparent"
                >
                  Clear All Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
