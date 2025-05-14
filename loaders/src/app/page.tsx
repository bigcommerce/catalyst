import { Render } from "@/render";

import "@/components/product-list";

export default function Home() {
  return (
    <main>
      <Render type="product-list" context={{}} />
    </main>
  );
}
