import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CollectionDetailClient } from "@/components/collection-detail-client"
import { getCollectionByHandle, getCollectionProducts } from "@/lib/shopify-client"
import { notFound } from "next/navigation"
import { CollectionProductGrid } from "@/components/collection-product-grid"

interface CollectionDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { id } = await params

  if (!id) {
    notFound()
  }

  const [collection, products] = await Promise.all([
    getCollectionByHandle(id),
    getCollectionProducts(id),
  ])

  if (!collection) {
    notFound()
  }

  return (
    <CollectionDetailClient collection={collection} products={products}>
      <main className="min-h-screen bg-background">
        <Header />

        <section className="bg-secondary py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-serif text-5xl md:text-6xl font-semibold text-foreground mb-4">
              {collection.title}
            </h1>
            <p className="text-lg text-foreground/60 max-w-2xl">{collection.description}</p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CollectionProductGrid 
              products={products}
              collectionHandle={collection.handle}
              collectionTitle={collection.title}
            />
          </div>
        </section>

        <Footer />
      </main>
    </CollectionDetailClient>
  )
}
