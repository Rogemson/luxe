"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from "react"
import { CartItem, CartContextType } from "@/lib/shopify-types"
import {
  createCart,
  fetchCart,
  addCartLines,
  updateCartLines,
  removeCartLines,
  updateBuyerIdentity,
} from "@/lib/shopify-client"

const CartContext = createContext<CartContextType | undefined>(undefined)
const CART_STORAGE_KEY = "shopify_cart_id"
const TOKEN_STORAGE_KEY = "customerAccessToken"

interface ShopifyCartResponse {
  data?: {
    cart?: {
      id: string
      lines: {
        edges: Array<{
          node: {
            id: string
            quantity: number
            merchandise: {
              id: string
              title: string
              priceV2: {
                amount: string
                currencyCode: string
              }
              product: {
                title: string
                handle: string
                featuredImage: {
                  url: string
                }
              }
            }
          }
        }>
      }
      cost: {
        totalAmount: {
          amount: string
          currencyCode: string
        }
      }
      checkoutUrl?: string
    }
    cartCreate?: {
      cart?: {
        id: string
      }
    }
    cartLinesAdd?: {
      cart?: {
        id: string
        lines: {
          edges: Array<{
            node: {
              id: string
              quantity: number
              merchandise: {
                id: string
                title: string
                priceV2: {
                  amount: string
                  currencyCode: string
                }
                product: {
                  title: string
                  handle: string
                  featuredImage: {
                    url: string
                  }
                }
              }
            }
          }>
        }
      }
    }
  }
}

interface CartData {
  id: string
  lines: {
    edges: Array<{
      node: {
        id: string
        quantity: number
        merchandise: {
          id: string
          title: string
          priceV2: {
            amount: string
            currencyCode: string
          }
          product: {
            title: string
            handle: string
            featuredImage: {
              url: string
            }
          }
        }
      }
    }>
  }
  cost?: {
    totalAmount: {
      amount: string
      currencyCode: string
    }
  }
  checkoutUrl?: string
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [cartId, setCartId] = useState<string | null>(null)
  const [isCartSynced, setIsCartSynced] = useState(false)

  // ✅ Refs with proper types
  const quantityChangeRef = useRef<Map<string, number>>(new Map())
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const removeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isDebounceActiveRef = useRef<boolean>(false)

  // Parse cart data from Shopify
  const parseCartData = (cartData: CartData | undefined): CartItem[] => {
    if (!cartData?.lines?.edges) return []

    return cartData.lines.edges.map((edge) => ({
      variantId: edge.node.merchandise.id,
      merchandiseId: edge.node.merchandise.id,
      lineId: edge.node.id,
      quantity: edge.node.quantity,
      title: edge.node.merchandise.product.title,
      handle: edge.node.merchandise.product.handle,
      image: edge.node.merchandise.product.featuredImage?.url || "",
      price: parseFloat(edge.node.merchandise.priceV2.amount),
      variantTitle: edge.node.merchandise.title,
    }))
  }

