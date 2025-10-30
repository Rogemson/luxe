"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Tag, Grid, TrendingUp } from "lucide-react"
import { getCollections } from "@/lib/shopify-client"

interface Collection {
  id: string
  title: string
  handle: string
  image?: string
  productsCount?: number
}

export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const data = await getCollections()
        setCollections(data.slice(0, 6)) // Show top 6 collections
        setLoading(false)
      } catch (error) {
        console.error("Failed to load collections:", error)
        setLoading(false)
      }
    }

    fetchCollections()
  }, [])

  // Categories (you can make this dynamic too)
  const categories = [
    { name: "New Arrivals", icon: TrendingUp, href: "/collections/new-arrivals" },
    { name: "Sale Items", icon: Tag, href: "/collections/sale" },
    { name: "All Products", icon: Grid, href: "/products" },
  ]

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger */}
      <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors py-2">
        Products
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50 w-screen max-w-7xl">
          <div className="bg-background border border-border rounded-lg shadow-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-0">
              {/* Left Section: Collections */}
              <div className="col-span-8 p-8 border-r border-border">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Shop by Collection
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Curated product collections
                  </p>
                </div>

                {loading ? (
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="aspect-square bg-secondary animate-pulse rounded-lg" />
                        <div className="h-4 bg-secondary animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {collections.map((collection) => (
                      <Link
                        key={collection.id}
                        href={`/collections/${collection.handle}`}
                        className="group"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="relative aspect-square bg-secondary rounded-lg overflow-hidden mb-2">
                          {collection.image ? (
                            <Image
                              src={collection.image}
                              alt={collection.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Grid className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-liner-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                          {collection.title}
                        </h4>
                        {collection.productsCount && (
                          <p className="text-xs text-muted-foreground">
                            {collection.productsCount} items
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <Link
                    href="/collections"
                    className="text-sm font-medium text-primary hover:underline"
                    onClick={() => setIsOpen(false)}
                  >
                    View all collections →
                  </Link>
                </div>
              </div>

              {/* Right Section: Categories & Quick Links */}
              <div className="col-span-4 p-8 bg-secondary/30">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Quick Links
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Popular categories
                  </p>
                </div>

                <div className="space-y-2">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors group"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <category.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {category.name}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Need Help?
                  </h4>
                  <div className="space-y-2">
                    <Link
                      href="/about"
                      className="block text-sm hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      About Us
                    </Link>
                    <Link
                      href="/contact"
                      className="block text-sm hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Contact
                    </Link>
                    <Link
                      href="/faq"
                      className="block text-sm hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      FAQ
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
