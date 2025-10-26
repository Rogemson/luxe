import { useState, useCallback } from "react"

interface CustomerData {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

interface LoginResponse {
  token: string
  success: boolean
  customer?: CustomerData
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data: LoginResponse = await response.json()

      if (!response.ok) {
        setError(data.token ? "Login failed" : "Invalid credentials")
        return false
      }

      if (data.token && data.success && data.customer) {
        console.log("✅ [AUTH] Login successful, customer:", data.customer.id)
        
        // ✅ Store all auth data
        localStorage.setItem("customerAccessToken", data.token)
        localStorage.setItem("customerEmail", data.customer.email)
        localStorage.setItem("customerId", data.customer.id)
        localStorage.setItem("shopifyCustomerToken", data.token) // For backward compatibility
        
        // ✅ Trigger immediate cart sync with customer data
        window.dispatchEvent(new CustomEvent("auth-login-complete", { 
          detail: { 
            token: data.token,
            customer: data.customer 
          } 
        }))
        
        console.log("✅ [AUTH] Dispatched login complete event with customer data")
        
        return true
      }

      return false
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
      console.error("❌ [AUTH] Login error:", err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      // Remove all auth-related items
      localStorage.removeItem("customerAccessToken")
      localStorage.removeItem("customerEmail")
      localStorage.removeItem("customerId")
      localStorage.removeItem("shopifyCustomerToken")
      localStorage.removeItem("shopify_cart_id")
      
      window.dispatchEvent(new Event("auth-token-updated"))
      console.log("✅ [AUTH] Logged out")
      return true
    } catch (err) {
      console.error("❌ [AUTH] Logout error:", err)
      return false
    }
  }, [])

  return { login, logout, isLoading, error }
}