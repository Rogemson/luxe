import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CollectionCard } from "@/components/collection-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getCollections } from "@/lib/shopify-client" // ✅ Fetch from Shopify

export default async function Home() {
  const collections = await getCollections()
  const featuredCollections = collections.slice(0, 3)

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-secondary py-24 md:py-32 lg:py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-6 text-balance">
              Elevate Your Style
            </h1>
            <p className="text-lg md:text-xl text-foreground/70 mb-8 leading-relaxed max-w-xl">
              Discover our curated collection of premium clothing designed for the modern lifestyle. 
              Quality, style, and sustainability in every piece.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/collections">
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
                  Explore Collections
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-foreground text-foreground hover:bg-foreground/5 font-medium bg-transparent"
                >
                  Shop All
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">Featured Collections</h2>
            <p className="text-lg text-foreground/60 max-w-2xl">
              Discover our top collections, carefully curated to inspire and elevate your wardrobe.
            </p>
          </div>

          {featuredCollections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/60 text-lg">No collections found.</p>
              <p className="text-sm text-foreground/60 mt-2">
                Make sure your Shopify store has collections and environment variables are configured.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {featuredCollections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  id={collection.handle}
                  title={collection.title}
                  image={collection.image}
                  productCount={collection.productCount}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-foreground text-background py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-background mb-12 text-center">
            Why Choose LUXE
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-semibold text-background">Premium Quality</h3>
              <p className="text-background/70 leading-relaxed">
                Every piece is carefully selected for its quality, craftsmanship, and attention to detail.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-semibold text-background">Sustainable</h3>
              <p className="text-background/70 leading-relaxed">
                We&apos;re committed to ethical sourcing and sustainable practices in all our collections.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-semibold text-background">Expert Curation</h3>
              <p className="text-background/70 leading-relaxed">
                Our team of style experts handpicks every item to ensure it meets our high standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6">
            Join Our Community
          </h2>
          <p className="text-lg text-foreground/60 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive offers, style tips, and early access to new collections.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-secondary border border-border rounded-md text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
