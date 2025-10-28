import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CollectionCard } from "@/components/collection-card"
import { CollectionsClient } from "@/components/collections-client"
import { getCollections } from "@/lib/shopify-client"

export default async function CollectionsPage() {
  const collections = await getCollections()

  return (
    <CollectionsClient collections={collections}>
      <main className="min-h-screen bg-background">
        <Header />

        {/* Page Header */}
        <section className="bg-secondary py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-serif text-5xl md:text-6xl font-semibold text-foreground mb-4">
              Collections
            </h1>
            <p className="text-lg text-foreground/60 max-w-2xl">
              Explore our complete range of curated collections, each carefully designed to inspire
              your personal style.
            </p>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {collections.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-foreground/60 text-lg">No collections found.</p>
                <p className="text-foreground/60 text-sm mt-2">
                  Make sure your Shopify store has collections and your environment variables are set.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collections.map((collection, index) => (
                  <CollectionCard
                    key={collection.id}
                    id={collection.handle}
                    title={collection.title}
                    image={collection.image}
                    productCount={collection.productCount}
                    isAboveTheFold={index < 3}
                    gaIndex={index + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </CollectionsClient>
  )
}
