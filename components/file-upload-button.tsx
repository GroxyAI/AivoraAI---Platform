"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, X, ImageIcon, FileText } from "lucide-react"
import { convertFileToBase64, isImageFile, type FileUploadResult } from "@/lib/file-upload"

interface FileUploadButtonProps {
  onFileSelect: (file: FileUploadResult) => void
  onFileRemove: () => void
  selectedFile: FileUploadResult | null
  disabled?: boolean
}

export function FileUploadButton({ onFileSelect, onFileRemove, selectedFile, disabled }: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "text/plain"]
    if (!allowedTypes.includes(file.type)) {
      setError("File type not supported. Please use JPG, PNG, GIF, WebP, PDF, or TXT")
      return
    }

    setIsUploading(true)

    try {
      const result = await convertFileToBase64(file)
      onFileSelect(result)
      setError(null)
    } catch (error) {
      console.error("[v0] File upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload file"
      setError(errorMessage)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleButtonClick = () => {
    setError(null)
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    onFileRemove()
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.txt"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {!selectedFile ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleButtonClick}
          disabled={disabled || isUploading}
          className="text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full"
          title={error || "Attach file"}
        >
          {isUploading ? (
            <div className="h-5 w-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </Button>
      ) : (
        <div className="flex items-center gap-2 bg-zinc-700 rounded-full px-3 py-1.5">
          {isImageFile(selectedFile.fileType) ? (
            <ImageIcon className="h-4 w-4 text-indigo-400" />
          ) : (
            <FileText className="h-4 w-4 text-indigo-400" />
          )}
          <span className="text-sm text-white truncate max-w-[150px]">{selectedFile.fileName}</span>
          <button type="button" onClick={handleRemove} className="text-zinc-400 hover:text-white" disabled={disabled}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
