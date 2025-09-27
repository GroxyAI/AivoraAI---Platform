"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowRight, Check } from "lucide-react"

interface PinSetupWizardProps {
  onComplete: () => void
  onSkip: () => void
}

export function PinSetupWizard({ onComplete, onSkip }: PinSetupWizardProps) {
  const [step, setStep] = useState(1)
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")

  const hashPin = (pin: string): string => {
    return btoa(pin + "salt").replace(/[^a-zA-Z0-9]/g, "")
  }

  const handleSetupComplete = () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      alert("PIN must be exactly 4 digits")
      return
    }
    if (pin !== confirmPin) {
      alert("PINs don't match")
      return
    }

    const hashedPin = hashPin(pin)
    const savedProfile = localStorage.getItem("userProfile")
    const profile = savedProfile ? JSON.parse(savedProfile) : {}

    const updatedProfile = {
      ...profile,
      pinEnabled: true,
      pinHash: hashedPin,
    }

    localStorage.setItem("userProfile", JSON.stringify(updatedProfile))
    onComplete()
  }

  const steps = [
    {
      title: "Welcome to Chat App",
      description: "Let's set up PIN protection to keep your chats private and secure.",
      content: (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-full">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Secure Your Chats</h3>
            <p className="text-zinc-400">
              Set up a 4-digit PIN to protect your conversations from unauthorized access.
            </p>
          </div>
          <div className="space-y-3 text-sm text-zinc-400">
            <div className="flex items-center gap-3">
              <Check className="h-4 w-4 text-green-400" />
              <span>Keep your conversations private</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-4 w-4 text-green-400" />
              <span>Quick and easy access</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-4 w-4 text-green-400" />
              <span>Works offline</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Create Your PIN",
      description: "Choose a 4-digit PIN that you'll remember easily.",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Enter 4-digit PIN</label>
              <Input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.slice(0, 4))}
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
          </div>
          <div className="text-xs text-zinc-400 space-y-1">
            <p>• Use numbers only (0-9)</p>
            <p>• Avoid obvious combinations like 1234</p>
            <p>• Choose something you'll remember</p>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-800 border-zinc-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white">{steps[step - 1].title}</CardTitle>
          <p className="text-zinc-400 text-sm">{steps[step - 1].description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps[step - 1].content}

          <div className="flex gap-3">
            {step === 1 ? (
              <>
                <Button
                  onClick={onSkip}
                  variant="outline"
                  className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                >
                  Skip for now
                </Button>
                <Button onClick={() => setStep(2)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                  Set up PIN
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSetupComplete}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={pin.length !== 4 || confirmPin.length !== 4}
                >
                  Complete Setup
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2">
            {[1, 2].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-2 h-2 rounded-full ${step >= stepNum ? "bg-indigo-500" : "bg-zinc-600"}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
