"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"
import { CartItem, CartContextType } from "@/lib/shopify-types"

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "shopify_cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Initialize cart from localStorage only on client side
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (storedCart) {
        setCart(JSON.parse(storedCart))
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error)
      }
    }
  }, [cart, isHydrated])

  const addToCart = (itemToAdd: CartItem): void => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.variantId === itemToAdd.variantId)
      
      if (existingItem) {
        return prevCart.map((item) =>
          item.variantId === itemToAdd.variantId
            ? { ...item, quantity: item.quantity + itemToAdd.quantity }
            : item
        )
      }
      return [...prevCart, itemToAdd]
    })
  }

  const removeFromCart = (variantId: string): void => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.variantId !== variantId)
    )
  }

  const updateQuantity = (variantId: string, quantity: number): void => {
    if (quantity <= 0) {
      removeFromCart(variantId)
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item
        )
      )
    }
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const isEmpty = cart.length === 0

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartCount,
    totalPrice,
    isEmpty,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
