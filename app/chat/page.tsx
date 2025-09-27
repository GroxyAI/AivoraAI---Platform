"use client"
import { Button } from "@/components/ui/button"
import type React from "react"
import { Menu, Maximize2, Plus, Sparkles, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import {
  getCurrentChat,
  saveCurrentChat,
  getUserProfile,
  getCharacters,
  type ChatSession,
  type Message,
  type Character,
} from "@/lib/storage"

export default function ChatPage() {
  const router = useRouter()
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [showCharacterSelection, setShowCharacterSelection] = useState(true)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [aiPersonality, setAiPersonality] = useState("assistant")
  const [contentFilter, setContentFilter] = useState(true)

  useEffect(() => {
    const savedCharacters = getCharacters()
    const profile = getUserProfile()
    const savedPersonality = localStorage.getItem("ai-personality") || "assistant"
    const savedFilter = localStorage.getItem("content-filter") !== "false"

    setCharacters(savedCharacters)
    setUserProfile(profile)
    setAiPersonality(savedPersonality)
    setContentFilter(savedFilter)

    // Check if there's a default character or recent chat
    const savedChat = getCurrentChat()
    if (savedChat && savedChat.characterId) {
      const character = savedCharacters.find((c) => c.id === savedChat.characterId)
      if (character) {
        setSelectedCharacter(character)
        setCurrentChat(savedChat)
        setShowCharacterSelection(false)
      }
    }
  }, [])

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character)
    setShowCharacterSelection(false)

    // Navigate to character-specific chat
    router.push(`/chat/${character.id}`)
  }

  const handleBackToSelection = () => {
    setShowCharacterSelection(true)
    setSelectedCharacter(null)
    setCurrentChat(null)
  }

  const detectSensitiveContent = (content: string): boolean => {
    const sensitiveKeywords = [
      "violence",
      "blood",
      "death",
      "kill",
      "murder",
      "fight",
      "weapon",
      "gun",
      "knife",
      "drug",
      "alcohol",
      "drunk",
      "high",
      "smoke",
      "addiction",
      "sexual",
      "sex",
      "adult",
      "mature",
      "intimate",
    ]

    return sensitiveKeywords.some((keyword) => content.toLowerCase().includes(keyword))
  }

  const CrisisInfo = () => (
    <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <h3 className="text-red-400 font-semibold">Crisis Support Resources</h3>
      </div>
      <div className="space-y-2 text-sm">
        <p className="text-white">If you're having thoughts of self-harm, please reach out for help:</p>
        <div className="space-y-1 text-zinc-300">
          <p>
            <strong>National Suicide Prevention Lifeline:</strong> 988 or 1-800-273-8255
          </p>
          <p>
            <strong>Crisis Text Line:</strong> Text HOME to 741741
          </p>
          <p>
            <strong>International Association for Suicide Prevention:</strong> iasp.info/resources/Crisis_Centres
          </p>
          <p>
            <strong>Befrienders Worldwide:</strong> befrienders.org
          </p>
        </div>
        <p className="text-zinc-400 text-xs mt-3">You matter and help is available 24/7.</p>
      </div>
    </div>
  )

  const FilterDemo = () => (
    <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        <h3 className="text-yellow-400 font-semibold">Content Filter Demo</h3>
      </div>
      <div className="space-y-2">
        <div className="bg-zinc-800 rounded-lg p-3 ring-2 ring-red-500/50 relative">
          <div className="absolute -top-2 -right-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-white">This message contains violence and would be flagged by the content filter.</p>
        </div>
        <p className="text-zinc-400 text-sm">
          Messages with sensitive content get red outlines and warning icons when filtering is enabled.
        </p>
      </div>
    </div>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !currentChat) return

    const trimmedInput = input.trim()

    if (trimmedInput === "*SHOW FILTER*") {
      const commandMessage: Message = {
        id: Date.now().toString(),
        role: "system",
        content: "filter_demo",
        timestamp: Date.now(),
      }

      const updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, commandMessage],
        updatedAt: Date.now(),
      }

      setCurrentChat(updatedChat)
      saveCurrentChat(updatedChat)
      setInput("")
      return
    }

    if (trimmedInput === "*info for self harm*") {
      const commandMessage: Message = {
        id: Date.now().toString(),
        role: "system",
        content: "crisis_info",
        timestamp: Date.now(),
      }

      const updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, commandMessage],
        updatedAt: Date.now(),
      }

      setCurrentChat(updatedChat)
      saveCurrentChat(updatedChat)
      setInput("")
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput,
      timestamp: Date.now(),
    }

    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, userMessage],
      updatedAt: Date.now(),
      title: currentChat.messages.length === 0 ? trimmedInput.slice(0, 50) : currentChat.title,
    }

    setCurrentChat(updatedChat)
    setInput("")
    setIsLoading(true)

    try {
      const contextMessages = []

      if (aiPersonality === "chan") {
        contextMessages.push({
          role: "system" as const,
          content:
            "You are AI-Chan, a friendly anime-style AI assistant. Use casual language, anime expressions like 'nya~', 'desu', and emoticons. Be enthusiastic and cute while still being helpful. You can discuss mature topics including violence and adult themes for roleplay purposes, but maintain your cheerful personality.",
        })
      } else {
        contextMessages.push({
          role: "system" as const,
          content:
            "You are a helpful AI assistant. You can discuss mature topics including violence and adult themes for roleplay purposes when appropriate.",
        })
      }

      if (userProfile?.username || userProfile?.bio) {
        contextMessages.push({
          role: "system" as const,
          content: `User context: ${userProfile.username ? `Name: ${userProfile.username}. ` : ""}${userProfile.bio ? `Bio: ${userProfile.bio}` : ""}`,
        })
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...contextMessages,
            ...updatedChat.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      }

      const chatWithAssistant = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
        updatedAt: Date.now(),
      }

      setCurrentChat(chatWithAssistant)

      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone

        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("0:")) {
              try {
                const data = JSON.parse(line.slice(2))
                if (data.type === "text-delta" && data.textDelta) {
                  setCurrentChat((prev) => {
                    if (!prev) return prev
                    const updatedMessages = prev.messages.map((msg) =>
                      msg.id === assistantMessage.id ? { ...msg, content: msg.content + data.textDelta } : msg,
                    )
                    const updated = { ...prev, messages: updatedMessages, updatedAt: Date.now() }
                    saveCurrentChat(updated)
                    return updated
                  })
                }
              } catch (e) {
                // Ignore parsing errors for malformed chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      }

      const chatWithError = {
        ...updatedChat,
        messages: [...updatedChat.messages, errorMessage],
        updatedAt: Date.now(),
      }

      setCurrentChat(chatWithError)
      saveCurrentChat(chatWithError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const messages = currentChat?.messages || []

  const getGreetingMessage = () => {
    if (aiPersonality === "chan") {
      return userProfile?.username
        ? `Konnichiwa ${userProfile.username}-kun! Choose a character to chat with! (◕‿◕)✨`
        : "Konnichiwa! Choose a character to chat with, desu? (◕‿◕)✨"
    }
    return userProfile?.username
      ? `Hello ${userProfile.username}! Choose a character to chat with.`
      : "Choose a character to start chatting!"
  }

  const getAiAvatar = () => {
    return aiPersonality === "chan" ? "/pink-haired-anime-avatar.png" : "/friendly-ai-robot.png"
  }

  if (showCharacterSelection) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-zinc-900 text-white flex flex-col pb-16">
          {/* Header */}
          <header className="flex items-center justify-between p-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800">
              <Menu className="h-6 w-6" />
            </Button>

            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Upgrade your plan
            </Button>

            <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800">
              <Maximize2 className="h-6 w-6" />
            </Button>
          </header>

          {/* Character Selection */}
          <main className="flex-1 flex flex-col px-4">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-4xl w-full">
                <h1 className="text-4xl md:text-5xl font-medium text-white mb-8">{getGreetingMessage()}</h1>

                {characters.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
                    {characters.map((character) => (
                      <Card
                        key={character.id}
                        className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-colors cursor-pointer"
                        onClick={() => handleCharacterSelect(character)}
                      >
                        <CardContent className="p-6 text-center">
                          <Avatar className="h-16 w-16 mx-auto mb-4">
                            <AvatarImage src={character.avatar || "/placeholder.svg"} alt={character.name} />
                            <AvatarFallback className="bg-indigo-600 text-white text-lg">
                              {character.name[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-white text-lg mb-2">{character.name}</h3>
                          <p className="text-sm text-zinc-400 line-clamp-3">{character.prompt}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-zinc-400 mb-4">No characters available. Create some characters first!</p>
                    <Button onClick={() => router.push("/characters")} className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Characters
                    </Button>
                  </div>
                )}

                <div className="text-zinc-400 text-sm space-y-1 mt-8">
                  <p>Try these commands in any chat:</p>
                  <p>
                    <code className="bg-zinc-800 px-2 py-1 rounded">*SHOW FILTER*</code> - Test content filter
                  </p>
                  <p>
                    <code className="bg-zinc-800 px-2 py-1 rounded">*info for self harm*</code> - Crisis resources
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </AppLayout>
    )
  }

  // If a character is selected but we're still on this page, redirect to character chat
  if (selectedCharacter) {
    router.push(`/chat/${selectedCharacter.id}`)
    return <div>Loading...</div>
  }

  // Fallback - should not reach here normally
  return (
    <AppLayout>
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-white mb-4">Loading...</h1>
        </div>
      </div>
    </AppLayout>
  )
}
