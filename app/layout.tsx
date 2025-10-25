import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/context/cart"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { WishlistProvider } from '@/context/wishlist'

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "LUXE - Premium Clothing Store",
  description: "Discover our curated collection of premium clothing designed for the modern lifestyle.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <CartProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
          <SpeedInsights />
        </CartProvider>{" "}
      </body>
    </html>
  )
}
