import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getCollections } from "@/lib/shopify-client"
import { CollectionCard } from "@/components/collection-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

// This page automatically becomes a Server Component,
// so we can fetch data directly.
export default async function NotFoundPage() {
  // Fetch collections and take the first 3
  const allCollections = await getCollections()
  const topCollections = allCollections.slice(0, 3)

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* 404 Message Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <span className="text-6xl md:text-8xl font-bold text-accent">
            404
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mt-4 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-foreground/60 max-w-lg mb-8">
            Sorry, we couldn’t find the page you’re looking for. It might have
            been moved or deleted.
          </p>
          <Button asChild size="lg">
            <Link href="/">
              Go to Homepage
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Top Collections Section */}
      {topCollections.length > 0 && (
        <section className="py-16 md:py-20 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-12 text-center">
              Or check out our top collections
            </h2>
            {/* Responsive grid for collections */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topCollections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  id={collection.handle}
                  title={collection.title}
                  image={collection.image}
                  productCount={collection.productCount}
                  // We can prioritize these images as they are key content
                  isAboveTheFold={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}