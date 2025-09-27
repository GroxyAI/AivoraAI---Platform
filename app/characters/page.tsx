"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Edit, Trash2, User, MessageCircle } from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { getCharacters, saveCharacters, type Character } from "@/lib/storage"
import { useRouter } from "next/navigation"

export default function CharactersPage() {
  const router = useRouter()
  const [characters, setCharacters] = useState<Character[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    prompt: "",
    avatar: "",
  })

  useEffect(() => {
    const savedCharacters = getCharacters()
    if (savedCharacters.length > 0) {
      setCharacters(savedCharacters)
    } else {
      const defaultCharacter: Character = {
        id: "1",
        name: "Assistant",
        prompt: "You are a helpful AI assistant that provides clear and concise answers.",
        avatar: "/ai-assistant-avatar.png",
      }
      setCharacters([defaultCharacter])
      saveCharacters([defaultCharacter])
    }
  }, [])

  const handleCreateCharacter = () => {
    if (formData.name.trim() && formData.prompt.trim()) {
      const newCharacter: Character = {
        id: Date.now().toString(),
        name: formData.name,
        prompt: formData.prompt,
        avatar: formData.avatar || `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(formData.name)}`,
      }
      const updatedCharacters = [...characters, newCharacter]
      setCharacters(updatedCharacters)
      saveCharacters(updatedCharacters)
      setFormData({ name: "", prompt: "", avatar: "" })
      setIsCreating(false)
    }
  }

  const handleEditCharacter = (character: Character) => {
    setFormData({
      name: character.name,
      prompt: character.prompt,
      avatar: character.avatar,
    })
    setEditingId(character.id)
    setIsCreating(true)
  }

  const handleUpdateCharacter = () => {
    if (editingId && formData.name.trim() && formData.prompt.trim()) {
      const updatedCharacters = characters.map((char) =>
        char.id === editingId
          ? { ...char, name: formData.name, prompt: formData.prompt, avatar: formData.avatar }
          : char,
      )
      setCharacters(updatedCharacters)
      saveCharacters(updatedCharacters)
      setFormData({ name: "", prompt: "", avatar: "" })
      setIsCreating(false)
      setEditingId(null)
    }
  }

  const handleDeleteCharacter = (id: string) => {
    const updatedCharacters = characters.filter((char) => char.id !== id)
    setCharacters(updatedCharacters)
    saveCharacters(updatedCharacters)
  }

  const handleCancel = () => {
    setFormData({ name: "", prompt: "", avatar: "" })
    setIsCreating(false)
    setEditingId(null)
  }

  const handleChatWithCharacter = (characterId: string) => {
    router.push(`/chat/${characterId}`)
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-zinc-900 text-white p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Characters</h1>
            <Button onClick={() => setIsCreating(true)} className="bg-indigo-600 hover:bg-indigo-700 rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Character
            </Button>
          </div>

          {isCreating && (
            <Card className="bg-zinc-800 border-zinc-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">{editingId ? "Edit Character" : "Create New Character"}</CardTitle>
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
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
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

                <div className="flex gap-2">
                  <Button
                    onClick={editingId ? handleUpdateCharacter : handleCreateCharacter}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {editingId ? "Update" : "Create"}
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {characters.map((character) => (
              <Card key={character.id} className="bg-zinc-800 border-zinc-700 hover:bg-zinc-750 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={character.avatar || "/placeholder.svg"} alt={character.name} />
                      <AvatarFallback className="bg-zinc-700 text-white">
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{character.name}</h3>
                      <p className="text-sm text-zinc-400 mt-1 line-clamp-3">{character.prompt}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleChatWithCharacter(character.id)}
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 flex-1"
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Chat
                    </Button>
                    <Button
                      onClick={() => handleEditCharacter(character)}
                      size="sm"
                      variant="outline"
                      className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteCharacter(character.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {characters.length === 0 && !isCreating && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-zinc-400 mb-2">No characters yet</h3>
              <p className="text-zinc-500 mb-4">Create your first character to get started</p>
              <Button onClick={() => setIsCreating(true)} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Character
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
