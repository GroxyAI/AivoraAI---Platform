import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid API key" }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)

    // Validate API key format
    if (!apiKey.startsWith("kd_dev_") && !apiKey.startsWith("kd_live_")) {
      return NextResponse.json({ error: "Invalid API key format" }, { status: 401 })
    }

    const { characterId, message, sessionId } = await request.json()

    if (!characterId || !message) {
      return NextResponse.json({ error: "Missing required fields: characterId, message" }, { status: 400 })
    }

    // In production, validate API key against database and rate limit
    // For now, return a mock response
    const response = {
      success: true,
      sessionId: sessionId || `session_${Date.now()}`,
      message: `Response from character ${characterId}: I received your message: "${message}"`,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Error in chat API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
