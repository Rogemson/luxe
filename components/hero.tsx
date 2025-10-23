import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Discover Premium Products
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Curated collections of high-quality items designed for modern living. Shop with confidence and style.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base">
                Shop Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="px-8 py-6 text-base border-border text-foreground hover:bg-secondary bg-transparent"
              >
                View Collections
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div>
                <p className="text-2xl font-bold text-foreground">50K+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">1000+</p>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">24/7</p>
                <p className="text-sm text-muted-foreground">Support</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-96 md:h-full min-h-96">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl"></div>
            <img
              src="/premium-products-showcase.jpg"
              alt="Premium products showcase"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
