import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, use actual database
const apiKeys: Map<string, any> = new Map()

function generateApiKey(keyType: "kd_dev_" | "kd_live_"): string {
  const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  return `${keyType}${randomPart}`
}

export async function GET(request: NextRequest) {
  try {
    // In production, verify user authentication and fetch from database
    const keys = Array.from(apiKeys.values())
    return NextResponse.json({ keys })
  } catch (error) {
    console.error("[v0] Error fetching API keys:", error)
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { keyName, keyType } = await request.json()

    if (!keyName || !keyType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const keyValue = generateApiKey(keyType)
    const newKey = {
      id: Date.now().toString(),
      keyName,
      keyValue,
      keyType,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    }

    apiKeys.set(newKey.id, newKey)

    return NextResponse.json({ key: newKey })
  } catch (error) {
    console.error("[v0] Error creating API key:", error)
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 })
  }
}
