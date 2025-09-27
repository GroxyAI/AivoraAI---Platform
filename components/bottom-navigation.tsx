"use client"

import { MessageCircle, Users, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BottomNavigationProps {
  activeTab: "chat" | "characters" | "settings" | "account"
  onTabChange: (tab: "chat" | "characters" | "settings" | "account") => void
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-4 py-2">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTabChange("chat")}
          className={`flex flex-col items-center gap-1 p-3 ${
            activeTab === "chat" ? "text-indigo-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-xs">Chat</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTabChange("characters")}
          className={`flex flex-col items-center gap-1 p-3 ${
            activeTab === "characters" ? "text-indigo-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs">Characters</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTabChange("account")}
          className={`flex flex-col items-center gap-1 p-3 ${
            activeTab === "account" ? "text-indigo-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Account</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTabChange("settings")}
          className={`flex flex-col items-center gap-1 p-3 ${
            activeTab === "settings" ? "text-indigo-400" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </nav>
  )
}
