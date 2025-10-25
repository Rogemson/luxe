'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Package, Calendar, DollarSign, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OrderItem {
  id: string
  title: string
  quantity: number
  variantTitle: string
  image?: string
}

interface Order {
  id: string
  number: number
  date: string
  total: string
  currency: string
  status: string
  items: OrderItem[]
}

interface OrdersApiResponse {
  orders?: Order[]
  error?: string
}

export function AccountOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('shopifyCustomerToken')
        
        if (!token) {
          setOrders([])
          setLoading(false)
          return
        }

        console.log('📦 [ORDERS] Fetching orders...')

        const response = await fetch('/api/auth/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        const data: OrdersApiResponse = await response.json()

        if (response.ok && data.orders) {
          setOrders(data.orders)
          console.log('✅ [ORDERS] Loaded:', data.orders.length, 'orders')
        } else {
          console.error('❌ [ORDERS] Error:', data.error)
          setOrders([])
        }
      } catch (error) {
        console.error('❌ [ORDERS] Exception:', error)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  if (loading) {
    return <div className="p-6">Loading orders...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Your Orders</h2>
        <p className="text-muted-foreground">View and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-card rounded-lg border p-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No orders yet</p>
          <p className="text-sm text-muted-foreground">Start shopping to see your orders here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <div key={order.id} className="bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
              <button
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="text-left flex-1">
                  <p className="font-medium">Order #{order.number}</p>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {order.total} {order.currency}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'FULFILLED' 
                      ? 'bg-green-100 text-green-800' 
                      : order.status === 'PARTIALLY_FULFILLED'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {expandedOrder === order.id && (
                <div className="border-t px-6 py-4 bg-muted/30 space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-3">Items</p>
                    <div className="space-y-2">
                      {order.items.map((item: OrderItem) => (
                        <div key={item.id} className="flex items-start gap-4">
                          {item.image && (
                            <div className="relative w-12 h-12 rounded overflow-hidden">
                              <Image 
                                src={item.image} 
                                alt={item.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Order Details
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}