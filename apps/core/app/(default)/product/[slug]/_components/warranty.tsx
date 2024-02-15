import { getProduct } from '~/client/queries/get-product';

type Product = Awaited<ReturnType<typeof getProduct>>;

export const Warranty = ({ product }: { product: NonNullable<Product> }) => {
  if (!product.warranty) {
    return null;
  }

  return (
    <>
      <h2 className="mb-4 mt-8 text-xl font-bold md:text-2xl">Warranty</h2>
      <p>{product.warranty}</p>
    </>
  );
};
