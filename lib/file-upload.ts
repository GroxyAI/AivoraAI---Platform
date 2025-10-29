export interface FileUploadResult {
  base64Data: string
  fileType: string
  fileName: string
  displayUrl: string
}

export async function convertFileToBase64(file: File): Promise<FileUploadResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const base64String = reader.result as string
      const base64Data = base64String.split(",")[1] // Remove data:image/png;base64, prefix

      resolve({
        base64Data,
        fileType: file.type,
        fileName: file.name,
        displayUrl: base64String, // Full data URL for display
      })
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsDataURL(file)
  })
}

export function isImageFile(fileType: string): boolean {
  return fileType.startsWith("image/")
}

export function isGifFile(fileType: string): boolean {
  return fileType === "image/gif"
}

export function isDocumentFile(fileType: string): boolean {
  const documentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ]
  return documentTypes.includes(fileType)
}

export function getFileIcon(fileType: string): string {
  if (isImageFile(fileType)) return "🖼️"
  if (isDocumentFile(fileType)) return "📄"
  return "📎"
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}
