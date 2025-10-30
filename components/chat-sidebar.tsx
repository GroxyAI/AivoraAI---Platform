"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { X, Plus, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getRecentChats, getCharacters, type ChatSession, type Character } from "@/lib/storage"
import { cn } from "@/lib/utils"

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [recentChats, setRecentChats] = useState<ChatSession[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const chats = getRecentChats(10)
    const chars = getCharacters()
    setRecentChats(chats)
    setCharacters(chars)
  }, [mounted, isOpen])

  const getCharacterForChat = (chat: ChatSession): Character | undefined => {
    if (!chat.characterId) return undefined
    return characters.find((c) => c.id === chat.characterId)
  }

  const handleChatClick = (chat: ChatSession) => {
    if (chat.characterId) {
      router.push(`/chat/${chat.characterId}`)
    }
    onClose()
  }

  const handleNewChat = () => {
    router.push("/chat")
    onClose()
  }

  if (!mounted) return null

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-zinc-800 z-50 flex flex-col transition-transform duration-300 md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm">AivoraAI</span>
              <span className="text-zinc-500 text-xs">Chat Platform</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-zinc-800">
          <Button
            onClick={handleNewChat}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Recent Chats */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {recentChats.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Recent Chats</h3>
                {recentChats.map((chat) => {
                  const character = getCharacterForChat(chat)
                  const isActive = pathname === `/chat/${chat.characterId}`

                  return (
                    <button
                      key={chat.id}
                      onClick={() => handleChatClick(chat)}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left",
                        isActive
                          ? "bg-indigo-600/20 border border-indigo-500/50"
                          : "hover:bg-zinc-800 border border-transparent",
                      )}
                    >
                      {character && (
                        <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5">
                          <AvatarImage src={character.avatar || "/placeholder.svg"} alt={character.name} />
                          <AvatarFallback className="bg-indigo-600 text-white text-xs">
                            {character.name[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      {!character && (
                        <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MessageSquare className="h-4 w-4 text-zinc-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{character?.name || "Chat"}</p>
                        <p className="text-xs text-zinc-400 truncate">{chat.title}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-400">No recent chats</p>
                <p className="text-xs text-zinc-500 mt-1">Start a new chat to begin</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <Button
            variant="ghost"
            className="w-full text-zinc-400 hover:text-white justify-start"
            onClick={() => {
              router.push("/characters")
              onClose()
            }}
          >
            Browse Characters
          </Button>
        </div>
      </div>
    </>
  )
}
