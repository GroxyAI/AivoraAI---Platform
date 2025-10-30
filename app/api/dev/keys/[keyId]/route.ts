import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use actual database
const apiKeys: Map<string, any> = new Map()

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ keyId: string }> }) {
  try {
    const { keyId } = await params

    if (!apiKeys.has(keyId)) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    apiKeys.delete(keyId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting API key:", error)
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 })
  }
}
