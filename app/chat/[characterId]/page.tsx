"use client"
import { Button } from "@/components/ui/button"
import type React from "react"
import { Input } from "@/components/ui/input"
import { Maximize2, Mic, ArrowUp, AlertTriangle, ArrowLeft, Trash2 } from "lucide-react"
import { useState, useEffect, use, useRef } from "react"
import { AppLayout } from "@/components/app-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import {
  getCharacterChatSession,
  saveCharacterChatSession,
  createNewCharacterChatSession,
  getUserProfile,
  getCharacters,
  awardChatTokens,
  getPreferredModel,
  deductTokens,
  getChatSessions,
  saveChatSessions,
  type ChatSession,
  type Message,
  type Character,
} from "@/lib/storage"
import { analyzeContent, shouldBlockMessage, type ContentWarning } from "@/lib/content-filter"
import { formatText } from "@/lib/text-formatter"
import { FileUploadButton } from "@/components/file-upload-button"
import { MessageAttachment } from "@/components/message-attachment"
import type { FileUploadResult } from "@/lib/file-upload"
import { UserProfileDrawer } from "@/components/user-profile-drawer"

interface CharacterChatPageProps {
  params: Promise<{
    characterId: string
  }>
}

interface ExtendedMessage extends Message {
  attachment?: {
    fileType: string
    fileName: string
    displayUrl: string
    base64Data: string
  }
}

