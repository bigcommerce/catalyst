'use client';

import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

interface Props {
  current?: number;
  max?: number;
}

export const Counter = function Counter({ current = 0, max = 20 }: Props) {
  const [count, setCount] = useState(current);

  const decrement = () => {
    if (count > 0) {
      setCount((prev) => prev - 1);
    }
  };
  const increment = () => {
    if (count < max) {
      setCount((prev) => prev + 1);
    }
  };

  return (
    <div className="flex items-center rounded-lg border">
      <button
        aria-label="Decrease count"
        className="group rounded-l-lg p-3 hover:bg-primary-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={decrement}
      >
        <Minus
          className="text-contrast-300 transition-colors duration-300 group-hover:text-foreground"
          size={18}
          strokeWidth={1.5}
        />
      </button>
      <span className="flex w-8 select-none justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        {count}
      </span>
      <button
        aria-label="Increase count"
        className="group rounded-r-lg p-3 transition-colors duration-300 hover:bg-primary-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={increment}
      >
        <Plus
          className="text-contrast-300 transition-colors duration-300 group-hover:text-foreground"
          size={18}
          strokeWidth={1.5}
        />
      </button>
    </div>
  );
};
