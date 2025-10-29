"use client"

import { isImageFile, isGifFile } from "@/lib/file-upload"
import { FileText, Download } from "lucide-react"

interface MessageAttachmentProps {
  fileType: string
  fileName: string
  displayUrl: string
}

export function MessageAttachment({ fileType, fileName, displayUrl }: MessageAttachmentProps) {
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = displayUrl
    link.download = fileName
    link.click()
  }

  if (isImageFile(fileType)) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden max-w-sm">
        <img src={displayUrl || "/placeholder.svg"} alt={fileName} className="w-full h-auto" />
        {isGifFile(fileType) && (
          <div className="bg-zinc-700 px-2 py-1 text-xs text-zinc-300 flex items-center justify-between">
            <span>GIF</span>
            <button onClick={handleDownload} className="hover:text-white">
              <Download className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-2 bg-zinc-700 rounded-lg p-3 flex items-center gap-3 max-w-sm">
      <FileText className="h-8 w-8 text-indigo-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{fileName}</p>
        <p className="text-xs text-zinc-400">Document</p>
      </div>
      <button onClick={handleDownload} className="text-zinc-400 hover:text-white flex-shrink-0">
        <Download className="h-5 w-5" />
      </button>
    </div>
  )
}
