import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifySession } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await verifySession(sessionToken)

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { id } = await params
    const characterId = Number.parseInt(id)

    // Check if already liked
    const existing = await sql`
      SELECT id FROM character_likes
      WHERE character_id = ${characterId} AND user_id = ${user.id}
    `

    if (existing.length > 0) {
      // Unlike
      await sql`
        DELETE FROM character_likes
        WHERE character_id = ${characterId} AND user_id = ${user.id}
      `

      await sql`
        UPDATE characters
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = ${characterId}
      `

      return NextResponse.json({ liked: false })
    } else {
      // Like
      await sql`
        INSERT INTO character_likes (character_id, user_id, created_at)
        VALUES (${characterId}, ${user.id}, NOW())
      `

      await sql`
        UPDATE characters
        SET likes_count = likes_count + 1
        WHERE id = ${characterId}
      `

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("[v0] Like character error:", error)
    return NextResponse.json({ error: "Failed to like character" }, { status: 500 })
  }
}
