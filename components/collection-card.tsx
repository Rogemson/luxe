"use client"

import Image from "next/image"
import Link from "next/link"

interface CollectionCardProps {
  id: string
  title: string
  image: string
  productCount?: number
  isAboveTheFold?: boolean // optional prop
}

export function CollectionCard({ id, title, image, productCount, isAboveTheFold = false }: CollectionCardProps) {
  return (
    <Link href={`/collection/${id}`}>
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden bg-secondary mb-4 aspect-square">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading={isAboveTheFold ? "eager" : "lazy"}
            priority={isAboveTheFold}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="text-center">
              <h3 className="font-serif text-2xl font-semibold text-background mb-2">{title}</h3>
              {productCount && <p className="text-sm text-background/80">{productCount} items</p>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
