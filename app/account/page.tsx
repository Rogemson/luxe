'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AccountSidebar } from '@/components/account-sidebar'
import { AccountProfile } from '@/components/account-profile'
import { AccountOrders } from '@/components/account-orders'
import { AccountWishlist } from '@/components/account-wishlist'
import { AccountSettings } from '@/components/account-settings'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function AccountPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedEmail = localStorage.getItem('customerEmail')
      const token = localStorage.getItem('customerAccessToken') || localStorage.getItem('shopifyCustomerToken')

      if (!storedEmail || !token) {
        console.log('❌ [ACCOUNT] Not authenticated, redirecting to login...')
        router.push('/login?redirect=/account')
        return
      }

      console.log('👤 [ACCOUNT] User authenticated:', storedEmail)
      setTimeout(() => {
        setEmail(storedEmail)
        setLoading(false)
      }, 0)
    }

    checkAuth()
  }, [router])


  const handleLogout = () => {
    localStorage.removeItem('shopifyCustomerToken')
    localStorage.removeItem('customerAccessToken')
    localStorage.removeItem('customerEmail')
    localStorage.removeItem('shopify_cart_id')
    
    window.dispatchEvent(new Event('auth-token-updated'))
    router.push('/login')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <AccountProfile email={email} />
      case 'orders':
        return <AccountOrders />
      case 'wishlist':
        return <AccountWishlist />
      case 'settings':
        return <AccountSettings email={email} onLogout={handleLogout} />
      default:
        return <AccountProfile email={email} />
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  if (!email) {
    return null
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
  <Header />

  <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    {/* Flex layout for sidebar + main content */}
    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
      
      {/* Sticky Sidebar */}
      <aside className="w-full md:w-64 shrink-0 md:sticky md:top-8 self-start">
        <AccountSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          email={email}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main content takes remaining space */}
      <section className="flex-1">
        {renderContent()}
      </section>

    </div>
  </div>

  <Footer />
</main>


  )
}