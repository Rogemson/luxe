// lib/seo.ts
import type { Metadata } from 'next'

const siteConfig = {
  name: 'LUXE',
  title: 'LUXE - Premium Clothing Store',
  description:
    'Discover our curated collection of premium clothing designed for the modern lifestyle. Quality, style, and sustainability in every piece.',
  url: 'https://zoster.vercel.app',
  image: 'https://zoster.vercel.app/og-image.png',
  twitterHandle: '@luxestore',
  locale: 'en_US',
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: '%s | LUXE',
  },
  description: siteConfig.description,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large', // ✅ valid literal
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.image,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.image],
  },
  alternates: {
    canonical: siteConfig.url,
  },
}

export const siteUrl = siteConfig.url
export const siteName = siteConfig.name
