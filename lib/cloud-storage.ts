import { neon } from "@neondatabase/serverless"

let sql: any = null

try {
  if (process.env.DATABASE_URL) {
    sql = neon(process.env.DATABASE_URL)
  }
} catch (error) {
  console.error("[v0] Failed to initialize Neon connection:", error)
}

export interface CloudUser {
  id: number
  username: string
  email: string
  profile_picture?: string
  bio?: string
}

export interface CloudChatSession {
  id: number
  user_id: number
  title: string
  created_at: string
  updated_at: string
  messages: CloudMessage[]
}

export interface CloudMessage {
  id: number
  chat_session_id: number
  role: "user" | "assistant" | "system"
  content: string
  created_at: string
}

export interface CloudCharacter {
  id: number
  user_id: number
  name: string
  avatar_url?: string
  prompt: string
  created_at: string
  updated_at: string
}

export async function createUser(userData: {
  username: string
  email: string
  profile_picture?: string
  bio?: string
}): Promise<CloudUser> {
  if (!sql) {
    throw new Error("Database connection not available")
  }

  const result = await sql`
    INSERT INTO users (username, email, profile_picture, bio)
    VALUES (${userData.username}, ${userData.email}, ${userData.profile_picture || null}, ${userData.bio || null})
    RETURNING *
  `
  return result[0] as CloudUser
}

export async function getUserByEmail(email: string): Promise<CloudUser | null> {
  if (!sql) {
    throw new Error("Database connection not available")
  }

  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `
  return (result[0] as CloudUser) || null
}

export async function updateUserProfile(
  userId: number,
  updates: {
    username?: string
    profile_picture?: string
    bio?: string
  },
): Promise<CloudUser> {
  if (!sql) {
    throw new Error("Database connection not available")
  }

  const result = await sql`
    UPDATE users 
    SET 
      username = COALESCE(${updates.username || null}, username),
      profile_picture = COALESCE(${updates.profile_picture || null}, profile_picture),
      bio = COALESCE(${updates.bio || null}, bio),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${userId}
    RETURNING *
  `
  return result[0] as CloudUser
}

export async function saveChatToCloud(
  userId: number,
  chatData: {
    title: string
    messages: Array<{ role: string; content: string }>
  },
): Promise<CloudChatSession> {
  if (!sql) {
    throw new Error("Database connection not available")
  }

  // Create chat session
  const sessionResult = await sql`
    INSERT INTO chat_sessions (user_id, title)
    VALUES (${userId}, ${chatData.title})
    RETURNING *
  `
  const session = sessionResult[0] as any

  // Save messages
  for (const message of chatData.messages) {
    await sql`
      INSERT INTO messages (chat_session_id, role, content)
      VALUES (${session.id}, ${message.role}, ${message.content})
    `
  }

  return await getChatSession(session.id)
}

export async function getChatSession(sessionId: number): Promise<CloudChatSession> {
  if (!sql) {
    throw new Error("Database connection not available")
  }

  const sessionResult = await sql`
    SELECT * FROM chat_sessions WHERE id = ${sessionId}
  `
  const session = sessionResult[0] as any

  const messagesResult = await sql`
    SELECT * FROM messages WHERE chat_session_id = ${sessionId} ORDER BY created_at ASC
  `

  return {
    ...session,
    messages: messagesResult as CloudMessage[],
  }
}

export async function getUserChats(userId: number): Promise<CloudChatSession[]> {
  if (!sql) {
    throw new Error("Database connection not available")
  }

  const sessionsResult = await sql`
    SELECT * FROM chat_sessions WHERE user_id = ${userId} ORDER BY updated_at DESC
  `

  const chats: CloudChatSession[] = []
  for (const session of sessionsResult as any[]) {
    const messagesResult = await sql`
      SELECT * FROM messages WHERE chat_session_id = ${session.id} ORDER BY created_at ASC
    `
    chats.push({
      ...session,
      messages: messagesResult as CloudMessage[],
    })
  }

  return chats
}

export async function saveCharacterToCloud(
  userId: number,
  characterData: {
    name: string
    avatar_url?: string
    prompt: string
  },
): Promise<CloudCharacter> {
  if (!sql) {
    throw new Error("Database connection not available")
  }

  const result = await sql`
    INSERT INTO characters (user_id, name, avatar_url, prompt)
    VALUES (${userId}, ${characterData.name}, ${characterData.avatar_url || null}, ${characterData.prompt})
    RETURNING *
  `
  return result[0] as CloudCharacter
}

export async function getUserCharacters(userId: number): Promise<CloudCharacter[]> {
  if (!sql) {
    throw new Error("Database connection not available")
  }

  const result = await sql`
    SELECT * FROM characters WHERE user_id = ${userId} ORDER BY created_at DESC
  `
  return result as CloudCharacter[]
}

export function isDatabaseAvailable(): boolean {
  return sql !== null
}
