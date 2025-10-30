'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Layout error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-lg w-full">
        <div className="bg-card border rounded-lg p-8 space-y-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-1" />
            <div className="space-y-2 flex-1">
              <h2 className="text-2xl font-semibold">Something went wrong</h2>
              <p className="text-muted-foreground">
                We encountered an unexpected error. This has been logged and we&apos;ll
                look into it.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => reset()} className="flex-1 gap-2">
              <RefreshCw className="w-4 h-4" />
              Try again
            </Button>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <Home className="w-4 h-4" />
                Go home
              </Button>
            </Link>
          </div>

          
        </div>
      </div>
    </div>
  )
}
