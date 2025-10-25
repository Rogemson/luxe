"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { getProducts } from "@/lib/shopify-client"
import { useSearch } from '@/context/search'
import { useFilters } from '@/context/filters'
import type { ShopifyProduct } from "@/lib/shopify-types"

export default function ProductsPage() {
  const [products, setProducts] = useState<ShopifyProduct[]>([])
  const { setProducts: setSearchProducts } = useSearch()
  const { filters, setFilters, applyFilters } = useFilters()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getProducts(100)
      console.log('Products fetched:', data.length)
      setProducts(data)
      setSearchProducts(data)
      setLoading(false)
    }
    fetchData()
  }, [setSearchProducts])

  // Apply filters and sorting
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = applyFilters(products)

    switch (filters.sortBy) {
      case 'price-asc':
        return [...filtered].sort((a, b) => a.price - b.price)
      case 'price-desc':
        return [...filtered].sort((a, b) => b.price - a.price)
      case 'newest':
        return filtered
      case 'popular':
        return filtered
      default:
        return filtered
    }
  }, [products, filters, applyFilters])

  // Get unique categories and max price for filter sidebar
  const categories = Array.from(new Set(products.map((p) => p.category)))
  const maxPrice = Math.max(...products.map((p) => p.price), 1000)

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Page Header */}
      <section className="bg-secondary py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-foreground mb-4">
            All Products
          </h1>
          <p className="text-lg text-foreground/60 max-w-2xl">
            Browse our complete collection of premium clothing and accessories.
          </p>
        </div>
      </section>

      {/* Filters and Products */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 pb-6 border-b border-border">
            <p className="text-sm text-foreground/60">
              Showing {filteredAndSortedProducts.length} of {products.length}{" "}
              {filteredAndSortedProducts.length === 1 ? "product" : "products"}
            </p>

            <div className="flex flex-wrap gap-3 items-center lg:hidden">
              <Select 
                value={filters.sortBy} 
                onValueChange={(value) => 
                  setFilters({ ...filters, sortBy: value as typeof filters.sortBy })
                }
              >
                <SelectTrigger className="w-[180px] border-border bg-transparent text-foreground">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="price-asc">Price: Low → High</SelectItem>
                  <SelectItem value="price-desc">Price: High → Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Content with Sidebar */}
          <div className="flex gap-8">
            {/* Filter Sidebar */}
            <ProductFilters categories={categories} maxPrice={maxPrice} />

            {/* Products Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-muted rounded-lg mb-4" />
                      <div className="h-4 bg-muted rounded mb-2" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : filteredAndSortedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-foreground/60 text-lg">No products match your filters.</p>
                  <p className="text-foreground/60 text-sm mt-2">
                    Try adjusting your filters to see more results.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  {filteredAndSortedProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      id={product.handle}
                      title={product.title}
                      price={product.price}
                      compareAtPrice={product.compareAtPrice}
                      image={product.image}
                      category={product.collection}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
