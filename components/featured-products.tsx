import { Button } from "@/components/ui/button"
import { Star, ShoppingBag } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: "$199.99",
    rating: 4.8,
    reviews: 324,
    image: "/wireless-headphones.jpg",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Luxury Watch Collection",
    price: "$349.99",
    rating: 4.9,
    reviews: 512,
    image: "/luxury-watch.jpg",
    badge: "New",
  },
  {
    id: 3,
    name: "Designer Sunglasses",
    price: "$149.99",
    rating: 4.7,
    reviews: 289,
    image: "/designer-sunglasses.jpg",
    badge: null,
  },
  {
    id: 4,
    name: "Premium Leather Bag",
    price: "$279.99",
    rating: 4.9,
    reviews: 456,
    image: "/leather-bag.jpg",
    badge: "Limited",
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">Featured Collections</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked items that showcase the best of our curated selection
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-card rounded-xl overflow-hidden border border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden bg-secondary h-64">
                {product.badge && (
                  <div className="absolute top-3 right-3 z-10 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    {product.badge}
                  </div>
                )}
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-lg font-bold text-foreground">{product.price}</span>
                  <button className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
}
