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
  const [isDeveloperAccount, setIsDeveloperAccount] = useState(false)
  const [usernameError, setUsernameError] = useState("")

  const [showBanPanel, setShowBanPanel] = useState(false)
  const [showCreateDevPanel, setShowCreateDevPanel] = useState(false)
  const [banUsername, setBanUsername] = useState("")
  const [banReason, setBanReason] = useState("")
  const [bannedUsers, setBannedUsers] = useState<Array<{ username: string; reason: string; date: string }>>([])
  const [newDevUsername, setNewDevUsername] = useState("")
  const [newDevPassword, setNewDevPassword] = useState("")
  const [createdDevAccounts, setCreatedDevAccounts] = useState<
    Array<{ username: string; password: string; created: string }>
  >([])

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    }

    const devAccount = localStorage.getItem("isDeveloperAccount")
    setIsDeveloperAccount(devAccount === "true")

    BiometricAuth.isSupported().then(setBiometricSupported)

    const savedBannedUsers = localStorage.getItem("bannedUsers")
    if (savedBannedUsers) {
      setBannedUsers(JSON.parse(savedBannedUsers))
    }

    const savedDevAccounts = localStorage.getItem("createdDevAccounts")
    if (savedDevAccounts) {
      setCreatedDevAccounts(JSON.parse(savedDevAccounts))
    }
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
        let result = e.target?.result as string

        // Check if trying to use dev account avatar
        if (!isDeveloperAccount && result === "/aivora-mascot.png") {
          result = "content deleted"
        }

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

  const handleUsernameChange = (value: string) => {
    if (isDeveloperAccount && value !== "@devadmin") {
      setUsernameError("Developer username cannot be changed")
      return
    }

    if (!isDeveloperAccount && value.toLowerCase() === "@devadmin") {
      setUsernameError("username not allowed")
      return
    }

    setUsernameError("")
    saveProfile({ ...profile, username: value })
  }

  const handleDeveloperLogout = () => {
    if (confirm("Are you sure you want to log out of the developer account?")) {
      localStorage.removeItem("isDeveloperAccount")
      localStorage.removeItem("developerSession")
      window.location.href = "/"
    }
  }

  const handleBanUser = () => {
    if (!banUsername.trim() || !banReason.trim()) {
      alert("Please enter both username and reason for ban")
      return
    }

    const newBan = {
      username: banUsername,
      reason: banReason,
      date: new Date().toISOString().split("T")[0],
    }

    const updatedBannedUsers = [...bannedUsers, newBan]
    setBannedUsers(updatedBannedUsers)
    localStorage.setItem("bannedUsers", JSON.stringify(updatedBannedUsers))

    setBanUsername("")
    setBanReason("")
    alert(`User ${banUsername} has been banned`)
  }

  const handleUnbanUser = (username: string) => {
    if (confirm(`Are you sure you want to unban ${username}?`)) {
      const updatedBannedUsers = bannedUsers.filter((user) => user.username !== username)
      setBannedUsers(updatedBannedUsers)
      localStorage.setItem("bannedUsers", JSON.stringify(updatedBannedUsers))
      alert(`User ${username} has been unbanned`)
    }
  }

  const handleCreateDevAccount = () => {
    if (!newDevUsername.trim() || !newDevPassword.trim()) {
      alert("Please enter both username and password")
      return
    }

    if (newDevPassword.length < 8) {
      alert("Password must be at least 8 characters long")
      return
    }

    const newDevAccount = {
      username: newDevUsername,
      password: newDevPassword,
      created: new Date().toISOString().split("T")[0],
    }

    const updatedDevAccounts = [...createdDevAccounts, newDevAccount]
    setCreatedDevAccounts(updatedDevAccounts)
    localStorage.setItem("createdDevAccounts", JSON.stringify(updatedDevAccounts))

    setNewDevUsername("")
    setNewDevPassword("")
    alert(`Developer account ${newDevUsername} has been created`)
  }

  const handleDeleteDevAccount = (username: string) => {
    if (confirm(`Are you sure you want to delete developer account ${username}? This action cannot be undone.`)) {
      const updatedDevAccounts = createdDevAccounts.filter((account) => account.username !== username)
      setCreatedDevAccounts(updatedDevAccounts)
      localStorage.setItem("createdDevAccounts", JSON.stringify(updatedDevAccounts))
      alert(`Developer account ${username} has been deleted`)
    }
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-zinc-900 text-white p-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-8 w-8 text-indigo-400" />
            <h1 className="text-3xl font-bold">{isDeveloperAccount ? "Developer Account" : "Account Settings"}</h1>
            {isDeveloperAccount && (
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">ADMIN</span>
            )}
          </div>

          <div className="space-y-6">
            {isDeveloperAccount && (
              <Card className="bg-gradient-to-r from-red-900/20 to-purple-900/20 border-red-600/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-400" />
                    Admin Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button onClick={() => setShowBanPanel(true)} className="bg-red-600 hover:bg-red-700 text-white">
                      <User className="h-4 w-4 mr-2" />
                      Ban Users Panel
                    </Button>
                    <Button
                      onClick={() => setShowCreateDevPanel(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Create Dev Account
                    </Button>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      <Camera className="h-4 w-4 mr-2" />
                      System Analytics
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Upload className="h-4 w-4 mr-2" />
                      Database Tools
                    </Button>
                  </div>

                  <div className="pt-2 border-t border-red-600/30">
                    <Button onClick={handleDeveloperLogout} className="w-full bg-gray-700 hover:bg-gray-600 text-white">
                      <Lock className="h-4 w-4 mr-2" />
                      Logout Developer Account
                    </Button>
                  </div>

                  {/* Developer Documentation Section */}
                  <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                    <h3 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Developer Guide
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-blue-300 font-medium">How to Log Out:</p>
                        <p className="text-blue-200">
                          Click "Logout Developer Account" button above to end your admin session and return to the main
                          app.
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-300 font-medium">Testing Filters:</p>
                        <p className="text-blue-200">
                          Use these commands in any chat to test the content filtering system:
                        </p>
                        <ul className="list-disc list-inside text-blue-200 ml-2 space-y-1">
                          <li>
                            <code className="bg-blue-800/50 px-1 rounded">*SHOW FILTER*</code> - Demonstrates content
                            filtering with examples
                          </li>
                          <li>
                            <code className="bg-blue-800/50 px-1 rounded">*info for self harm*</code> - Shows crisis
                            intervention resources
                          </li>
                          <li>Type harmful content to see the red robot filter in action</li>
                          <li>Enable/disable unhinged mode in settings to test filter bypass</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-blue-300 font-medium">Admin Privileges:</p>
                        <p className="text-blue-200">
                          • Unlimited tokens • Bypass age verification • Access to all models • Content filter override
                          • User management tools
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
                    <p className="text-red-400 text-sm font-medium">⚠️ Admin Privileges Active</p>
                    <p className="text-red-300 text-xs">You have full system access. Use these tools responsibly.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Section */}
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isDeveloperAccount ? (
                  <div className="p-4 bg-amber-900/20 border border-amber-600/30 rounded-lg">
                    <p className="text-amber-400 font-medium">Developer Account Security</p>
                    <p className="text-amber-300 text-sm">
                      Security settings are managed by the system for developer accounts.
                    </p>
                  </div>
                ) : (
                  <>
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
                            <Button
                              onClick={handleBiometricSetup}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
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
                  </>
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
                {isDeveloperAccount ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="/aivora-mascot.png" />
                        <AvatarFallback className="bg-red-600 text-white text-xl">DEV</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">@devadmin</p>
                        <p className="text-zinc-400 text-sm">System Administrator</p>
                        <span className="inline-block px-2 py-1 bg-red-600 text-white text-xs font-bold rounded mt-1">
                          DEVELOPER
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-300">Username (Read-Only)</label>
                      <Input
                        value="@devadmin"
                        readOnly
                        className="bg-zinc-700/50 border-zinc-600 text-white cursor-not-allowed opacity-75"
                      />
                      <p className="text-xs text-zinc-400">
                        Developer username cannot be modified for security reasons
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Profile Picture */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile.profilePicture || "/aivora-mascot.png"} />
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
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="Enter your username"
                        className={`bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400 ${
                          usernameError ? "border-red-500 border-2" : ""
                        }`}
                      />
                      {usernameError && <p className="text-red-400 text-sm font-medium">{usernameError}</p>}
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
                      <p className="text-xs text-zinc-400">
                        The AI will use this information to personalize conversations
                      </p>
                    </div>
                  </>
                )}
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
                {isDeveloperAccount ? (
                  <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
                    <p className="text-green-400 font-medium">Developer Storage</p>
                    <p className="text-green-300 text-sm">
                      Unlimited cloud storage with full system access and backup capabilities.
                    </p>
                  </div>
                ) : (
                  <>
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
                        •{" "}
                        {profile.storageType === "local" ? "Requires account creation" : "Data will be device-specific"}
                      </p>
                      <p>• This action cannot be undone easily</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isDeveloperAccount ? (
                  <>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Export System Data</Button>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Database Backup</Button>
                    <Button
                      variant="outline"
                      className="w-full border-red-600 text-red-400 hover:bg-red-900/20 bg-transparent"
                    >
                      System Reset (Admin Only)
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showBanPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-zinc-800 border-zinc-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-red-400" />
                Ban Users Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Ban User Form */}
              <div className="space-y-3 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                <h3 className="text-red-400 font-medium">Ban New User</h3>
                <Input
                  value={banUsername}
                  onChange={(e) => setBanUsername(e.target.value)}
                  placeholder="Username to ban"
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
                <Textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Reason for ban"
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
                <Button onClick={handleBanUser} className="w-full bg-red-600 hover:bg-red-700">
                  Ban User
                </Button>
              </div>

              {/* Banned Users List */}
              <div className="space-y-2">
                <h3 className="text-white font-medium">Banned Users ({bannedUsers.length})</h3>
                {bannedUsers.length === 0 ? (
                  <p className="text-zinc-400 text-sm">No users are currently banned</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {bannedUsers.map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-zinc-400 text-sm">{user.reason}</p>
                          <p className="text-zinc-500 text-xs">Banned: {user.date}</p>
                        </div>
                        <Button
                          onClick={() => handleUnbanUser(user.username)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Unban
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowBanPanel(false)}
                  variant="outline"
                  className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showCreateDevPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-zinc-800 border-zinc-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-400" />
                Create Developer Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create Dev Account Form */}
              <div className="space-y-3 p-4 bg-purple-900/20 border border-purple-600/30 rounded-lg">
                <h3 className="text-purple-400 font-medium">New Developer Account</h3>
                <Input
                  value={newDevUsername}
                  onChange={(e) => setNewDevUsername(e.target.value)}
                  placeholder="Developer username"
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
                <Input
                  type="password"
                  value={newDevPassword}
                  onChange={(e) => setNewDevPassword(e.target.value)}
                  placeholder="Developer password (min 8 chars)"
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
                <Button onClick={handleCreateDevAccount} className="w-full bg-purple-600 hover:bg-purple-700">
                  Create Developer Account
                </Button>
              </div>

              {/* Created Dev Accounts List */}
              <div className="space-y-2">
                <h3 className="text-white font-medium">Created Developer Accounts ({createdDevAccounts.length})</h3>
                {createdDevAccounts.length === 0 ? (
                  <p className="text-zinc-400 text-sm">No additional developer accounts created</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {createdDevAccounts.map((account, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{account.username}</p>
                          <p className="text-zinc-400 text-sm">Password: {account.password}</p>
                          <p className="text-zinc-500 text-xs">Created: {account.created}</p>
                        </div>
                        <Button
                          onClick={() => handleDeleteDevAccount(account.username)}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-900/20 border border-amber-600/30 rounded-lg">
                <p className="text-amber-400 text-sm font-medium">⚠️ Security Note</p>
                <p className="text-amber-300 text-xs">
                  Main developer account (@devadmin) cannot be deleted for security reasons. Only additional dev
                  accounts can be removed.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowCreateDevPanel(false)}
                  variant="outline"
                  className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  )
}
