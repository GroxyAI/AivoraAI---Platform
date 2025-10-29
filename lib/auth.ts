import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: number
  email: string
  name: string
  created_at: Date
  is_verified: boolean
}

export interface AuthSession {
  userId: number
  email: string
  name: string
  sessionToken: string
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

function generateSessionToken(): string {
  return crypto.randomUUID()
}

export async function registerUser(email: string, password: string, name: string): Promise<User | null> {
  try {
    const passwordHash = await hashPassword(password)

    const result = await sql`
      INSERT INTO users (email, password_hash, name, is_verified, created_at, updated_at)
      VALUES (${email}, ${passwordHash}, ${name}, true, NOW(), NOW())
      RETURNING id, email, name, created_at, is_verified
    `

    return result[0] as User
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return null
  }
}

export async function loginUser(email: string, password: string): Promise<AuthSession | null> {
  try {
    const passwordHash = await hashPassword(password)

    const result = await sql`
      SELECT id, email, name, password_hash
      FROM users
      WHERE email = ${email} AND password_hash = ${passwordHash}
    `

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    const sessionToken = generateSessionToken()

    await sql`
      INSERT INTO user_sessions (user_id, session_token, created_at, expires_at)
      VALUES (${user.id}, ${sessionToken}, NOW(), NOW() + INTERVAL '30 days')
    `

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      sessionToken,
    }
  } catch (error) {
    console.error("[v0] Login error:", error)
    return null
  }
}

export async function verifySession(sessionToken: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT u.id, u.email, u.name, u.created_at, u.is_verified
      FROM users u
      JOIN user_sessions s ON u.id = s.user_id
      WHERE s.session_token = ${sessionToken}
        AND s.expires_at > NOW()
    `

    if (result.length === 0) {
      return null
    }

    return result[0] as User
  } catch (error) {
    console.error("[v0] Session verification error:", error)
    return null
  }
}

export async function logoutUser(sessionToken: string): Promise<boolean> {
  try {
    await sql`
      DELETE FROM user_sessions
      WHERE session_token = ${sessionToken}
    `
    return true
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return false
  }
}

export async function getUserById(userId: number): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, name, created_at, is_verified
      FROM users
      WHERE id = ${userId}
    `

    if (result.length === 0) {
      return null
    }

    return result[0] as User
  } catch (error) {
    console.error("[v0] Get user error:", error)
    return null
  }
}
