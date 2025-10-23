import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { getCollectionByHandle, getCollectionProducts } from "@/lib/shopify-client"
import { notFound } from "next/navigation"

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
    <main className="min-h-screen bg-background">
      <Header />

      {/* Collection Header */}
      <section className="bg-secondary py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-foreground mb-4">
            {collection.title}
          </h1>
          <p className="text-lg text-foreground/60 max-w-2xl">{collection.description}</p>
        </div>
      </section>

      {/* Filters and Products */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 pb-6 border-b border-border">
            <p className="text-sm text-foreground/60">
              Showing {products.length} {products.length === 1 ? "product" : "products"}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent border-border text-foreground hover:bg-secondary"
              >
                Sort <ChevronDown className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent border-border text-foreground hover:bg-secondary"
              >
                Filter <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (    
            <div className="text-center py-12">
              <p className="text-foreground/60 text-lg">No products found in this collection.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.handle}
                  title={product.title}
                  price={product.price}
                  image={product.image}
                  category={product.category}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}