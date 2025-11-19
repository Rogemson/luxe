import { getProductByHandle, getProducts } from "@/lib/shopify-client"
import { notFound } from "next/navigation"
import ProductClientPage from "./product-client-page"
import { RelatedProducts } from '@/components/related-products'
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/jsonld'
import { Footer } from '@/components/footer'
import { siteUrl } from '@/lib/seo'

export const revalidate = 3600

export async function generateStaticParams() {
  const products = await getProducts(20)
  return products.map((product) => ({
    handle: product.handle,
  }))
}

interface ProductPageProps {
  params: Promise<{ handle: string }>
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params

  if (!params?.handle) {
    console.error("[SERVER PAGE] No handle found on params. Aborting.")
    notFound()
  }

  const product = await getProductByHandle(params.handle)

  if (!product) {
    notFound()
  }

  // ✅ Generate product schema
  const productSchema = generateProductSchema(product, params.handle)

  // ✅ NEW: Generate breadcrumb schema
  const breadcrumbs = [
    { name: 'Home', url: siteUrl },
    { name: 'Products', url: `${siteUrl}/products` },
    // Add collection breadcrumb if available
    ...(product.collection 
      ? [{ 
          name: product.collection, 
          url: `${siteUrl}/collections/${product.collection.toLowerCase().replace(/\s+/g, '-')}` 
        }] 
      : []
    ),
    { name: product.title, url: `${siteUrl}/products/${params.handle}` }
  ]

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs)

  // ✅ Combine both schemas into one script tag
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [productSchema, breadcrumbSchema]
  }

  return (
    <>
      {/* ✅ Single JSON-LD script with multiple schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />
      <ProductClientPage product={product} />
      <RelatedProducts 
        currentProductId={product.id} 
        collection={product.collection} 
      />
      <Footer />
    </>
  )
}