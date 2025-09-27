"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserProfile } from "@/lib/storage"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const userProfile = getUserProfile()

    // If user has set up their profile, go to home dashboard
    // Otherwise, show the landing page
    if (userProfile && (userProfile.username || userProfile.bio)) {
      router.replace("/home")
    } else {
      router.replace("/landing")
    }
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
