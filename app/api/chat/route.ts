export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json()

    console.log("[v0] Chat API called with messages:", messages.length)

    // Validate messages format
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("Invalid messages format")
    }

    // Ensure all messages have required role and content fields
    const validatedMessages = messages.map((msg) => ({
      role: msg.role || "user",
      content: msg.content || "",
    }))

    const apiKey = process.env.GROQ_API_KEY

    console.log("[v0] Environment check - GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY)
    console.log("[v0] Environment check - API key length:", apiKey?.length || 0)

    if (!apiKey) {
      console.error("[v0] No API key found in environment variables")
      throw new Error("GROQ_API_KEY environment variable is not set")
    }

    if (!apiKey.startsWith("gsk_")) {
      console.error("[v0] Invalid API key format")
      throw new Error("Invalid GROQ_API_KEY format")
    }

    const modelHierarchy = {
      premium: "llama-3.3-70b-versatile",
      advanced: "llama-3.1-70b-versatile",
      basic: "llama-3.1-8b-instant",
    }

    const fallbackOrder = ["premium", "advanced", "basic"]
    const requestedModel = model || "basic"

    // Start from requested model and fallback if needed
    let startIndex = fallbackOrder.indexOf(requestedModel)
    if (startIndex === -1) startIndex = 0

    let lastError = null
    let usedModel = requestedModel

    for (let i = startIndex; i < fallbackOrder.length; i++) {
      const currentModelKey = fallbackOrder[i] as keyof typeof modelHierarchy
      const currentModel = modelHierarchy[currentModelKey]

      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: currentModel,
            messages: validatedMessages,
            stream: true,
            max_tokens: 1000,
            temperature: 0.7,
          }),
        })

        if (response.status === 429) {
          console.log(`[v0] Rate limited on ${currentModelKey} model, trying fallback...`)
          lastError = new Error(`Rate limited on ${currentModelKey} model`)
          usedModel = currentModelKey
          continue
        }

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] Groq API error response:", errorText)
          throw new Error(`Groq API error: ${response.status} - ${errorText}`)
        }

        // Success! Set the model that worked
        usedModel = currentModelKey

        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          async start(controller) {
            try {
              if (usedModel !== requestedModel) {
                const fallbackNotification = JSON.stringify({
                  type: "model-fallback",
                  originalModel: requestedModel,
                  usedModel: usedModel,
                  reason: "rate_limit",
                })
                controller.enqueue(encoder.encode(`0:${fallbackNotification}\n`))
              }

              const reader = response.body?.getReader()
              if (!reader) throw new Error("No response body")

              while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = new TextDecoder().decode(value)
                const lines = chunk.split("\n")

                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const data = line.slice(6)
                    if (data === "[DONE]") continue

                    try {
                      const parsed = JSON.parse(data)
                      const content = parsed.choices?.[0]?.delta?.content
                      if (content) {
                        const responseData = JSON.stringify({
                          type: "text-delta",
                          textDelta: content,
                        })
                        controller.enqueue(encoder.encode(`0:${responseData}\n`))
                      }
                    } catch (e) {
                      // Skip invalid JSON lines
                    }
                  }
                }
              }
              controller.close()
            } catch (error) {
              console.error("[v0] Stream error:", error)
              controller.error(error)
            }
          },
        })

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        })
      } catch (error) {
        lastError = error
        console.log(`[v0] Error with ${currentModelKey} model:`, error)

        // If this is the last model in fallback chain, throw the error
        if (i === fallbackOrder.length - 1) {
          throw error
        }
      }
    }

    // If we get here, all models failed
    throw lastError || new Error("All models failed")
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
