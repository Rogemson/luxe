import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getCollections } from '@/lib/shopify-client'
import Link from 'next/link'
import Image from 'next/image'

// ✅ Enable ISR - revalidate every hour
export const revalidate = 3600

export default async function HomePage() {
  const collections = await getCollections()

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="py-20 text-center bg-secondary">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6">
              Elevate Your Style
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover our curated collection of premium clothing designed for the modern lifestyle. Quality, style, and sustainability in every piece.
            </p>
            <Link 
              href="/products"
              className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Shop Now
            </Link>
          </div>
        </section>

        {/* Featured Collections */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="font-serif text-3xl font-bold mb-4">Featured Collections</h2>
            <p className="text-muted-foreground mb-12">
              Discover our top collections, carefully curated to inspire and elevate your wardrobe.
            </p>

            {collections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.handle}`}
                    prefetch={false}
                    className="group"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
                      <Image
                        src={collection.image}
                        alt={collection.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-serif text-xl font-semibold group-hover:text-accent transition-colors">
                      {collection.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {collection.productCount} {collection.productCount === 1 ? 'product' : 'products'}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No collections found.</p>
                <p className="text-sm text-muted-foreground">
                  Make sure your Shopify store has collections and environment variables are configured.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-secondary">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="font-serif text-3xl font-bold text-center mb-12">Why Choose LUXE</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="font-serif text-xl font-semibold mb-3">Premium Quality</h3>
                <p className="text-muted-foreground">
                  Every piece is carefully selected for its quality, craftsmanship, and attention to detail.
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-serif text-xl font-semibold mb-3">Sustainable</h3>
                <p className="text-muted-foreground">
                  We&apos;re committed to ethical sourcing and sustainable practices in all our collections.
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-serif text-xl font-semibold mb-3">Expert Curation</h3>
                <p className="text-muted-foreground">
                  Our team of style experts handpicks every item to ensure it meets our high standards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16">
          <div className="max-w-xl mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter for exclusive offers, style tips, and early access to new collections.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-border rounded-md bg-background"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
