"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          router.replace("/home")
        } else {
          router.replace("/login")
        }
      } catch (error) {
        router.replace("/login")
      }
    }

    checkAuth()
  }, [router])

  // Loading state while redirecting
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>
  )
}
