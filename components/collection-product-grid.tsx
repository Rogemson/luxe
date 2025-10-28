"use client"

import { useMemo } from "react"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFilters } from '@/context/filters'
import { ShopifyProduct } from "@/lib/shopify-types"

interface CollectionProductGridProps {
  products: ShopifyProduct[]
  collectionHandle: string
  collectionTitle: string
}

export function CollectionProductGrid({ 
  products, 
  collectionHandle,
  collectionTitle 
}: CollectionProductGridProps) {
  const { filters, setFilters, applyFilters } = useFilters()

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
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)))
  }, [products])

  const maxPrice = useMemo(() => {
    return Math.max(...products.map((p) => p.price), 1000)
  }, [products])

  return (
    <div>
      {/* Filter Bar - Mobile Only */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 pb-6 border-b border-border">
        <p className="text-sm text-foreground/60">
          Showing {filteredAndSortedProducts.length} of {products.length}{" "}
          {filteredAndSortedProducts.length === 1 ? "product" : "products"}
        </p>

        {/* Sort Dropdown - Mobile Only */}
        <div className="flex gap-3 items-center lg:hidden">
          <Select 
            value={filters.sortBy} 
            onValueChange={(value) => 
              setFilters({ ...filters, sortBy: value as typeof filters.sortBy })
            }
          >
            <SelectTrigger className="w-[180px] bg-transparent border-border text-foreground">
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
        {/* Filter Sidebar - Desktop */}
        <ProductFilters categories={categories} maxPrice={maxPrice} />

        {/* Products Grid */}
        <div className="flex-1">
          {filteredAndSortedProducts.length === 0 ? (
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
                  category={product.category}
                  index={index}
                  collectionHandle={collectionHandle}
                  collectionTitle={collectionTitle}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
