'use client'

import { useState } from 'react'
import { Check, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button' // adjust if needed

export function NewsletterSignup({ className = '' }: { className?: string }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setEmail('')
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to subscribe')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to subscribe. Please try again.')
      console.error('Newsletter error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={`py-20 md:py-28 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6">
          Join Our Community
        </h2>
        <p className="text-lg text-foreground/60 mb-8 max-w-2xl mx-auto">
          Subscribe to our newsletter for exclusive offers, style tips, and early access to new collections.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="flex-1">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading || status === 'success'}
              required
              className="w-full px-4 py-3 bg-secondary border border-border rounded-md text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || status === 'success'}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> 
             : status === 'success' ? <Check className="h-5 w-5" /> 
             : 'Subscribe'}
          </Button>
        </form>
      </div>
    </section>
  )
}
