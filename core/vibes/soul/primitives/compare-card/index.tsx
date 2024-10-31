import clsx from 'clsx'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/vibes/soul/primitives/button'
import { CardProduct, ProductCard } from '@/vibes/soul/primitives/product-card'

import { Rating } from '../rating'

export type CompareProduct = CardProduct & { description?: string }

export type Props = {
  className?: string
  product: CompareProduct
  addToCartAction?(id: string): Promise<void>
  addToCartLabel?: string
  descriptionLabel?: string
  ratingLabel?: string
}

export function CompareCard({
  className,
  product,
  addToCartAction,
  addToCartLabel = 'Add to Cart',
  descriptionLabel = 'Description',
  ratingLabel = 'Rating',
}: Props) {
  return (
    <div className={clsx('flex flex-col divide-y divide-contrast-100 @container', className)}>
      <div className="mb-2 space-y-4 pb-4">
        <ProductCard product={product} />
        {addToCartAction && (
          <form action={addToCartAction.bind(null, product.id)}>
            <Button className="w-full" size="medium" type="submit">
              {addToCartLabel} <ArrowRight size={20} strokeWidth={1} absoluteStrokeWidth />
            </Button>
          </form>
        )}
      </div>
      <div className="space-y-5 py-5">
        <h3 className="font-mono text-xs uppercase">{descriptionLabel}</h3>
        <p>{product.description}</p>
      </div>
      <div className="space-y-5 py-5">
        <h3 className="font-mono text-xs uppercase">{ratingLabel}</h3>
        {product.rating != null && <Rating rating={product.rating} />}
      </div>
    </div>
  )
}
