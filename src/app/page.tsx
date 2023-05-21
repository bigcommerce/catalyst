import { Camera } from 'lucide-react';
import React from 'react';

export default function HomePage() {
  return (
    <main>
      <div>
        Catalyst Homepage <Camera className="inline-block" color="#053FB0" />
      </div>
    </main>
  );
}

export const runtime = 'edge';
