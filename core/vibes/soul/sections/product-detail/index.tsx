'use client'

import NextImage from 'next/image'
import { useState } from 'react'

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { clsx } from 'clsx'

import { Button } from '@/vibes/soul/primitives/button'
import { Favorite } from '@/vibes/soul/primitives/favorite'
import { Label } from '@/vibes/soul/primitives/label'
import { PriceLabel } from '@/vibes/soul/primitives/price-label'
import { CardProduct } from '@/vibes/soul/primitives/product-card'
import { Rating } from '@/vibes/soul/primitives/rating'
import { ProductGallery } from '@/vibes/soul/sections/product-detail/product-gallery'

interface ProductDetailType extends CardProduct {
  options?: string[]
  swatches?: {
    id: string
    name: string
    image?: { src: string; alt: string }
    hex?: string
  }[]
  images?: { src: string; alt: string }[]
}

export interface ProductDetailProps {
  product: ProductDetailType
}

export const ProductDetail = function ProductDetail({ product }: ProductDetailProps) {
  const [favorited, setFavorited] = useState(false)
  const [selectedOption, setSelectedOption] = useState(product.options?.[0] ?? null)
  const [selectedSwatch, setSelectedSwatch] = useState(product.swatches?.[0] ?? null)

  return (
    <section className="flex flex-col bg-background @container">
      <div className="mx-auto grid h-full w-full max-w-screen-2xl flex-grow @4xl:min-h-[800px] @4xl:grid-cols-2">
        <ProductGallery images={product.images ?? []} />

        {/* Product Details */}
        <div className="my-auto flex flex-col gap-4 px-3 py-10 text-foreground @xl:px-6 @4xl:py-28 @5xl:px-20">
          <h2 className="font-heading text-3xl font-medium leading-none">{product.title}</h2>
          <Rating rating={product.rating ?? 0} />
          {product.subtitle != null && product.subtitle !== '' && <p>{product.subtitle}</p>}
          <PriceLabel price={product.price ?? ''} className="!text-2xl" />

          <form className="mt-6 flex flex-col gap-4 @4xl:mt-12">
            {/* Options */}
            {product.options && (
              <>
                <Label>Size</Label>
                <RadioGroupPrimitive.Root className="flex flex-wrap gap-2.5 ">
                  {product.options.map((option, index) => (
                    <RadioGroupPrimitive.Item
                      key={index}
                      value={option}
                      onClick={() => setSelectedOption(option)}
                      className={clsx(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors duration-300',
                        'ring-primary focus-visible:outline-0 focus-visible:ring-2',
                        option === selectedOption
                          ? 'bg-foreground text-background'
                          : 'bg-contrast-100 hover:bg-contrast-200'
                      )}
                    >
                      {option}
                    </RadioGroupPrimitive.Item>
                  ))}
                </RadioGroupPrimitive.Root>
              </>
            )}

            {/* Swatches */}
            {product.swatches && (
              <>
                {/* TODO: Restructure JSON to include group name */}
                <Label className="mt-6">
                  {(selectedSwatch?.name != null && selectedSwatch.name !== '') || 'Color'}
                </Label>
                <RadioGroupPrimitive.Root className="flex flex-wrap gap-2.5">
                  {product.swatches.map(swatch => (
                    <RadioGroupPrimitive.Item
                      key={swatch.id}
                      value={swatch.id}
                      onClick={() => setSelectedSwatch(swatch)}
                      className={clsx(
                        'relative h-12 w-12 shrink-0 overflow-hidden rounded-full transition-colors duration-300',
                        ' focus-visible:outline-0 focus-visible:ring-2',
                        swatch.id === selectedSwatch?.id ? 'ring-primary' : 'ring-transparent'
                      )}
                    >
                      {swatch.image?.src != null && swatch.image.src !== '' ? (
                        <NextImage
                          src={swatch.image.src}
                          alt={swatch.image.alt}
                          height={48}
                          width={48}
                          className="h-full object-cover"
                        />
                      ) : null}
                      {/* {swatch.name} */}
                    </RadioGroupPrimitive.Item>
                  ))}
                </RadioGroupPrimitive.Root>
              </>
            )}

            <div className="mt-4 flex max-w-sm gap-2">
              <Button className="flex-grow">Add to Cart</Button>
              <Favorite checked={favorited} setChecked={setFavorited} />
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
