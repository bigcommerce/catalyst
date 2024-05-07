'use client';

import { Printer } from 'lucide-react';

export const PrintButton = () => (
  <button
    className="hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
    onClick={() => {
      window.print();

      return false;
    }}
    type="button"
  >
    <Printer size={24}>
      <title>Print</title>
    </Printer>
  </button>
);
