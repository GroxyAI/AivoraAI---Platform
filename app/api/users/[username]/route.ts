import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import type { RouteContext } from "next/dist/server/route-modules/app-route/module"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, context: RouteContext<"/api/users/[username]">) {
  try {
    const { username } = await context.params

    // Fetch user profile
    const userResult = await sql`
      SELECT 
        id, 
        username, 
        profile_picture, 
        bio,
        characters_created,
        total_chats,
        created_at as joined_date
      FROM users 
      WHERE username = ${username}
      LIMIT 1
    `

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult[0]

    // Fetch user's characters with stats
    const charactersResult = await sql`
      SELECT 
        c.id,
        c.name,
        c.avatar_url,
        COUNT(DISTINCT cl.user_id) as likes_count
      FROM characters c
      LEFT JOIN character_likes cl ON c.id = cl.character_id
      WHERE c.user_id = ${user.id} AND c.is_global = true
      GROUP BY c.id, c.name, c.avatar_url
      ORDER BY likes_count DESC
      LIMIT 10
    `

    const profile = {
      ...user,
      characters: charactersResult,
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("[v0] Failed to fetch user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}
