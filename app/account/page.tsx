// app/account/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth"
import { AccountSidebar } from "@/components/account-sidebar"
import { AccountProfile } from "@/components/account-profile"
import { AccountOrders } from "@/components/account-orders"
import { AccountWishlist } from "@/components/account-wishlist"
import { AccountSettings } from "@/components/account-settings"

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <AccountProfile />
      case "orders":
        return <AccountOrders />
      case "wishlist":
        return <AccountWishlist />
      case "settings":
        return <AccountSettings />
      default:
        return <AccountProfile />
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          <AccountSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="md:col-span-3">{renderContent()}</div>
        </div>
      </div>
    </main>
  )
}