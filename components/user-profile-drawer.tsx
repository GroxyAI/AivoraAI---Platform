"use client"

import { useState, useEffect } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, MessageCircle, Sparkles, Calendar, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: number
  username: string
  email?: string
  profile_picture?: string
  bio?: string
  characters_created: number
  total_chats: number
  joined_date: string
  characters?: Array<{
    id: number
    name: string
    avatar_url: string
    likes_count: number
  }>
}

interface UserProfileDrawerProps {
  username: string | null
  isOpen: boolean
  onClose: () => void
}

export function UserProfileDrawer({ username, isOpen, onClose }: UserProfileDrawerProps) {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && username) {
      fetchUserProfile(username)
    }
  }, [isOpen, username])

  const fetchUserProfile = async (username: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${encodeURIComponent(username)}`)
      const data = await response.json()

      if (response.ok) {
        setProfile(data.profile)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch user profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChatWithCharacter = (characterId: number) => {
    onClose()
    router.push(`/chat/${characterId}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-zinc-900 border-zinc-800 max-h-[85vh] rounded-t-3xl">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="relative">
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
            <DrawerTitle className="text-white sr-only">User Profile</DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-6 space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-zinc-400">Loading profile...</p>
              </div>
            ) : profile ? (
              <>
                {/* Profile Header */}
                <div className="text-center space-y-3">
                  <Avatar className="h-20 w-20 mx-auto border-2 border-indigo-500">
                    <AvatarImage src={profile.profile_picture || "/aivora-mascot.png"} alt={profile.username} />
                    <AvatarFallback className="bg-zinc-800 text-white text-2xl">
                      {profile.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold text-white">{profile.username}</h2>
                    {profile.bio && <p className="text-sm text-zinc-400 mt-1">{profile.bio}</p>}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-indigo-400">{profile.characters_created}</div>
                      <div className="text-xs text-zinc-400 mt-1">Characters</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-indigo-400">{profile.total_chats}</div>
                      <div className="text-xs text-zinc-400 mt-1">Chats</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardContent className="p-3 text-center">
                      <Calendar className="h-6 w-6 text-indigo-400 mx-auto" />
                      <div className="text-xs text-zinc-400 mt-1">{formatDate(profile.joined_date)}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Characters Created */}
                {profile.characters && profile.characters.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-400" />
                      Created Characters
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {profile.characters.map((character) => (
                        <Card
                          key={character.id}
                          className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-colors cursor-pointer"
                          onClick={() => handleChatWithCharacter(character.id)}
                        >
                          <CardContent className="p-3 flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={character.avatar_url || "/aivora-mascot.png"} alt={character.name} />
                              <AvatarFallback className="bg-zinc-700 text-white">
                                <User className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{character.name}</p>
                              <p className="text-xs text-zinc-400">{character.likes_count} likes</p>
                            </div>
                            <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">User profile not found</p>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
