import Image from 'next/image';

import client from '~/client';

interface Props {
  productId: number;
}

export const Gallery = async ({ productId }: Props) => {
  const product = await client.getProduct(productId);

  if (!product) {
    return null;
  }

  // TODO: make this change based on variant
  return (
    <div className="-mx-6 mb-12 flex flex-col sm:-mx-0">
      <Image
        // alt={variantAltText || product.defaultImage.altText}
        alt={product.defaultImage?.altText ?? ''}
        className="self-center"
        height={619}
        priority
        // src={variantImage || product.defaultImage.url}
        src={product.defaultImage?.url ?? ''}
        width={619}
      />

      <ul className="mt-6 grid grid-cols-5">
        {product.images.map((image, index) => {
          return (
            <li className="col-span-1 flex justify-center" key={index}>
              <Image alt={image.altText} height={104} priority src={image.url} width={104} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};
