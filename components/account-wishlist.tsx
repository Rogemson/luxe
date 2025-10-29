"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/context/wishlist"

export function AccountWishlist() {
  const { wishlist, removeFromWishlist } = useWishlist()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-2">Wishlist</h2>
        <p className="text-muted-foreground">Your saved items for later</p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent hover:shadow-md transition-all duration-200"
            >
              <Link href={`/products/${item.handle}`} className="block">
                <div className="aspect-square bg-muted relative overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      removeFromWishlist(item.id)
                    }}
                    className="absolute top-4 right-4 p-2 bg-background rounded-full hover:bg-secondary transition-colors shadow-md z-10"
                  >
                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  </button>
                </div>
              </Link>
              <div className="p-4 sm:p-6">
                <Link href={`/products/${item.handle}`}>
                  <h3 className="font-serif font-semibold text-foreground mb-2 line-clamp-2 hover:text-accent transition-colors">
                    {item.title}
                  </h3>
                </Link>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-serif text-lg font-semibold text-foreground">${item.price.toFixed(2)}</p>
                  <Link href={`/products/${item.handle}`}>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      View Product
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-foreground font-semibold text-lg mb-2">Your wishlist is empty</p>
          <p className="text-muted-foreground mb-6">Add items to save them for later</p>
          <Link href="/products">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
