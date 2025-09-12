export default async function RolexPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <div>Rolex Page {slug}</div>;
}
