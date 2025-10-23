import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export function Newsletter() {
  return (
    <section className="py-20 md:py-32 bg-primary text-primary-foreground">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">Stay Updated with Exclusive Offers</h2>
          <p className="text-lg text-primary-foreground/80">
            Subscribe to our newsletter and get 10% off your first purchase
          </p>
        </div>

        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground/50" />
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 border border-primary-foreground/20 focus:outline-none focus:border-primary-foreground/50 transition-colors"
            />
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-6 py-3">Subscribe</Button>
        </form>

        <p className="text-sm text-primary-foreground/70">We respect your privacy. Unsubscribe at any time.</p>
      </div>
    </section>
  )
}
