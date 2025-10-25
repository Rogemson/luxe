import { getProductByHandle } from "@/lib/shopify-client"
import { notFound } from "next/navigation"
import ProductClientPage from "./product-client-page"
import { RelatedProducts } from '@/components/related-products'
import { Footer } from '@/components/footer'  // Import Footer

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

  return (
    <>
      <ProductClientPage product={product} />
      <RelatedProducts 
        currentProductId={product.id} 
        collection={product.collection} 
      />
      <Footer />  {/* Add Footer here */}
    </>
  )
}
