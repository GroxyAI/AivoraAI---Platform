// Local storage utilities for managing app data
export interface UserProfile {
  username: string
  bio: string
  profilePicture: string
  storageType: "local" | "cloud"
  tokens: number
  preferredModel: "basic" | "advanced" | "premium"
  accountCreatedAt: number
  isPlatinum: boolean
  usageDays: number
  lastActiveDate: string
}

export interface Character {
  id: string
  name: string
  prompt: string
  avatar: string
}

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  characterId?: string
  createdAt: number
  updatedAt: number
}

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: "userProfile",
  CHARACTERS: "characters",
  CHAT_SESSIONS: "chatSessions",
  CURRENT_CHAT: "currentChat",
  TOKEN_HISTORY: "tokenHistory",
} as const

// User Profile Management
export const getUserProfile = (): UserProfile | null => {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE)
  return stored ? JSON.parse(stored) : null
}

export const saveUserProfile = (profile: UserProfile): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile))
}

export const initializeUserProfile = (): UserProfile => {
  const now = Date.now()
  const today = new Date().toDateString()

  return {
    username: "",
    bio: "",
    profilePicture: "",
    storageType: "local",
    tokens: 0,
    preferredModel: "basic",
    accountCreatedAt: now,
    isPlatinum: false,
    usageDays: 1,
    lastActiveDate: today,
  }
}

export const updateUserActivity = (): void => {
  const profile = getUserProfile()
  if (!profile) return

  const today = new Date().toDateString()

  if (profile.lastActiveDate !== today) {
    profile.usageDays += 1
    profile.lastActiveDate = today

    // Check if user qualifies for Platinum (2 years = 730 days)
    if (profile.usageDays >= 730 && !profile.isPlatinum) {
      profile.isPlatinum = true
    }

    saveUserProfile(profile)
  }
}

export const isPlatinumMember = (): boolean => {
  const profile = getUserProfile()
  return profile?.isPlatinum || false
}

export const getDaysUntilPlatinum = (): number => {
  const profile = getUserProfile()
  if (!profile) return 730

  const daysUsed = profile.usageDays || 0
  return Math.max(0, 730 - daysUsed)
}

export const getAccountAge = (): number => {
  const profile = getUserProfile()
  if (!profile?.accountCreatedAt) return 0

  const now = Date.now()
  const ageInDays = Math.floor((now - profile.accountCreatedAt) / (1000 * 60 * 60 * 24))
  return ageInDays
}

// Characters Management
export const getCharacters = (): Character[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.CHARACTERS)
  return stored ? JSON.parse(stored) : []
}

export const saveCharacters = (characters: Character[]): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters))
}

// Chat Sessions Management
export const getChatSessions = (): ChatSession[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS)
  return stored ? JSON.parse(stored) : []
}

export const saveChatSessions = (sessions: ChatSession[]): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessions))
}

export const getCurrentChat = (): ChatSession | null => {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_CHAT)
  return stored ? JSON.parse(stored) : null
}

export const saveCurrentChat = (chat: ChatSession): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.CURRENT_CHAT, JSON.stringify(chat))

  // Also update in chat sessions
  const sessions = getChatSessions()
  const existingIndex = sessions.findIndex((s) => s.id === chat.id)

  if (existingIndex >= 0) {
    sessions[existingIndex] = chat
  } else {
    sessions.unshift(chat)
  }

  saveChatSessions(sessions)
}

export const createNewChatSession = (characterId?: string): ChatSession => {
  const now = Date.now()
  return {
    id: now.toString(),
    title: "New Chat",
    messages: [],
    characterId,
    createdAt: now,
    updatedAt: now,
  }
}

// Character-specific chat session management
export const getCharacterChatSession = (characterId: string): ChatSession | null => {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(`character-chat-${characterId}`)
  return stored ? JSON.parse(stored) : null
}

export const saveCharacterChatSession = (chat: ChatSession): void => {
  if (typeof window === "undefined") return
  if (!chat.characterId) return

  localStorage.setItem(`character-chat-${chat.characterId}`, JSON.stringify(chat))

  // Also update in chat sessions
  const sessions = getChatSessions()
  const existingIndex = sessions.findIndex((s) => s.id === chat.id)

  if (existingIndex >= 0) {
    sessions[existingIndex] = chat
  } else {
    sessions.unshift(chat)
  }

  saveChatSessions(sessions)
}

export const createNewCharacterChatSession = (characterId: string): ChatSession => {
  const now = Date.now()
  return {
    id: `${characterId}-${now}`,
    title: "New Chat",
    messages: [],
    characterId,
    createdAt: now,
    updatedAt: now,
  }
}

export const getAllCharacterChats = (characterId: string): ChatSession[] => {
  const sessions = getChatSessions()
  return sessions.filter((session) => session.characterId === characterId)
}

export const deleteCharacterChats = (characterId: string): void => {
  if (typeof window === "undefined") return

  // Remove character-specific chat storage
  localStorage.removeItem(`character-chat-${characterId}`)

  // Remove from chat sessions
  const sessions = getChatSessions()
  const filteredSessions = sessions.filter((session) => session.characterId !== characterId)
  saveChatSessions(filteredSessions)
}

export const getRecentChats = (limit = 5): ChatSession[] => {
  const sessions = getChatSessions()
  return sessions.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit)
}

export const searchChats = (query: string): ChatSession[] => {
  const sessions = getChatSessions()
  const lowerQuery = query.toLowerCase()

  return sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(lowerQuery) ||
      session.messages.some((message) => message.content.toLowerCase().includes(lowerQuery)),
  )
}

// Clear all data
export const clearAllData = (): void => {
  if (typeof window === "undefined") return

  // Clear standard storage keys
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })

  // Clear character-specific chats
  const keys = Object.keys(localStorage)
  keys.forEach((key) => {
    if (key.startsWith("character-chat-")) {
      localStorage.removeItem(key)
    }
  })
}

// Export all data
export const exportAllData = () => {
  if (typeof window === "undefined") return null

  const data = {
    userProfile: getUserProfile(),
    characters: getCharacters(),
    chatSessions: getChatSessions(),
    exportedAt: new Date().toISOString(),
  }

  return data
}

// Token management functions
export const getUserTokens = (): number => {
  const profile = getUserProfile()
  return profile?.tokens || 0
}

export const addTokens = (amount: number): void => {
  const profile = getUserProfile()
  if (profile) {
    profile.tokens = (profile.tokens || 0) + amount
    saveUserProfile(profile)
  }
}

export const deductTokens = (amount: number): boolean => {
  // Platinum members get free access to all models
  if (isPlatinumMember()) {
    return true
  }

  const profile = getUserProfile()
  if (profile && (profile.tokens || 0) >= amount) {
    profile.tokens = (profile.tokens || 0) - amount
    saveUserProfile(profile)
    return true
  }
  return false
}

export const getPreferredModel = (): "basic" | "advanced" | "premium" => {
  const profile = getUserProfile()
  return profile?.preferredModel || "basic"
}

export const setPreferredModel = (model: "basic" | "advanced" | "premium"): void => {
  const profile = getUserProfile()
  if (profile) {
    profile.preferredModel = model
    saveUserProfile(profile)
  }
}

export const awardChatTokens = (): void => {
  addTokens(10) // Award 10 tokens per chat
}
