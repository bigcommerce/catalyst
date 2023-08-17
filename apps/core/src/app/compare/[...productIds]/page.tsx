export default function Compare({ params }: { params: { productIds: string[] } }) {
  const productIds = params.productIds;

  return <h1 className="text-h2">Comparing {productIds.length} products</h1>;
}
