import {
  ProductCard,
  ProductCardBadge,
  ProductCardImage,
  ProductCardInfo,
  ProductCardInfoBrandName,
  ProductCardInfoPrice,
  ProductCardInfoProductName,
} from '@bigcommerce/components/product-card';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ProductCard> = {
  component: ProductCard,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ProductCard>;

export const BasicExample: Story = {
  render: () => (
    <ProductCard>
      <ProductCardImage>
        <div className="h-[180px] w-full bg-gray-200" />
      </ProductCardImage>
      <ProductCardBadge>On sale</ProductCardBadge>
      <ProductCardInfo>
        <ProductCardInfoBrandName>Nike</ProductCardInfoBrandName>
        <ProductCardInfoProductName>
          <a href="/">Air Jordans</a>
        </ProductCardInfoProductName>
        <ProductCardInfoPrice>$200</ProductCardInfoPrice>
      </ProductCardInfo>
    </ProductCard>
  ),
};
