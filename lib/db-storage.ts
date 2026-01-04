import { sql } from "./db"
import type { Character, ChatSession, Message } from "./storage"

// Character Management
export async function getUserCharacters(userId: number): Promise<Character[]> {
  try {
    const result = await sql`
      SELECT id, name, prompt, avatar_url as avatar, creator_username, is_public, is_global
      FROM characters
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return result.map((row: any) => ({
      id: row.id.toString(),
      name: row.name,
      prompt: row.prompt,
      avatar: row.avatar_url,
      creator_username: row.creator_username,
    }))
  } catch (error) {
    console.error("[v0] Error fetching user characters:", error)
    return []
  }
}

export async function saveCharacter(userId: number, character: Omit<Character, "id">): Promise<Character | null> {
  try {
    const result = await sql`
      INSERT INTO characters (user_id, name, prompt, avatar_url, creator_username, is_public, created_at, updated_at)
      VALUES (${userId}, ${character.name}, ${character.prompt}, ${character.avatar}, ${character.creator_username || null}, false, NOW(), NOW())
      RETURNING id, name, prompt, avatar_url as avatar, creator_username
    `
    if (result.length === 0) return null

    const row = result[0]
    return {
      id: row.id.toString(),
      name: row.name,
      prompt: row.prompt,
      avatar: row.avatar,
      creator_username: row.creator_username,
    }
  } catch (error) {
    console.error("[v0] Error saving character:", error)
    return null
  }
}

export async function deleteCharacter(userId: number, characterId: string): Promise<boolean> {
  try {
    await sql`
      DELETE FROM characters
      WHERE id = ${Number.parseInt(characterId)} AND user_id = ${userId}
    `
    return true
  } catch (error) {
    console.error("[v0] Error deleting character:", error)
    return false
  }
}

// Chat Session Management
export async function getUserChatSessions(userId: number): Promise<ChatSession[]> {
  try {
    const result = await sql`
      SELECT cs.id, cs.title, cs.created_at, cs.updated_at
      FROM chat_sessions cs
      WHERE cs.user_id = ${userId}
      ORDER BY cs.updated_at DESC
    `

    const sessions: ChatSession[] = []
    for (const row of result) {
      const messages = await getChatMessages(row.id)
      sessions.push({
        id: row.id.toString(),
        title: row.title,
        messages,
        createdAt: new Date(row.created_at).getTime(),
        updatedAt: new Date(row.updated_at).getTime(),
      })
    }

    return sessions
  } catch (error) {
    console.error("[v0] Error fetching chat sessions:", error)
    return []
  }
}

export async function getChatMessages(sessionId: number): Promise<Message[]> {
  try {
    const result = await sql`
      SELECT id, role, content, created_at
      FROM messages
      WHERE chat_session_id = ${sessionId}
      ORDER BY created_at ASC
    `

    return result.map((row: any) => ({
      id: row.id.toString(),
      role: row.role,
      content: row.content,
      timestamp: new Date(row.created_at).getTime(),
    }))
  } catch (error) {
    console.error("[v0] Error fetching messages:", error)
    return []
  }
}

export async function saveChatSession(userId: number, session: ChatSession): Promise<boolean> {
  try {
    // Check if session exists
    const existing = await sql`
      SELECT id FROM chat_sessions WHERE id = ${Number.parseInt(session.id)} AND user_id = ${userId}
    `

    if (existing.length === 0) {
      // Create new session
      const newSession = await sql`
        INSERT INTO chat_sessions (user_id, title, created_at, updated_at)
        VALUES (${userId}, ${session.title}, NOW(), NOW())
        RETURNING id
      `

      if (newSession.length === 0) return false
      const sessionId = newSession[0].id

      // Save messages
      for (const message of session.messages) {
        await sql`
          INSERT INTO messages (chat_session_id, role, content, created_at)
          VALUES (${sessionId}, ${message.role}, ${message.content}, NOW())
        `
      }
    } else {
      // Update existing session
      await sql`
        UPDATE chat_sessions
        SET title = ${session.title}, updated_at = NOW()
        WHERE id = ${Number.parseInt(session.id)} AND user_id = ${userId}
      `

      // Delete old messages and insert new ones
      await sql`
        DELETE FROM messages WHERE chat_session_id = ${Number.parseInt(session.id)}
      `

      for (const message of session.messages) {
        await sql`
          INSERT INTO messages (chat_session_id, role, content, created_at)
          VALUES (${Number.parseInt(session.id)}, ${message.role}, ${message.content}, NOW())
        `
      }
    }

    return true
  } catch (error) {
    console.error("[v0] Error saving chat session:", error)
    return false
  }
}

export async function deleteChatSession(userId: number, sessionId: string): Promise<boolean> {
  try {
    await sql`
      DELETE FROM chat_sessions
      WHERE id = ${Number.parseInt(sessionId)} AND user_id = ${userId}
    `
    return true
  } catch (error) {
    console.error("[v0] Error deleting chat session:", error)
    return false
  }
}

export async function getRecentChatSessions(userId: number, limit = 10): Promise<ChatSession[]> {
  try {
    const sessions = await getUserChatSessions(userId)
    return sessions.slice(0, limit)
  } catch (error) {
    console.error("[v0] Error fetching recent chats:", error)
    return []
  }
}
