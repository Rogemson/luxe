// components/error-boundary.tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-muted border border-destructive/20 rounded-lg p-6 my-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">
                  Unable to load this section
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Please refresh the page or try again later.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => this.setState({ hasError: false })}
                >
                  Try again
                </Button>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
