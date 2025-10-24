"use client"

import { Package, CheckCircle, Truck, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Order {
  id: string
  number: string
  date: string
  total: number
  status: "delivered" | "processing" | "shipped"
  items: number
}

const orders: Order[] = [
  {
    id: "1",
    number: "#ORD-001",
    date: "Oct 15, 2024",
    total: 249.99,
    status: "delivered",
    items: 3,
  },
  {
    id: "2",
    number: "#ORD-002",
    date: "Oct 8, 2024",
    total: 189.5,
    status: "delivered",
    items: 2,
  },
  {
    id: "3",
    number: "#ORD-003",
    date: "Sep 28, 2024",
    total: 329.0,
    status: "shipped",
    items: 4,
  },
]

const statusConfig = {
  delivered: {
    icon: CheckCircle,
    color: "bg-green-50 text-green-700 border-green-200",
    label: "Delivered",
  },
  processing: {
    icon: Clock,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    label: "Processing",
  },
  shipped: { icon: Truck, color: "bg-amber-50 text-amber-700 border-amber-200", label: "Shipped" },
}

export function AccountOrders() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-2">Order History</h2>
        <p className="text-muted-foreground">View and manage your past orders</p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon
            return (
              <div
                key={order.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-accent hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 pb-4 border-b border-border">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">{order.number}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{order.date}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize whitespace-nowrap flex items-center gap-2 w-fit ${
                      statusConfig[order.status].color
                    }`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {statusConfig[order.status].label}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="w-5 h-5" />
                    <span className="text-sm">{order.items} items</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="sm:text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Total</p>
                      <p className="font-serif text-xl font-semibold text-foreground">${order.total.toFixed(2)}</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      View Details →
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-foreground font-semibold text-lg mb-2">No orders yet</p>
          <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
          <Button>Continue Shopping</Button>
        </div>
      )}
    </div>
  )
}
