import { Truck, Shield, RotateCcw, Headphones } from "lucide-react"

const benefits = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $50. Fast and reliable delivery to your doorstep.",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "Your transactions are protected with industry-leading encryption.",
  },
  {
    icon: RotateCcw,
    title: "30-Day Returns",
    description: "Not satisfied? Return items within 30 days for a full refund.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our customer service team is always ready to help you.",
  },
]

export function Benefits() {
  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div key={index} className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg text-foreground">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
