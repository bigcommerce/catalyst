import { cs } from '@bigcommerce/reactant/cs';
import {
  ProductCardImage,
  ProductCardInfo,
  ProductCardInfoBrandName,
  ProductCardInfoPrice,
  ProductCardInfoProductName,
  ProductCard as ReactantProductCard,
} from '@bigcommerce/reactant/ProductCard';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  entityId: number;
  name: string;
  defaultImage?: {
    altText?: string;
    url: string;
  };
  brand?: {
    name: string;
  };
  prices?: {
    price?: {
      value?: number;
      currencyCode?: string;
    };
  };
}

interface ProductCardProps {
  product: Product;
  imageSize?: 'tall' | 'wide' | 'square';
  imagePriotity?: boolean;
}

export const ProductCard = ({ product, imageSize, imagePriotity = false }: ProductCardProps) => {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.prices?.price?.currencyCode,
  });

  return (
    <ReactantProductCard key={product.entityId}>
      <ProductCardImage>
        <Image
          alt={product.defaultImage?.altText ?? product.name}
          className={cs('object-contain object-center', {
            'aspect-square': imageSize === 'square',
            'aspect-[4/5]': imageSize === 'tall',
            'aspect-[7/5]': imageSize === 'wide',
          })}
          height={300}
          priority={imagePriotity}
          src={product.defaultImage?.url ?? ''}
          width={300}
        />
      </ProductCardImage>
      <ProductCardInfo>
        {product.brand && <ProductCardInfoBrandName>{product.brand.name}</ProductCardInfoBrandName>}
        <ProductCardInfoProductName>
          <Link href={`/product/${product.entityId}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
        </ProductCardInfoProductName>
        {product.prices?.price?.value !== undefined && (
          <ProductCardInfoPrice>
            {currencyFormatter.format(product.prices.price.value)}
          </ProductCardInfoPrice>
        )}
      </ProductCardInfo>
    </ReactantProductCard>
  );
};
