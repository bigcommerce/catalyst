import { CompareCard, CompareProduct } from '../../primitives/compare-card'

type Props = {
  className?: string
  title?: string
  products: CompareProduct[]
  addToCartAction?(id: string): Promise<void>
}

export function CompareSection({
  className,
  title = 'Compare products',
  products,
  addToCartAction,
}: Props) {
  return (
    <div className={className}>
      <div className="pb-8 pt-6 text-foreground">
        <h1 className="text-3xl font-medium leading-none @lg:text-4xl @2xl:text-5xl ">
          {title} <span className="text-contrast-300">{products.length}</span>
        </h1>
      </div>
      <div className="flex w-full gap-8 @container">
        {products.map(product => (
          <CompareCard
            className="min-w-[400px] flex-1"
            product={product}
            addToCartAction={addToCartAction}
          />
        ))}
      </div>
    </div>
  )
}
