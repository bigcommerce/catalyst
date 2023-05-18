import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { getProduct } from '@client';

import { BreadCrumbs } from './Breadcrumbs';
// import { Gallery } from './Gallery';
// import { Reviews } from './Reviews';
// import { ReviewSummary } from './ReviewSummary';
// import { Variants } from './Variants';

export default async function Product({ params }: { params: { slug: string } }) {
  const productId = Number(params.slug);
  const product = await getProduct(productId);

  // We can use useId in async server components so manually creating the id.
  const reviewSectionId = 'write-a-review';

  if (!product) {
    return notFound();
  }

  return (
    <>
      {/* @ts-expect-error Server Component */}
      <BreadCrumbs productId={productId} />
    </>
  );
}
// <div className="container mx-auto px-4 py-8">
//   <div className="grid-cols-2 gap-4 grid">
//     <div className="order-2">
//       <p>{product.brand.name}</p>}
//       <h1 className="text-xl font-bold mb-4">{product.name}</h1>
//       <Suspense fallback="Loading...">
//         {/* @ts-expect-error Server Component */}
//         <ReviewSummary productId={productId} reviewSectionId={reviewSectionId} />
//       </Suspense>

//       {/* @ts-expect-error Server Component */}
//       <Variants productId={productId} />
//     </div>

//     <div className="order-1">
//       {/* @ts-expect-error Server Component */}
//       <Gallery productId={productId} />

//       {Boolean(product.plainTextDescription) && (
//         <>
//           <h2 className="text-xl font-bold mb-4">Description</h2>
//           <p>{product.plainTextDescription}</p>
//         </>
//       )}

//       {Boolean(product.warranty) && (
//         <>
//           <h2 className="text-xl font-bold mb-4 mt-8">Warranty</h2>
//           <p>{product.warranty}</p>
//         </>
//       )}

//       <Suspense fallback="Loading...">
//         {/* @ts-expect-error Server Component */}
//         <Reviews productId={productId} reviewSectionId={reviewSectionId} />
//       </Suspense>
//     </div>
//   </div>
// </div>

export const runtime = 'experimental-edge';
