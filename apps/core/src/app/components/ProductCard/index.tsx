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
    };
  };
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => (
  <ReactantProductCard key={product.entityId}>
    <ProductCardImage>
      <Image
        alt={product.defaultImage?.altText ?? product.name}
        className="h-full w-full object-contain object-center sm:h-full sm:w-full"
        height={300}
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
      <ProductCardInfoPrice>${product.prices?.price?.value}</ProductCardInfoPrice>
    </ProductCardInfo>
  </ReactantProductCard>
);
