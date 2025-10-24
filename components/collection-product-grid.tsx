"use client"

import { useState, useMemo } from "react"
import { ProductCard } from "@/components/product-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShopifyProduct } from "@/lib/shopify-types"

interface CollectionProductGridProps {
  products: ShopifyProduct[]
}

export function CollectionProductGrid({ products }: CollectionProductGridProps) {
  const [sortOption, setSortOption] = useState<string>("default")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category)))
    return ["all", ...unique]
  }, [products])

  const filteredAndSortedProducts = useMemo(() => {
    let visible = [...products]

    if (filterCategory !== "all") {
      visible = visible.filter((p) => p.category === filterCategory)
    }

    switch (sortOption) {
      case "price-asc":
        visible.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        visible.sort((a, b) => b.price - a.price)
        break
      case "alpha-asc":
        visible.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "alpha-desc":
        visible.sort((a, b) => b.title.localeCompare(a.title))
        break
      default:
        break
    }

    return visible
  }, [products, sortOption, filterCategory])

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 pb-6 border-b border-border">
        <p className="text-sm text-foreground/60">
          Showing {filteredAndSortedProducts.length}{" "}
          {filteredAndSortedProducts.length === 1 ? "product" : "products"}
        </p>

        <div className="flex gap-3 items-center">
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px] bg-transparent border-border text-foreground">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price-asc">Price: Low → High</SelectItem>
              <SelectItem value="price-desc">Price: High → Low</SelectItem>
              <SelectItem value="alpha-asc">Alphabetical: A → Z</SelectItem>
              <SelectItem value="alpha-desc">Alphabetical: Z → A</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px] bg-transparent border-border text-foreground">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-foreground/60 text-lg">No products found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedProducts.map((product) => (
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
  )
}
