import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sessionToken = request.cookies.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await verifySession(sessionToken)

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { title, messages } = await request.json()

    // Update session
    await sql`
      UPDATE chat_sessions
      SET title = ${title}, updated_at = NOW()
      WHERE id = ${Number.parseInt(id)} AND user_id = ${user.id}
    `

    // Delete old messages and insert new ones
    await sql`
      DELETE FROM messages WHERE chat_session_id = ${Number.parseInt(id)}
    `

    if (messages && messages.length > 0) {
      for (const message of messages) {
        await sql`
          INSERT INTO messages (chat_session_id, role, content, created_at)
          VALUES (${Number.parseInt(id)}, ${message.role}, ${message.content}, NOW())
        `
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update chat session error:", error)
    return NextResponse.json({ error: "Failed to update chat session" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sessionToken = request.cookies.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await verifySession(sessionToken)

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    await sql`
      DELETE FROM chat_sessions
      WHERE id = ${Number.parseInt(id)} AND user_id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete chat session error:", error)
    return NextResponse.json({ error: "Failed to delete chat session" }, { status: 500 })
  }
}
