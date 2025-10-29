import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifySession } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

// GET - Fetch all global characters
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value
    let currentUserId: number | null = null

    if (sessionToken) {
      const user = await verifySession(sessionToken)
      currentUserId = user?.id || null
    }

    const characters = await sql`
      SELECT 
        c.*,
        COALESCE(
          (SELECT COUNT(*) FROM character_likes WHERE character_id = c.id),
          0
        ) as likes_count,
        COALESCE(
          (SELECT COUNT(*) > 0 FROM character_likes WHERE character_id = c.id AND user_id = ${currentUserId}),
          false
        ) as is_liked,
        COALESCE(
          (SELECT COUNT(*) > 0 FROM character_favorites WHERE character_id = c.id AND user_id = ${currentUserId}),
          false
        ) as is_favorited
      FROM characters c
      WHERE c.is_global = true AND c.is_public = true
      ORDER BY c.likes_count DESC, c.created_at DESC
    `

    return NextResponse.json({ characters })
  } catch (error) {
    console.error("[v0] Fetch characters error:", error)
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 })
  }
}

// POST - Create a new character
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await verifySession(sessionToken)

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { name, prompt, avatar_url, is_global } = await request.json()

    if (!name || !prompt) {
      return NextResponse.json({ error: "Name and prompt are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO characters (
        user_id, name, prompt, avatar_url, is_global, is_public, 
        creator_username, likes_count, views_count, created_at, updated_at
      )
      VALUES (
        ${user.id}, ${name}, ${prompt}, ${avatar_url || null}, 
        ${is_global || false}, true, ${user.name}, 0, 0, NOW(), NOW()
      )
      RETURNING *
    `

    return NextResponse.json({ character: result[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create character error:", error)
    return NextResponse.json({ error: "Failed to create character" }, { status: 500 })
  }
}
