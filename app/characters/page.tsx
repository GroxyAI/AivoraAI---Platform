"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, User, MessageCircle, Heart, Star, Search, TrendingUp } from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { useRouter } from "next/navigation"

interface GlobalCharacter {
  id: number
  name: string
  prompt: string
  avatar_url: string
  creator_username: string
  likes_count: number
  views_count: number
  is_liked: boolean
  is_favorited: boolean
}

export default function CharactersPage() {
  const router = useRouter()
  const [globalCharacters, setGlobalCharacters] = useState<GlobalCharacter[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"popular" | "recent">("popular")
  const [formData, setFormData] = useState({
    name: "",
    prompt: "",
    avatar_url: "",
    is_global: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGlobalCharacters()
  }, [])

  const fetchGlobalCharacters = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/characters")
      const data = await response.json()

      if (response.ok) {
        setGlobalCharacters(data.characters)
      } else {
        setError(data.error || "Failed to load characters")
      }
    } catch (error) {
      console.error("[v0] Fetch characters error:", error)
      setError("Failed to load characters")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCharacter = async () => {
    if (!formData.name.trim() || !formData.prompt.trim()) {
      setError("Name and prompt are required")
      return
    }

    try {
      const response = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setFormData({ name: "", prompt: "", avatar_url: "", is_global: true })
        setIsCreating(false)
        fetchGlobalCharacters()
      } else {
        setError(data.error || "Failed to create character")
      }
    } catch (error) {
      console.error("[v0] Create character error:", error)
      setError("Failed to create character")
    }
  }

  const handleLikeCharacter = async (characterId: number) => {
    try {
      const response = await fetch(`/api/characters/${characterId}/like`, {
        method: "POST",
      })

      if (response.ok) {
        fetchGlobalCharacters()
      }
    } catch (error) {
      console.error("[v0] Like character error:", error)
    }
  }

  const handleFavoriteCharacter = async (characterId: number) => {
    try {
      const response = await fetch(`/api/characters/${characterId}/favorite`, {
        method: "POST",
      })

      if (response.ok) {
        fetchGlobalCharacters()
      }
    } catch (error) {
      console.error("[v0] Favorite character error:", error)
    }
  }

  const handleChatWithCharacter = (characterId: number) => {
    router.push(`/chat/${characterId}`)
  }

  const handleCancel = () => {
    setFormData({ name: "", prompt: "", avatar_url: "", is_global: true })
    setIsCreating(false)
    setError(null)
  }

  const filteredCharacters = globalCharacters
    .filter(
      (char) =>
        char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.prompt.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "popular") {
        return b.likes_count - a.likes_count
      }
      return b.id - a.id
    })

  return (
    <AppLayout>
      <div className="min-h-screen bg-zinc-900 text-white p-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Browse Characters</h1>
              <p className="text-zinc-400 text-sm mt-1">
                Discover and chat with AI characters created by the community
              </p>
            </div>
            <Button onClick={() => setIsCreating(true)} className="bg-indigo-600 hover:bg-indigo-700 rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Character
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search characters..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === "popular" ? "default" : "outline"}
                onClick={() => setSortBy("popular")}
                className={
                  sortBy === "popular"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                }
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Popular
              </Button>
              <Button
                variant={sortBy === "recent" ? "default" : "outline"}
                onClick={() => setSortBy("recent")}
                className={
                  sortBy === "recent"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                }
              >
                Recent
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
              <button onClick={() => setError(null)} className="ml-4 underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Create Character Form */}
          {isCreating && (
            <Card className="bg-zinc-800 border-zinc-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Create New Character</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Character Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter character name"
                    className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Avatar URL (optional)</label>
                  <Input
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="Enter image URL or leave blank for auto-generated"
                    className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Character Prompt</label>
                  <Textarea
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    placeholder="Describe how this character should behave and respond..."
                    rows={4}
                    className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_global"
                    checked={formData.is_global}
                    onChange={(e) => setFormData({ ...formData, is_global: e.target.checked })}
                    className="rounded border-zinc-600"
                  />
                  <label htmlFor="is_global" className="text-sm text-zinc-300">
                    Make this character globally available to all users
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateCharacter} className="bg-indigo-600 hover:bg-indigo-700">
                    Create
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="border-zinc-600 text-zinc-300 hover:bg-zinc-700 bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-zinc-400">Loading characters...</p>
            </div>
          )}

          {/* Characters Grid */}
          {!isLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCharacters.map((character) => (
                <Card key={character.id} className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={character.avatar_url || "/aivora-mascot.png"} alt={character.name} />
                        <AvatarFallback className="bg-zinc-700 text-white">
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{character.name}</h3>
                        <p className="text-xs text-zinc-400">by {character.creator_username}</p>
                      </div>
                    </div>

                    <p className="text-sm text-zinc-400 mb-4 line-clamp-3">{character.prompt}</p>

                    <div className="flex items-center gap-2 mb-3 text-sm text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Heart className={`h-4 w-4 ${character.is_liked ? "fill-red-500 text-red-500" : ""}`} />
                        <span>{character.likes_count}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleChatWithCharacter(character.id)}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 flex-1"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Chat
                      </Button>
                      <Button
                        onClick={() => handleLikeCharacter(character.id)}
                        size="sm"
                        variant="outline"
                        className={`border-zinc-600 hover:bg-zinc-700 ${
                          character.is_liked ? "text-red-400 border-red-500" : "text-zinc-300"
                        }`}
                      >
                        <Heart className={`h-3 w-3 ${character.is_liked ? "fill-current" : ""}`} />
                      </Button>
                      <Button
                        onClick={() => handleFavoriteCharacter(character.id)}
                        size="sm"
                        variant="outline"
                        className={`border-zinc-600 hover:bg-zinc-700 ${
                          character.is_favorited ? "text-yellow-400 border-yellow-500" : "text-zinc-300"
                        }`}
                      >
                        <Star className={`h-3 w-3 ${character.is_favorited ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredCharacters.length === 0 && !isCreating && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-zinc-400 mb-2">No characters found</h3>
              <p className="text-zinc-500 mb-4">
                {searchQuery ? "Try a different search term" : "Be the first to create a character"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsCreating(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Character
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
