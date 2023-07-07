import * as ToggleGroup from '@radix-ui/react-toggle-group';
import clsx from 'clsx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '../Button';
import { ColorSwatch } from '../ColorSwatch';
import { ProductCarousel } from '../ProductCarousel';
import { ReviewRating } from '../ReviewRating';

interface Props {
  className?: string;
  brand?: string;
  name?: string;
  price?: string;
  averageRating?: number;
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
  averageRating = 3.56,
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
      <div className="flex-1">
        <ProductCarousel slides={[]} />
      </div>

      <div className="flex-1">
        <div className="text-base font-semibold uppercase text-gray-500">{brand}</div>
        <h1 className="m-0 w-full flex-1 text-h3 font-black leading-snug lg:text-h2">{name}</h1>
        <div className="mt-3 flex items-center gap-x-3">
          <ReviewRating color="var(--blue-primary)" stars={averageRating} />
          <span className="text-base leading-normal">{averageRating} (1)</span>
          <button className="text-base font-semibold leading-normal text-blue-primary hover:text-black">
            Write a review
          </button>
        </div>

        <div className="mt-6 text-h4 font-bold">${price}</div>

        <div className="mb-2 mt-6 text-base font-semibold">Sizes</div>
        <ToggleGroup.Root
          aria-label="Sizes"
          className="flex flex-wrap items-center gap-4"
          defaultValue="small"
          type="single"
        >
          {sizes.map((size, index) => (
            <ToggleGroup.Item asChild key={index} value={size.value}>
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
          aria-label="Color"
          className="flex flex-wrap items-center gap-4"
          defaultValue="red"
          type="single"
        >
          {colors.map((color, index) => (
            <ToggleGroup.Item asChild key={index} value={color.value}>
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
          <Button className="w-full" icon="shopping-cart">
            Add to cart
          </Button>
          <Button className="w-full" icon="heart" variant="secondary">
            Save to wishlist
          </Button>
        </div>
      </div>
    </div>
  );
}
