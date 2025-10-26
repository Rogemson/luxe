import { useState, useCallback } from "react"

interface LoginResponse {
  token: string
  success: boolean
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

      if (data.token && data.success) {
        // ✅ Store token in localStorage
        localStorage.setItem("customerAccessToken", data.token)
        console.log("✅ [AUTH] Token stored in localStorage")
        
        // Trigger cart sync by reloading or dispatching event
        window.dispatchEvent(new Event("auth-token-updated"))
        
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
      localStorage.removeItem("customerAccessToken")
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
