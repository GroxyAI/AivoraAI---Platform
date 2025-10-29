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

    // Check if already favorited
    const existing = await sql`
      SELECT id FROM character_favorites
      WHERE character_id = ${characterId} AND user_id = ${user.id}
    `

    if (existing.length > 0) {
      // Unfavorite
      await sql`
        DELETE FROM character_favorites
        WHERE character_id = ${characterId} AND user_id = ${user.id}
      `

      return NextResponse.json({ favorited: false })
    } else {
      // Favorite
      await sql`
        INSERT INTO character_favorites (character_id, user_id, created_at)
        VALUES (${characterId}, ${user.id}, NOW())
      `

      return NextResponse.json({ favorited: true })
    }
  } catch (error) {
    console.error("[v0] Favorite character error:", error)
    return NextResponse.json({ error: "Failed to favorite character" }, { status: 500 })
  }
}
