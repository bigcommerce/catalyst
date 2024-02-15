import { getProduct } from '~/client/queries/get-product';

type Product = Awaited<ReturnType<typeof getProduct>>;

export const Description = ({ product }: { product: NonNullable<Product> }) => {
  if (!product.description) {
    return null;
  }

  return (
    <>
      <h2 className="mb-4 text-xl font-bold md:text-2xl">Description</h2>
      <div dangerouslySetInnerHTML={{ __html: product.description }} />
    </>
  );
};
