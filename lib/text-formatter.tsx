import type React from "react"

export function formatText(text: string): React.ReactNode {
  // Split text by markdown patterns while preserving the delimiters
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)

  return parts.map((part, index) => {
    // Bold text: **text**
    if (part.startsWith("**") && part.endsWith("**")) {
      const content = part.slice(2, -2)
      return (
        <strong key={index} className="font-bold">
          {content}
        </strong>
      )
    }

    // Italic text: *text*
    if (part.startsWith("*") && part.endsWith("*")) {
      const content = part.slice(1, -1)
      return (
        <em key={index} className="italic">
          {content}
        </em>
      )
    }

    // Regular text
    return part
  })
}
