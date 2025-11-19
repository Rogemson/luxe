import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/context/cart"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { WishlistProvider } from '@/context/wishlist'
import { SearchProvider } from '@/context/search'
import { FiltersProvider } from '@/context/filters'
import { GoogleAnalytics } from '@next/third-parties/google'
import { OfflineGuard } from '@/components/offline-guard'
import { Toaster } from 'sonner'
import { defaultMetadata } from '@/lib/seo'

// ✅ Optimize font loading with display swap
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  display: 'swap', // ✅ Prevent layout shift
  preload: true,
  fallback: ['Georgia', 'serif'],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap', // ✅ Prevent layout shift
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
})

export const metadata: Metadata = {
  ...defaultMetadata,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || ''

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {/* ✅ DNS prefetch for faster connections */}
        {shopifyDomain && (
          <>
            <link rel="dns-prefetch" href={`https://${shopifyDomain}`} />
            <link rel="preconnect" href={`https://${shopifyDomain}`} crossOrigin="anonymous" />
          </>
        )}
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
        <link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="anonymous" />
        
        {/* ✅ Preconnect to GA for faster analytics */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        <meta name="google-site-verification" content="nWEJaEXuavHBP3Zoc8b6VANAFux9KHENDVlJNSMgBO4" />
      </head>
      <body className="font-sans antialiased">
        {/* ✅ Reduced nesting - combine related providers */}
        <CartProvider>
          <WishlistProvider>
            <SearchProvider>
              <FiltersProvider>
                <Toaster position="top-center" richColors closeButton />
                <OfflineGuard />
                {/* ❌ REMOVED ProductsLoader - Will load on-demand */}
                {children}
                {/* ✅ GA loads async, non-blocking */}
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
