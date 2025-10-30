"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Copy, Trash2, Plus, Eye, EyeOff } from "lucide-react"
import { getUserProfile } from "@/lib/storage"

interface ApiKey {
  id: string
  keyName: string
  keyValue: string
  keyType: "kd_dev_" | "kd_live_"
  isActive: boolean
  createdAt: string
  lastUsedAt?: string
}

export default function DevPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState("")
  const [keyType, setKeyType] = useState<"kd_dev_" | "kd_live_">("kd_dev_")
  const [isLoading, setIsLoading] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    const profile = getUserProfile()
    setUserProfile(profile)
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      const response = await fetch("/api/dev/keys")
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.keys || [])
      }
    } catch (error) {
      console.error("[v0] Failed to load API keys:", error)
    }
  }

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      alert("Please enter a key name")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/dev/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyName: newKeyName,
          keyType: keyType,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setApiKeys([...apiKeys, data.key])
        setNewKeyName("")
        setVisibleKeys(new Set([...visibleKeys, data.key.id]))
      } else {
        alert("Failed to generate API key")
      }
    } catch (error) {
      console.error("[v0] Error generating API key:", error)
      alert("Error generating API key")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return

    try {
      const response = await fetch(`/api/dev/keys/${keyId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setApiKeys(apiKeys.filter((k) => k.id !== keyId))
        setVisibleKeys(new Set([...visibleKeys].filter((id) => id !== keyId)))
      } else {
        alert("Failed to delete API key")
      }
    } catch (error) {
      console.error("[v0] Error deleting API key:", error)
      alert("Error deleting API key")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId)
    } else {
      newVisible.add(keyId)
    }
    setVisibleKeys(newVisible)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Developer API</h1>
          <p className="text-zinc-400">Create and manage API keys to integrate AivoraAI into your applications</p>
        </div>

        {/* API Documentation Card */}
        <Card className="bg-zinc-800 border-zinc-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">API Documentation</CardTitle>
            <CardDescription>Get started with the AivoraAI API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-white font-semibold mb-2">Base URL</h3>
              <code className="bg-zinc-900 text-indigo-400 p-2 rounded block">
                https://aivoraaiv2.vercel.app/api/v1
              </code>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Authentication</h3>
              <p className="text-zinc-300 text-sm mb-2">Include your API key in the Authorization header:</p>
              <code className="bg-zinc-900 text-indigo-400 p-2 rounded block">Authorization: Bearer YOUR_API_KEY</code>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Chat Endpoint</h3>
              <code className="bg-zinc-900 text-indigo-400 p-2 rounded block">POST /api/v1/chat</code>
              <p className="text-zinc-300 text-sm mt-2">Send a message to a character and get a response.</p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-2">Example Request</h3>
              <pre className="bg-zinc-900 text-indigo-400 p-3 rounded text-xs overflow-x-auto">
                {`curl -X POST https://aivoraaiv2.vercel.app/api/v1/chat \\
  -H "Authorization: Bearer kd_dev_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "characterId": "1",
    "message": "Hello!",
    "sessionId": "session_123"
  }'`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Generate New Key */}
        <Card className="bg-zinc-800 border-zinc-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Generate New API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Key Name</label>
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., My App, Production Server"
                className="bg-zinc-700 border-zinc-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Key Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="kd_dev_"
                    checked={keyType === "kd_dev_"}
                    onChange={(e) => setKeyType(e.target.value as "kd_dev_")}
                    className="w-4 h-4"
                  />
                  <span className="text-white">Development (kd_dev_)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="kd_live_"
                    checked={keyType === "kd_live_"}
                    onChange={(e) => setKeyType(e.target.value as "kd_live_")}
                    className="w-4 h-4"
                  />
                  <span className="text-white">Production (kd_live_)</span>
                </label>
              </div>
            </div>

            <Button
              onClick={generateApiKey}
              disabled={isLoading || !newKeyName.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isLoading ? "Generating..." : "Generate API Key"}
            </Button>
          </CardContent>
        </Card>

        {/* API Keys List */}
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white">Your API Keys</CardTitle>
            <CardDescription>Manage your API keys for different environments</CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <p className="text-zinc-400 text-center py-8">No API keys yet. Create one to get started!</p>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="bg-zinc-700 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{key.keyName}</h3>
                        <p className="text-zinc-400 text-sm">
                          {key.keyType} • Created {new Date(key.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${key.isActive ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"}`}
                      >
                        {key.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-zinc-800 rounded p-2">
                      <code className="flex-1 text-indigo-400 text-sm font-mono">
                        {visibleKeys.has(key.id) ? key.keyValue : "•".repeat(key.keyValue.length)}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(key.id)}
                        className="text-zinc-400 hover:text-white p-1"
                        title={visibleKeys.has(key.id) ? "Hide" : "Show"}
                      >
                        {visibleKeys.has(key.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(key.keyValue)}
                        className="text-zinc-400 hover:text-white p-1"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteApiKey(key.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {key.lastUsedAt && (
                      <p className="text-zinc-400 text-xs">Last used: {new Date(key.lastUsedAt).toLocaleString()}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
