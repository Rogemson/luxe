"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { getProducts } from "@/lib/shopify-client"
import { useSearch } from '@/context/search'
import type { ShopifyProduct } from "@/lib/shopify-types"

export default function ProductsPage() {
  const [products, setProducts] = useState<ShopifyProduct[]>([])
  const { setProducts: setSearchProducts } = useSearch()
  const [sortBy, setSortBy] = useState<string>("")
  const [filter] = useState<string>("all")

  useEffect(() => {
    const fetchData = async () => {
      const data = await getProducts(30)
      console.log('Products fetched:', data.length)  // Add this
      setProducts(data)
      setSearchProducts(data)  // This populates search context
    }
    fetchData()
  }, [setSearchProducts])

  // Apply sorting and filtering dynamically
  const filteredAndSortedProducts = useMemo(() => {
    let updatedProducts = [...products]

    // ✅ Filter
    if (filter !== "all") {
      updatedProducts = updatedProducts.filter(
        (p) => p.category?.toLowerCase() === filter.toLowerCase()
      )
    }

    // ✅ Sort
    switch (sortBy) {
      case "price-low-high":
        updatedProducts.sort((a, b) => a.price - b.price)
        break
      case "price-high-low":
        updatedProducts.sort((a, b) => b.price - a.price)
        break
      case "alphabetical":
        updatedProducts.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "alphabetical-desc":
        updatedProducts.sort((a, b) => b.title.localeCompare(a.title))
        break
      default:
        break
    }

    return updatedProducts
  }, [products, sortBy, filter])

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
              Showing {filteredAndSortedProducts.length}{" "}
              {filteredAndSortedProducts.length === 1 ? "product" : "products"}
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Sort Dropdown */}
              <Select onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] border-border bg-transparent text-foreground">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low-high">Price: Low → High</SelectItem>
                  <SelectItem value="price-high-low">Price: High → Low</SelectItem>
                  <SelectItem value="alphabetical">A → Z</SelectItem>
                  <SelectItem value="alphabetical-desc">Z → A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/60 text-lg">No products found.</p>
              <p className="text-foreground/60 text-sm mt-2">
                Try adjusting your filters or sorting options.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      </section>

      <Footer />
    </main>
  )
}