  const getCustomerToken = (): string | null => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  }

  // ✅ useCallback to prevent dependency issues
  const syncCartWithCustomer = useCallback(
    async (customerAccessToken: string) => {
      if (isCartSynced) return

      try {
        const customerRes = await fetch("/api/customer/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: customerAccessToken }),
        })
        const { customer } = await customerRes.json()

        if (!customer) {
          console.error("❌ [SYNC] Customer not found")
          window.dispatchEvent(new Event("cart-sync-complete"))
          return
        }

        const savedCartRes = await fetch(
          `/api/customer/cart?customerId=${customer.id}`
        )
        const { cartId: savedCartId } = await savedCartRes.json()

        if (savedCartId && savedCartId !== cartId) {
          const cartRes = (await fetchCart(savedCartId)) as ShopifyCartResponse
          const cartData = cartRes?.data?.cart

          if (cartData) {
            const items = parseCartData(cartData)
            setCart(items)
            setCartId(savedCartId)
            localStorage.setItem(CART_STORAGE_KEY, savedCartId)
            setIsCartSynced(true)
            window.dispatchEvent(new Event("cart-sync-complete"))
            return
          }
        } else if (savedCartId === cartId) {
          setIsCartSynced(true)
          window.dispatchEvent(new Event("cart-sync-complete"))
          return
        }

        if (cartId) {
          await updateBuyerIdentity(cartId, customerAccessToken)
          await fetch("/api/customer/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerId: customer.id, cartId }),
          })
          setIsCartSynced(true)
          window.dispatchEvent(new Event("cart-sync-complete"))
        }
      } catch (error) {
        console.error("❌ [SYNC] Failed to sync cart:", error)
        window.dispatchEvent(new Event("cart-sync-complete"))
      }
    },
    [isCartSynced, cartId]
  )

  // ✅ STRATEGY 1: Force fresh load on mount
  useEffect(() => {
    const loadCart = async () => {
      const storedCartId = localStorage.getItem(CART_STORAGE_KEY)

      if (storedCartId) {
        try {
          const res = (await fetchCart(storedCartId)) as ShopifyCartResponse
          const cartData = res?.data?.cart

          if (cartData) {
            const items = parseCartData(cartData)
            setCart(items)
            setCartId(cartData.id)
          } else {
            localStorage.removeItem(CART_STORAGE_KEY)
          }
        } catch (error) {
          console.error("❌ [LOAD] Failed to load cart:", error)
          localStorage.removeItem(CART_STORAGE_KEY)
        }
      }
      setIsHydrated(true)
    }

    loadCart()
  }, [])

  // Create new cart if none exists
  useEffect(() => {
    const initCart = async () => {
      if (!cartId && isHydrated) {
        try {
          const res = (await createCart([])) as ShopifyCartResponse
          const newCartId = res?.data?.cartCreate?.cart?.id
          if (newCartId) {
            setCartId(newCartId)
            localStorage.setItem(CART_STORAGE_KEY, newCartId)
            
            const token = getCustomerToken()
            if (token && !isCartSynced) {
              setTimeout(() => syncCartWithCustomer(token), 100)
            }
          }
        } catch (error) {
          console.error("❌ [INIT] Failed to create cart:", error)
        }
      }
    }
    initCart()
  }, [cartId, isHydrated, isCartSynced, syncCartWithCustomer])

  // ✅ NEW: Listen for login complete event with customer data
  useEffect(() => {
    if (!isHydrated) return

    const handleLoginComplete = async (event: Event) => {
      const customEvent = event as CustomEvent<{ token: string; customer: { id: string; email: string } }>
      const { token, customer } = customEvent.detail

      const waitForCart = async () => {
        let attempts = 0
        while (!cartId && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 100))
          attempts++
        }
        
        return new Promise<string | null>((resolve) => {
          setCart((currentCart) => {
            const currentCartId = localStorage.getItem(CART_STORAGE_KEY)
            resolve(currentCartId)
            return currentCart
          })
        })
      }

      const currentCartId = await waitForCart()
      
      if (currentCartId) {
        await syncWithCustomerData(token, customer.id, currentCartId)
      } else {
        console.error("❌ [LOGIN] No cart available after waiting")
        window.dispatchEvent(new Event("cart-sync-complete"))
      }
    }

    window.addEventListener("auth-login-complete", handleLoginComplete)
    return () => window.removeEventListener("auth-login-complete", handleLoginComplete)
  }, [isHydrated, cartId, syncCartWithCustomer])

  // ✅ New helper function: sync directly with customer ID
  const syncWithCustomerData = async (token: string, customerId: string, currentCartId: string) => {
    try {
      const savedCartRes = await fetch(`/api/customer/cart?customerId=${customerId}`)
      const { cartId: savedCartId } = await savedCartRes.json()

      if (savedCartId && savedCartId !== currentCartId) {
        const cartRes = (await fetchCart(savedCartId)) as ShopifyCartResponse
        const cartData = cartRes?.data?.cart

        if (cartData) {
          const items = parseCartData(cartData)
          setCart(items)
          setCartId(savedCartId)
          localStorage.setItem(CART_STORAGE_KEY, savedCartId)
          setIsCartSynced(true)
          window.dispatchEvent(new Event("cart-sync-complete"))
          return
        }
      } else if (savedCartId === currentCartId) {
        setIsCartSynced(true)
        window.dispatchEvent(new Event("cart-sync-complete"))
        return
      }

      if (currentCartId) {
        await updateBuyerIdentity(currentCartId, token)
        await fetch("/api/customer/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId, cartId: currentCartId }),
        })
        setIsCartSynced(true)
        window.dispatchEvent(new Event("cart-sync-complete"))
      }
    } catch (error) {
      console.error("❌ [SYNC] Failed to sync cart:", error)
      window.dispatchEvent(new Event("cart-sync-complete"))
    }
  }

  // Listen for auth changes
  useEffect(() => {
    if (!isHydrated) return // Wait for cart to load first
    
    const handleAuthChange = () => {
      const token = getCustomerToken()

      if (token && cartId) {
        setIsCartSynced(false)
      }
    }

    const handleFocus = () => {
      const token = getCustomerToken()
      if (token && cartId && !isCartSynced) {
        syncCartWithCustomer(token)
      }
    }

    window.addEventListener("auth-token-updated", handleAuthChange)
    window.addEventListener("focus", handleFocus)
    
    return () => {
      window.removeEventListener("auth-token-updated", handleAuthChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [cartId, isHydrated, isCartSynced, syncCartWithCustomer])

  // ✅ STRATEGY 3: Poll for multi-device changes
  useEffect(() => {
    if (!isHydrated || !cartId) return

    const refreshCart = async () => {
      if (isDebounceActiveRef.current) {
        return
      }

      try {
        const res = (await fetchCart(cartId)) as ShopifyCartResponse
        const cartData = res?.data?.cart

        if (cartData) {
          const items = parseCartData(cartData)
          setCart(items)
        }
      } catch (error) {
        console.error("⚠️ [POLL] Failed to sync:", error)
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshCart()
      } else {
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    pollIntervalRef.current = setInterval(() => {
      if (!document.hidden) {
        refreshCart()
      }
    }, 30000)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [isHydrated, cartId])

  // ✅ Optimistic add to cart
  const addToCart = async (itemToAdd: CartItem): Promise<void> => {
    if (!cartId) return

    setCart((prev) => {
      const existing = prev.find((i) => i.variantId === itemToAdd.variantId)
      if (existing) {
        return prev.map((i) =>
          i.variantId === itemToAdd.variantId
            ? { ...i, quantity: i.quantity + itemToAdd.quantity }
            : i
        )
      }
      return [...prev, itemToAdd]
    })

    try {
      const res = (await addCartLines(cartId, [
        { merchandiseId: itemToAdd.variantId, quantity: itemToAdd.quantity },
      ])) as ShopifyCartResponse
      const cartData = res?.data?.cartLinesAdd?.cart

      if (cartData) {
        const items = parseCartData(cartData)
        setCart(items)
      }
    } catch (error) {
      console.error("❌ [ADD] Failed to add to cart:", error)
      setCart((prev) => prev.filter((i) => i.variantId !== itemToAdd.variantId))
    }
  }

  // ✅ Optimistic + debounced remove
  const removeFromCart = async (variantId: string): Promise<void> => {
    if (!cartId) return

    const previousCart = cart
    setCart((prev) => prev.filter((i) => i.variantId !== variantId))

    if (removeTimeoutRef.current) {
      clearTimeout(removeTimeoutRef.current)
    }

    removeTimeoutRef.current = setTimeout(async () => {
      try {
        const lineItem = previousCart.find((i) => i.variantId === variantId)
        if (!lineItem?.lineId) {
          console.warn("⚠️ [REMOVE] Line ID not found")
          return
        }

        await removeCartLines(cartId, [lineItem.lineId])

        const cartRes = (await fetchCart(cartId)) as ShopifyCartResponse
        const cartData = cartRes?.data?.cart
        if (cartData) {
          const items = parseCartData(cartData)
          setCart(items)
        }
      } catch (error) {
        console.error("❌ [REMOVE] Failed to remove from cart:", error)
        setCart(previousCart)
      }
    }, 600)
  }

  // ✅ Optimistic + debounced quantity update
  const updateQuantity = async (
    variantId: string,
    quantity: number
  ): Promise<void> => {
    if (!cartId) return
    isDebounceActiveRef.current = true

    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.variantId !== variantId)
      }
      return prev.map((i) =>
        i.variantId === variantId ? { ...i, quantity } : i
      )
    })

    quantityChangeRef.current.set(variantId, quantity)

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    updateTimeoutRef.current = setTimeout(async () => {
      try {
        const finalQuantity = quantityChangeRef.current.get(variantId)
        quantityChangeRef.current.delete(variantId)

        if (finalQuantity === undefined) return

        let lineId: string | undefined

        setCart((currentCart) => {
          const lineItem = currentCart.find((i) => i.variantId === variantId)
          lineId = lineItem?.lineId
          return currentCart
        })

        if (!lineId) {
          console.warn("⚠️ [QUANTITY] Line ID not found")
          return
        }

        if (finalQuantity <= 0) {
          await removeCartLines(cartId, [lineId])
        } else {
          await updateCartLines(cartId, [{ id: lineId, quantity: finalQuantity }])
        }

        const cartRes = (await fetchCart(cartId)) as ShopifyCartResponse
        const cartData = cartRes?.data?.cart
        if (cartData) {
          const items = parseCartData(cartData)
          setCart(items)
        }
      } catch (error) {
        console.error("❌ [QUANTITY] Failed to update:", error)
      } finally {
        isDebounceActiveRef.current = false
      }
    }, 800)
  }

  const checkout = async (): Promise<void> => {
    if (!cartId) return
    try {
      const res = (await fetchCart(cartId)) as ShopifyCartResponse
      const checkoutUrl = res?.data?.cart?.checkoutUrl
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      }
    } catch (error) {
      console.error("Failed to checkout:", error)
    }
  }

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = cart.reduce((sum, i) => sum + i.quantity * i.price, 0)
  const isEmpty = cart.length === 0

  if (!isHydrated) return null

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartCount,
    totalPrice,
    isEmpty,
    checkout,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}