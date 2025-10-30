import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Home } from "lucide-react"

// ✅ No async fetching - pure static component
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple header without data dependencies */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="font-serif text-xl font-bold">
            LUXE
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* 404 Message */}
          <div className="space-y-4">
            <h1 className="text-8xl font-bold text-muted-foreground">404</h1>
            <h2 className="text-3xl font-semibold">Page Not Found</h2>
            <p className="text-muted-foreground">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. It might
              have been moved or deleted.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="w-full sm:w-auto gap-2">
                <Home className="w-4 h-4" />
                Go to Homepage
              </Button>
            </Link>
            <Link href="/collections">
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                Browse Collections
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Helpful links */}
          <div className="pt-8 text-sm text-muted-foreground">
            <p className="mb-2">You might be looking for:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/shop" className="hover:text-foreground underline">
                Shop
              </Link>
              <span>•</span>
              <Link href="/account" className="hover:text-foreground underline">
                Account
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-foreground underline">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Simple footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} LUXE. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
