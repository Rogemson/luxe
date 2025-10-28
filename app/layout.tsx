import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/context/cart"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { WishlistProvider } from '@/context/wishlist'
import { SearchProvider } from '@/context/search'
import { ProductsLoader } from '@/components/products-loader'
import { FiltersProvider } from '@/context/filters'
import { GoogleAnalytics } from '@next/third-parties/google'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || ''

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {shopifyDomain && (
          <>
            <link rel="dns-prefetch" href={`https://${shopifyDomain}`} />
            <link rel="preconnect" href={`https://${shopifyDomain}`} crossOrigin="anonymous" />
          </>
        )}
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
        <link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <CartProvider>
          <WishlistProvider>
            <SearchProvider>
              <FiltersProvider>  {/* Add this wrapper */}
                <ProductsLoader />
                {children}
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
              </FiltersProvider>
            </SearchProvider>
          </WishlistProvider>
          <SpeedInsights />
        </CartProvider>
      </body>
    </html>
  )
}