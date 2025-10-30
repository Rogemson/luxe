// components/offline-guard.tsx
'use client'

import { useEffect, useState } from 'react'
import { WifiOff, X } from 'lucide-react'

export function OfflineGuard() {
  const [isOnline, setIsOnline] = useState(true)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
        setIsOnline(true)
        setShowWarning(false)
    }

    const handleOffline = () => {
        setIsOnline(false)
        setShowWarning(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    queueMicrotask(() => {
        if (!navigator.onLine) {
        setIsOnline(false)
        setShowWarning(true)
        }
    })

    return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
    }
    }, [])

  // Block navigation when offline
  useEffect(() => {
    if (!isOnline) {
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        const link = target.closest('a')
        
        if (link?.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:') && !link.href.startsWith('#')) {
          const currentOrigin = window.location.origin
          const linkUrl = new URL(link.href, currentOrigin)
          
          // Only block navigation to other pages on the same domain
          if (linkUrl.origin === currentOrigin && linkUrl.pathname !== window.location.pathname) {
            e.preventDefault()
            e.stopPropagation()
            setShowWarning(true)
          }
        }
      }

      document.addEventListener('click', handleClick, true)
      return () => document.removeEventListener('click', handleClick, true)
    }
  }, [isOnline])

  if (!showWarning || isOnline) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center shrink-0">
            <WifiOff className="w-6 h-6 text-destructive" />
          </div>
          
          <div className="flex-1 space-y-2">
            <h2 className="text-lg font-semibold">No Internet Connection</h2>
            <p className="text-sm text-muted-foreground">
              You&apos;re currently offline. Please check your internet connection to continue browsing.
            </p>
          </div>

          <button
            onClick={() => setShowWarning(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}
