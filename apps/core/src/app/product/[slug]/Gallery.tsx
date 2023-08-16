import Image from 'next/image';

import client from '~/client';
import { assertNonNullable } from '~/utils';

export const Gallery = ({
  product,
}: {
  product: Awaited<ReturnType<typeof client.getProduct>>;
}) => {
  assertNonNullable(product);

  return (
    <div className="-mx-6 mb-12 flex flex-col sm:-mx-0 ">
      <div className="lg:sticky lg:top-0">
        <Image
          alt={product.defaultImage?.altText ?? ''}
          className="self-center"
          height={619}
          priority
          src={product.defaultImage?.url ?? ''}
          width={619}
        />

        <ul className="mt-6 grid grid-cols-5">
          {product.images.map((image, index) => {
            return (
              <li className="col-span-1 flex justify-center" key={index}>
                <Image
                  alt={image.altText || ''}
                  height={104}
                  priority
                  src={image.url || ''}
                  width={104}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
