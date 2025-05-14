import { registerSection } from "@/registry";

export type ProductListProps = {
  products: string[];
};

export function ProductList({ products }: ProductListProps) {
  return (
    <ul>
      {products.map((p) => (
        <li key={p}>{p}</li>
      ))}
    </ul>
  );
}

registerSection<ProductListProps>("product-list", {
  component: ProductList,
  async getData(ctx) {
    await new Promise((r) => setTimeout(r, 5000));
    return { products: ["Hat", "Shirt", "Shoes"] };
  },
});
