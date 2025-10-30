import { getProductByHandle, getProducts } from "@/lib/shopify-client"
import { notFound } from "next/navigation"
import ProductClientPage from "./product-client-page"
import { RelatedProducts } from '@/components/related-products'
import { generateProductSchema } from '@/lib/jsonld'
import { Footer } from '@/components/footer'

// ✅ Enable ISR - revalidate every hour
export const revalidate = 3600

// ✅ Generate static params for top 20 products at build time
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

  // ✅ Ensure product is not null before proceeding
  if (!product) {
    notFound()
  }

  // ✅ TypeScript now knows `product` is definitely a ShopifyProduct
  const productSchema = generateProductSchema(product, params.handle)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
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
