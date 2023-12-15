import Link from 'next/link';

import { getProduct } from '~/client/queries/getProduct';
import { cn } from '~/lib/utils';

interface Props {
  productId: number;
}

export const BreadCrumbs = async ({ productId }: Props) => {
  const product = await getProduct(productId);
  const category = product?.categories?.[0];

  if (!category) {
    return null;
  }

  return (
    <nav>
      <ul className="m-0 flex flex-wrap items-center p-0 md:container md:mx-auto ">
        {category.breadcrumbs.map((breadcrumb, i, arr) => {
          const isLast = arr.length - 1 === i;

          return (
            <li
              className={cn('p-1 ps-0 hover:text-blue-primary', {
                'font-semibold': !isLast,
                'font-extrabold': isLast,
              })}
              key={breadcrumb.name}
            >
              <Link href="#">{breadcrumb.name}</Link>
              {!isLast && <span className="mx-2">/</span>}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
