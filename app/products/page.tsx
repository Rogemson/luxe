"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { getProducts } from "@/lib/shopify-client"
import { useSearch } from '@/context/search'
import { useFilters } from '@/context/filters'
import type { ShopifyProduct } from "@/lib/shopify-types"
import { Loader2 } from "lucide-react"

// ✅ Pagination constants
const PRODUCTS_PER_PAGE = 20
const INITIAL_LOAD = 6 // Load first 6 immediately for fast FCP

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<ShopifyProduct[]>([])
  const [displayedCount, setDisplayedCount] = useState(INITIAL_LOAD)
  const { setProducts: setSearchProducts } = useSearch()
  const { filters, setFilters, applyFilters } = useFilters()
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // ✅ Fetch products once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Only fetch what you need (you said you have 3, but planning for growth)
        const data = await getProducts(50) // Reduced from 100
        console.log('Products fetched:', data.length)
        setAllProducts(data)
        setSearchProducts(data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [setSearchProducts])

  // ✅ Apply filters and sorting
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = applyFilters(allProducts)

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
  }, [allProducts, filters, applyFilters])

  // ✅ Products to display (with pagination)
  const displayedProducts = useMemo(() => {
    return filteredAndSortedProducts.slice(0, displayedCount)
  }, [filteredAndSortedProducts, displayedCount])

  const hasMore = displayedCount < filteredAndSortedProducts.length

  // ✅ Load more products
  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return
    
    setLoadingMore(true)
    // Simulate network delay for smooth UX
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + PRODUCTS_PER_PAGE, filteredAndSortedProducts.length))
      setLoadingMore(false)
    }, 300)
  }, [hasMore, loadingMore, filteredAndSortedProducts.length])

  // ✅ Intersection Observer for infinite scroll
  useEffect(() => {
    if (loading || !hasMore) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.5, rootMargin: '100px' }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loading, hasMore, loadMore])

  // ✅ Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(INITIAL_LOAD)
  }, [filters])

  // Get unique categories and max price for filter sidebar
  const categories = Array.from(new Set(allProducts.map((p) => p.category)))
  const maxPrice = Math.max(...allProducts.map((p) => p.price), 1000)

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
              Showing {displayedProducts.length} of {filteredAndSortedProducts.length}{" "}
              {filteredAndSortedProducts.length === 1 ? "product" : "products"}
            </p>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Sort Dropdown */}
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
                // ✅ Skeleton loading - only show 6 initially
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
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {displayedProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        id={product.handle}
                        title={product.title}
                        price={product.price}
                        compareAtPrice={product.compareAtPrice}
                        image={product.image}
                        category={product.collection}
                        index={index}
                        product={product}
                      />
                    ))}
                  </div>

                  {/* ✅ Infinite scroll trigger */}
                  {hasMore && (
                    <div 
                      ref={loadMoreRef}
                      className="flex justify-center items-center py-12"
                    >
                      {loadingMore && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Loading more products...</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}