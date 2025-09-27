"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shield, Delete, Fingerprint } from "lucide-react"
import { BiometricAuth } from "@/lib/biometric-auth"

interface PinEntryProps {
  onSuccess: () => void
  onSetupPin: () => void
}

export function PinEntry({ onSuccess, onSetupPin }: PinEntryProps) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [biometricSupported, setBiometricSupported] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)

  const hashPin = (pin: string): string => {
    return btoa(pin + "salt").replace(/[^a-zA-Z0-9]/g, "")
  }

  const handleNumberPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num
      setPin(newPin)
      setError("")

      if (newPin.length === 4) {
        setTimeout(() => verifyPin(newPin), 100)
      }
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
    setError("")
  }

  const verifyPin = (enteredPin: string) => {
    const savedProfile = localStorage.getItem("userProfile")
    if (!savedProfile) {
      onSetupPin()
      return
    }

    const profile = JSON.parse(savedProfile)
    if (!profile.pinEnabled || !profile.pinHash) {
      onSetupPin()
      return
    }

    const hashedPin = hashPin(enteredPin)
    if (hashedPin === profile.pinHash) {
      onSuccess()
    } else {
      setError("Incorrect PIN")
      setPin("")
      setAttempts((prev) => prev + 1)

      if (attempts >= 4) {
        setError("Too many attempts. Try again later.")
        setTimeout(() => {
          setAttempts(0)
          setError("")
        }, 30000)
      }
    }
  }

  const handleBiometricAuth = async () => {
    const result = await BiometricAuth.authenticate()
    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || "Biometric authentication failed")
    }
  }

  useEffect(() => {
    BiometricAuth.isSupported().then(setBiometricSupported)

    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      setBiometricEnabled(profile.biometricEnabled || false)
    }
  }, [])

  const numbers = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "delete"],
  ]

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Enter PIN</h1>
          <p className="text-zinc-400">Enter your 4-digit PIN to access your chats</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 ${
                pin.length > index ? "bg-indigo-500 border-indigo-500" : "border-zinc-600"
              }`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-center mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Face ID Option */}
        {biometricSupported && biometricEnabled && (
          <div className="text-center mb-6">
            <Button onClick={handleBiometricAuth} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
              <Fingerprint className="h-5 w-5 mr-2" />
              Use Face ID
            </Button>
            <p className="text-zinc-500 text-sm mt-2">or enter your PIN below</p>
          </div>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {numbers.flat().map((num, index) => {
            if (num === "") return <div key={index} />
            if (num === "delete") {
              return (
                <Button
                  key={index}
                  onClick={handleDelete}
                  variant="outline"
                  className="h-16 border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                  disabled={pin.length === 0 || attempts >= 5}
                >
                  <Delete className="h-6 w-6" />
                </Button>
              )
            }
            return (
              <Button
                key={index}
                onClick={() => handleNumberPress(num)}
                variant="outline"
                className="h-16 text-xl border-zinc-600 text-white hover:bg-zinc-700 bg-transparent"
                disabled={attempts >= 5}
              >
                {num}
              </Button>
            )
          })}
        </div>

        {/* Setup PIN Button */}
        <Button
          onClick={onSetupPin}
          variant="ghost"
          className="w-full text-indigo-400 hover:text-indigo-300 hover:bg-transparent"
        >
          Set up PIN instead
        </Button>
      </div>
    </div>
  )
}
