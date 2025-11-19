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
import { generateOrganizationSchema } from '@/lib/jsonld' // ✅ Import organization schema

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  display: 'swap',
  preload: true,
  fallback: ['Georgia', 'serif'],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
})

export const metadata: Metadata = {
  ...defaultMetadata,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || ''
  
  // ✅ Generate organization schema for all pages
  const organizationSchema = generateOrganizationSchema()

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {/* ✅ NEW: Organization Schema for Knowledge Graph */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {shopifyDomain && (
          <>
            <link rel="dns-prefetch" href={`https://${shopifyDomain}`} />
            <link rel="preconnect" href={`https://${shopifyDomain}`} crossOrigin="anonymous" />
          </>
        )}
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
        <link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="anonymous" />
        
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        <meta name="google-site-verification" content="nWEJaEXuavHBP3Zoc8b6VANAFux9KHENDVlJNSMgBO4" />
      </head>
      <body className="font-sans antialiased">
        <CartProvider>
          <WishlistProvider>
            <SearchProvider>
              <FiltersProvider>
                <Toaster position="top-center" richColors closeButton />
                <OfflineGuard />
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