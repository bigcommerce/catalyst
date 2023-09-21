import {
  ProductCard,
  ProductCardActionButton,
  ProductCardActions,
  ProductCardBadge,
  ProductCardImage,
  ProductCardInfo,
  ProductCardInfoBrandName,
  ProductCardInfoPrice,
  ProductCardInfoProductName,
} from '@bigcommerce/reactant/ProductCard';
import { Meta, StoryObj } from '@storybook/react';
import { Scale, ShoppingCart } from 'lucide-react';

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
        <ProductCardActions>
          <ProductCardActionButton>
            <ShoppingCart>
              <title>Add to Cart</title>
            </ShoppingCart>
          </ProductCardActionButton>
          <ProductCardActionButton>
            <Scale>
              <title>Add to Compare</title>
            </Scale>
          </ProductCardActionButton>
        </ProductCardActions>
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
