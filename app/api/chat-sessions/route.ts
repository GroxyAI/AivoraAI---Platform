import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await verifySession(sessionToken)

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const sessions = await sql`
      SELECT cs.id, cs.title, cs.created_at, cs.updated_at,
             json_agg(
               json_build_object(
                 'id', m.id,
                 'role', m.role,
                 'content', m.content,
                 'timestamp', EXTRACT(EPOCH FROM m.created_at) * 1000
               ) ORDER BY m.created_at
             ) FILTER (WHERE m.id IS NOT NULL) as messages
      FROM chat_sessions cs
      LEFT JOIN messages m ON cs.id = m.chat_session_id
      WHERE cs.user_id = ${user.id}
      GROUP BY cs.id
      ORDER BY cs.updated_at DESC
    `

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("[v0] Fetch chat sessions error:", error)
    return NextResponse.json({ error: "Failed to fetch chat sessions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await verifySession(sessionToken)

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { title, messages, characterId } = await request.json()

    // Create new chat session
    const result = await sql`
      INSERT INTO chat_sessions (user_id, title, created_at, updated_at)
      VALUES (${user.id}, ${title || "New Chat"}, NOW(), NOW())
      RETURNING id
    `

    const sessionId = result[0].id

    // Insert messages if provided
    if (messages && messages.length > 0) {
      for (const message of messages) {
        await sql`
          INSERT INTO messages (chat_session_id, role, content, created_at)
          VALUES (${sessionId}, ${message.role}, ${message.content}, NOW())
        `
      }
    }

    return NextResponse.json({ sessionId }, { status: 201 })
  } catch (error) {
    console.error("[v0] Create chat session error:", error)
    return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 })
  }
}
