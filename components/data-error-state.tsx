// components/data-error-state.tsx
'use client'

import { WifiOff, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface DataErrorStateProps {
  title?: string
  message?: string
}

export function DataErrorState({ 
  title = "Unable to Load Data",
  message = "We're having trouble connecting right now. Please check your internet connection and try again."
}: DataErrorStateProps) {
  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-card border rounded-lg p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
          <WifiOff className="w-8 h-8 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-muted-foreground text-sm">
            {message}
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Page
        </button>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-3">
            You can also:
          </p>
          <div className="flex flex-col gap-2">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center gap-2 text-sm text-primary hover:underline"
            >
              <Home className="w-4 h-4" />
              Go to Homepage
            </Link>
            <Link 
              href="/contact" 
              className="text-sm text-primary hover:underline"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
