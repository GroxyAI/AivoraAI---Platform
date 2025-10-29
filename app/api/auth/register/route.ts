import { type NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const user = await registerUser(email, password, name)

    if (!user) {
      return NextResponse.json({ error: "Email already exists or registration failed" }, { status: 400 })
    }

    return NextResponse.json({ success: true, user }, { status: 201 })
  } catch (error) {
    console.error("[v0] Registration API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