export default function CharacterChatPage({ params }: CharacterChatPageProps) {
  const { characterId } = use(params)
  const router = useRouter()
  const [character, setCharacter] = useState<Character | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileUploadResult | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null)
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [characterNotFound, setCharacterNotFound] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [contentFilter, setContentFilter] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false)

  useEffect(() => {
    const initializeChat = async () => {
      try {
        let foundCharacter = getCharacters().find((c) => c.id === characterId)

        if (!foundCharacter) {
          try {
            const response = await fetch("/api/characters")
            const data = await response.json()
            if (response.ok && data.characters) {
              const globalChar = data.characters.find((c: any) => c.id.toString() === characterId)
              if (globalChar) {
                foundCharacter = {
                  id: globalChar.id.toString(),
                  name: globalChar.name,
                  prompt: globalChar.prompt,
                  avatar: globalChar.avatar_url,
                  creator_username: globalChar.creator_username,
                }
              }
            }
          } catch (err) {
            console.error("[v0] Error fetching global character:", err)
          }
        }

        if (!foundCharacter) {
          setCharacterNotFound(true)
          return
        }

        setCharacter(foundCharacter)

        const savedChat = getCharacterChatSession(characterId)
        const profile = getUserProfile()
        const savedFilter = localStorage.getItem("content-filter") !== "false"

        if (savedChat) {
          setChatSession(savedChat)
          setMessages(savedChat.messages)
        } else {
          const newChat = createNewCharacterChatSession(characterId)
          setChatSession(newChat)
          saveCharacterChatSession(newChat)
        }

        setUserProfile(profile)
        setContentFilter(savedFilter)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeChat()
  }, [characterId])

  useEffect(() => {
    if (characterNotFound && !isInitializing) {
      router.push("/characters")
    }
  }, [characterNotFound, isInitializing, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
        <h3 className="text-yellow-400 font-semibold">Content Filter Examples</h3>
      </div>
      <div className="space-y-3">
        {/* Medium level warning */}
        <div className="bg-zinc-800 rounded-lg p-3 ring-2 ring-yellow-500/50 relative">
          <div className="absolute -top-2 -right-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-white text-sm">
            This message contains violence and would be flagged as concerning content.
          </p>
          <div className="mt-2 text-xs text-yellow-400">⚠️ Violence detected</div>
        </div>

        {/* High level warning */}
        <div className="bg-zinc-800 rounded-lg p-3 ring-2 ring-red-500/50 relative">
          <div className="absolute -top-2 -right-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-white text-sm">This message contains mature content that requires a stronger warning.</p>
          <div className="mt-2 text-xs text-red-400">🔞 Mature Content detected</div>
        </div>

        {/* Blocked content */}
        <div className="bg-zinc-800 rounded-lg p-3 ring-2 ring-red-600 relative opacity-75">
          <div className="absolute -top-2 -right-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-white text-sm blur-sm">This message would be blocked due to harmful content.</p>
          <div className="mt-2 text-xs text-red-600">🚫 Content blocked - Self-Harm detected</div>
        </div>

        <p className="text-zinc-400 text-sm">
          Different content types receive different warning levels and visual treatments.
        </p>
      </div>
    </div>
  )

  const analyzeMessageContent = (content: string): ContentWarning => {
    return analyzeContent(content)
  }

  const startNewChat = () => {
    if (!character) return

    const newChat = createNewCharacterChatSession(characterId)
    setChatSession(newChat)
    saveCharacterChatSession(newChat)
    setError(null)
    setMessages([])
  }

  const deleteCurrentSession = () => {
    if (!chatSession) return

    const sessions = getChatSessions()
    const filteredSessions = sessions.filter((s) => s.id !== chatSession.id)
    saveChatSessions(filteredSessions)

    localStorage.removeItem(`character-chat-${characterId}`)

    setShowDeleteConfirm(false)
    setChatSession(null)
    setMessages([])

    const newChat = createNewCharacterChatSession(characterId)
    setChatSession(newChat)
    saveCharacterChatSession(newChat)
  }

  const retryLastMessage = async () => {
    if (!chatSession || !character || messages.length === 0) return

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")
    if (!lastUserMessage) return

    setIsRetrying(true)
    setError(null)

    const messagesUpToLastUser = messages.slice(0, messages.lastIndexOf(lastUserMessage) + 1)

    const chatForRetry = {
      ...chatSession,
      messages: messagesUpToLastUser,
    }

    setMessages(messagesUpToLastUser)

    await sendMessageToAPI(chatForRetry, lastUserMessage.content)
    setIsRetrying(false)
  }

  const sendMessageToAPI = async (chat: ChatSession, messageContent: string) => {
    if (!character) return

    try {
      setError(null)

      const selectedModel = getPreferredModel()
      const modelCosts = { basic: 0, advanced: 5, premium: 10 }
      const cost = modelCosts[selectedModel]

      if (cost > 0 && !deductTokens(cost)) {
        throw new Error(`Insufficient tokens. You need ${cost} tokens to use the ${selectedModel} model.`)
      }

      const contextMessages = []
      contextMessages.push({
        role: "system" as const,
        content: character.prompt,
      })

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
            ...chat.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
          model: selectedModel,
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Too many requests. Please wait a moment and try again.")
        } else if (response.status === 500) {
          throw new Error("Server error. Please try again in a few moments.")
        } else if (response.status === 401) {
          throw new Error("Authentication error. Please refresh the page.")
        } else {
          throw new Error(`Request failed with status ${response.status}. Please try again.`)
        }
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("Unable to read response. Please check your connection and try again.")

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      }

      const chatWithAssistant = {
        ...chat,
        messages: [...chat.messages, assistantMessage],
        updatedAt: Date.now(),
      }

      setMessages([...messages, assistantMessage])

      const decoder = new TextDecoder()
      let done = false
      let hasReceivedContent = false
      let modelFallbackShown = false

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
                if (data.type === "model-fallback" && !modelFallbackShown) {
                  modelFallbackShown = true
                  setError(
                    `Switched to ${data.usedModel} model due to rate limits on ${data.originalModel}. Your chat continues normally.`,
                  )
                  setTimeout(() => {
                    setError(null)
                  }, 5000)
                }
                if (data.type === "text-delta" && data.textDelta) {
                  hasReceivedContent = true
                  setMessages((prev) => {
                    const updatedMessages = prev.map((msg) =>
                      msg.id === assistantMessage.id ? { ...msg, content: msg.content + data.textDelta } : msg,
                    )
                    const updatedChat = { ...chat, messages: updatedMessages, updatedAt: Date.now() }
                    saveCharacterChatSession(updatedChat)
                    return updatedMessages
                  })
                }
              } catch (e) {
                console.error("[v0] Error parsing streaming chunk:", e)
              }
            }
          }
        }
      }

      if (!hasReceivedContent) {
        throw new Error("No response received from the AI. Please try again.")
      }

      awardChatTokens()
    } catch (error) {
      console.error("[v0] Chat API error:", error)

      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again."
      setError(errorMessage)

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble responding right now. Please try again or start a new chat.",
        timestamp: Date.now(),
      }

      const chatWithError = {
        ...chatSession,
        messages: [...messages, errorResponse],
        updatedAt: Date.now(),
      }

      setMessages([...messages, errorResponse])
      saveCharacterChatSession(chatWithError)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !selectedFile) || isLoading || !chatSession || !character) return

    const trimmedInput = input.trim()

    if (trimmedInput === "*SHOW FILTER*") {
      const commandMessage: Message = {
        id: Date.now().toString(),
        role: "system",
        content: "filter_demo",
        timestamp: Date.now(),
      }

      const updatedChat = {
        ...chatSession,
        messages: [...messages, commandMessage],
        updatedAt: Date.now(),
      }

      setMessages([...messages, commandMessage])
      saveCharacterChatSession(updatedChat)
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
        ...chatSession,
        messages: [...messages, commandMessage],
        updatedAt: Date.now(),
      }

      setMessages([...messages, commandMessage])
      saveCharacterChatSession(updatedChat)
      setInput("")
      return
    }

    const contentAnalysis = analyzeMessageContent(trimmedInput)
    if (shouldBlockMessage(contentAnalysis.level)) {
      const crisisMessage: Message = {
        id: Date.now().toString(),
        role: "system",
        content: "crisis_info",
        timestamp: Date.now(),
      }

      const updatedChat = {
        ...chatSession,
        messages: [...messages, crisisMessage],
        updatedAt: Date.now(),
      }

      setMessages([...messages, crisisMessage])
      saveCharacterChatSession(updatedChat)
      setInput("")
      return
    }

    const userMessage: ExtendedMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput || "[Image/File attached]",
      timestamp: Date.now(),
      ...(selectedFile && {
        attachment: {
          fileType: selectedFile.fileType,
          fileName: selectedFile.fileName,
          displayUrl: selectedFile.displayUrl,
          base64Data: selectedFile.base64Data,
        },
      }),
    }

    const updatedChat = {
      ...chatSession,
      messages: [...messages, userMessage],
      updatedAt: Date.now(),
      title: messages.length === 0 ? trimmedInput.slice(0, 50) : chatSession.title,
    }

    setMessages([...messages, userMessage])
    setInput("")
    setSelectedFile(null)
    setIsLoading(true)

    const messageContent = selectedFile
      ? `${trimmedInput}\n\n[User attached an image/file: ${selectedFile.fileName}. Base64 data: ${selectedFile.base64Data.substring(0, 100)}...]`
      : trimmedInput

    await sendMessageToAPI(updatedChat, messageContent)
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleUsernameClick = (username: string) => {
    setSelectedUsername(username)
    setIsProfileDrawerOpen(true)
  }

  if (!character) {
    return <div>Loading...</div>
  }

  return (
    <AppLayout>
      <div className="h-full bg-zinc-900 text-white flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-zinc-800"
              onClick={() => router.push("/characters")}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={character.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-indigo-600 text-white text-sm">
                {character.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold">{character.name}</h1>
              {character.creator_username && (
                <button
                  onClick={() => handleUsernameClick(character.creator_username!)}
                  className="text-xs text-zinc-400 hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  by {character.creator_username}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-zinc-800 text-sm" onClick={startNewChat}>
              New Chat
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-zinc-800"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete this chat session"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-zinc-800">
              <Maximize2 className="h-6 w-6" />
            </Button>
          </div>
        </header>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 max-w-sm mx-4">
              <h3 className="text-lg font-semibold text-white mb-2">Delete Chat Session?</h3>
              <p className="text-zinc-400 mb-6">
                This will permanently delete this chat session. You can start a new chat with {character.name} anytime.
              </p>
              <div className="flex gap-3">
                <Button onClick={deleteCurrentSession} className="bg-red-600 hover:bg-red-700 flex-1">
                  Delete
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div
            className={`mx-4 mb-4 border rounded-lg p-3 flex items-center justify-between ${
              error.includes("Switched to") ? "bg-blue-900/20 border-blue-500" : "bg-red-900/20 border-red-500"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={`h-4 w-4 ${error.includes("Switched to") ? "text-blue-500" : "text-red-500"}`}
              />
              <span className={`text-sm ${error.includes("Switched to") ? "text-blue-400" : "text-red-400"}`}>
                {error}
              </span>
            </div>
            <div className="flex gap-2">
              {!error.includes("Switched to") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/30 text-xs"
                  onClick={retryLastMessage}
                  disabled={isRetrying}
                >
                  {isRetrying ? "Retrying..." : "Retry"}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={`hover:bg-opacity-30 text-xs ${
                  error.includes("Switched to")
                    ? "text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                    : "text-red-400 hover:text-red-300 hover:bg-red-900/30"
                }`}
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-h-0 px-4">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Avatar className="h-16 w-16 mx-auto mb-4">
                  <AvatarImage src={character.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-indigo-600 text-white text-lg">
                    {character.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-4xl md:text-5xl font-medium text-white mb-8">{getGreetingMessage()}</h1>
                <div className="text-zinc-400 text-sm space-y-1">
                  <p>Try these commands:</p>
                  <p>
                    <code className="bg-zinc-800 px-2 py-1 rounded">*SHOW FILTER*</code> - Test content filter
                  </p>
                  <p>
                    <code className="bg-zinc-800 px-2 py-1 rounded">*info for self harm*</code> - Crisis resources
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto py-4 space-y-4 max-w-3xl mx-auto w-full">
              {messages.map((message) => {
                const extendedMessage = message as ExtendedMessage

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={character.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-indigo-600 text-white text-sm">
                          {character.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="relative">
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === "user" ? "bg-indigo-600 text-white" : "bg-zinc-800 text-white"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{formatText(message.content)}</div>
                        {extendedMessage.attachment && (
                          <MessageAttachment
                            fileType={extendedMessage.attachment.fileType}
                            fileName={extendedMessage.attachment.fileName}
                            displayUrl={extendedMessage.attachment.displayUrl}
                          />
                        )}
                        {message.role === "assistant" && (
                          <div className="mt-2 pt-2 border-t border-zinc-700/50 flex justify-end">
                            <span className="text-xs bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-medium">
                              A.ai
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={userProfile?.profilePicture || "/aivora-mascot.png"} />
                        <AvatarFallback className="bg-zinc-600 text-white text-sm">
                          {userProfile?.username ? userProfile.username[0].toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )
              })}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={character.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-indigo-600 text-white text-sm">
                      {character.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-zinc-800 text-white rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              {isRetrying && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={character.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-indigo-600 text-white text-sm">
                      {character.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-yellow-900/20 border border-yellow-500 text-yellow-400 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-sm">Retrying...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Input Area */}
        <div className="flex-shrink-0 pb-4 pt-2 max-w-3xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="flex items-center bg-zinc-800 rounded-full px-4 py-3 gap-3">
            <FileUploadButton
              onFileSelect={setSelectedFile}
              onFileRemove={() => setSelectedFile(null)}
              selectedFile={selectedFile}
              disabled={isLoading}
            />

            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={`Chat with ${character.name}...`}
              disabled={isLoading}
              className="flex-1 bg-transparent border-none text-white placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full"
            >
              <Mic className="h-5 w-5" />
            </Button>

            <Button
              type="submit"
              disabled={(!input.trim() && !selectedFile) || isLoading}
              size="icon"
              className="bg-zinc-600 hover:bg-zinc-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-full"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </form>
        </div>
        {/* User Profile Drawer */}
        <UserProfileDrawer
          username={selectedUsername}
          isOpen={isProfileDrawerOpen}
          onClose={() => setIsProfileDrawerOpen(false)}
        />
      </div>
    </AppLayout>
  )
}

function getGreetingMessage(userProfile: any, character: Character): string {
  return userProfile?.username
    ? `Hello ${userProfile.username}! I'm ${character.name}. How can I help you today?`
    : `Hello! I'm ${character.name}. How can I help you today?`
}
