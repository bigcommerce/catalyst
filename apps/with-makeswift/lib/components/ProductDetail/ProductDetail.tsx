import React, { ComponentPropsWithoutRef, ReactNode, useState } from 'react';

import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

import clsx from 'clsx';

import * as ToggleGroup from '@radix-ui/react-toggle-group';

import { ReviewRating } from '../ReviewRating';
import { Button } from '../Button';
import { ColorSwatch } from '@components/ColorSwatch';

interface Props {
  className?: string;
  brand?: string;
  name?: string;
  price?: string;
}

const sizes = [
  { label: 'S', value: 'small' },
  { label: 'M', value: 'medium' },
  { label: 'L', value: 'large' },
  { label: 'XL', value: 'xlarge' },
  { label: 'XXL', value: 'xxlarge' },
];

const colors = [
  { colorValue: '#ff0000', value: 'red' },
  { colorValue: 'yellow', value: 'yellow' },
  { colorValue: 'black', value: 'black' },
  { colorValue: 'gray', value: 'gray' },
  { colorValue: 'purple', value: 'purple' },
  { colorValue: 'orange', value: 'orange' },
  { colorValue: 'cyan', value: 'cyan' },
  { colorValue: 'pink', value: 'pink' },
];

export function ProductDetail({
  className,
  brand = 'Base London',
  name = 'Accessories',
  price = '25.50',
}: Props) {
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const [quantity, setQuantity] = useState(1);
  const increaseCount = () => {
    setQuantity(quantity + 1);
  };
  const decreaseCount = () => {
    setQuantity(quantity - 1);
  };

  return (
    <div className={clsx(className, 'flex flex-col gap-8 lg:flex-row')}>
      <div className="flex-1"></div>

      <div className="flex-1">
        <div className="text-base font-semibold uppercase text-gray-500">{brand}</div>
        <h1 className="m-0 w-full flex-1 text-h3 font-black leading-snug lg:text-h2">{name}</h1>
        <div className="mt-3 flex items-center gap-x-3">
          <ReviewRating stars={3.5} color="var(--blue-primary)" />
          <span className="text-base">3.56 (1)</span>
          <button className="font-semibold text-blue-primary hover:text-black">
            Write a review
          </button>
        </div>

        <div className="mt-6 text-h4 font-bold">${price}</div>

        <div className="mb-2 mt-6 text-base font-semibold">Sizes</div>
        <ToggleGroup.Root
          className="flex flex-wrap items-center gap-4"
          type="single"
          defaultValue="small"
          aria-label="Sizes"
        >
          {sizes.map((size) => (
            <ToggleGroup.Item value={size.value} asChild>
              <button className="border-2 border-gray-200 px-6 py-2.5 data-[state=on]:border-blue-primary">
                {size.label}
              </button>
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>

        <div className="mb-2 mt-6 text-base font-semibold">
          Color: <span>{selectedColor?.value}</span>
        </div>
        <ToggleGroup.Root
          className="flex flex-wrap items-center gap-4"
          type="single"
          defaultValue="red"
          aria-label="Color"
        >
          {colors.map((color) => (
            <ToggleGroup.Item value={color.value} asChild>
              <button
                className="w-12 border-2 border-gray-200 p-1 data-[state=on]:border-blue-primary"
                onClick={() => setSelectedColor(color)}
              >
                <ColorSwatch colorValue={color.colorValue} />
              </button>
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>

        <div className="mb-2 mt-6 text-base font-semibold">Quantity</div>

        <div className="inline-flex items-center gap-x-2 border-2 border-gray-200 p-3">
          <button onClick={() => decreaseCount()}>
            <ChevronDown />
          </button>
          <p className="w-8 text-center text-base font-semibold">{quantity}</p>
          <button onClick={() => increaseCount()}>
            <ChevronUp />
          </button>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 md:flex-row">
          <Button icon="shopping-cart" className="w-full">
            Add to cart
          </Button>
          <Button variant="secondary" icon="heart" className="w-full">
            Save to wishlist
          </Button>
        </div>
      </div>
    </div>
  );
}
