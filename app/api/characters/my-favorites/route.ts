import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifySession } from "@/lib/auth"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await verifySession(sessionToken)

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const favorites = await sql`
      SELECT c.*, cf.created_at as favorited_at
      FROM characters c
      JOIN character_favorites cf ON c.id = cf.character_id
      WHERE cf.user_id = ${user.id}
      ORDER BY cf.created_at DESC
    `

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error("[v0] Fetch favorites error:", error)
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
  }
}
