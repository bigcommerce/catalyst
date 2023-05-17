import { Camera } from 'lucide-react';
import React from 'react';

import { getProduct } from '@client';

export default async function HomePage() {
  const rng = await getProduct(77);

  return (
    <main>
      <div>
        Catalyst <Camera color="#053FB0" />
      </div>

      <div>
        <pre>{JSON.stringify(rng, null, 2)}</pre>
      </div>
    </main>
  );
}
