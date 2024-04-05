import { Badge } from '@bigcommerce/components/badge';
import type { Meta, StoryObj } from '@storybook/react';
import { ShoppingCart } from 'lucide-react';

const meta = {
  component: Badge,
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BasicExample: Story = {
  args: {
    children: 12,
  },
  render: ({ children }) => (
    <div className="relative mt-3 inline-block min-h-6 min-w-6 p-3" role="status">
      <Badge>{children}</Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    children: 3,
  },
  render: ({ children }) => (
    <div className="relative mt-3 inline-block min-h-6 min-w-6 p-3" role="status">
      <ShoppingCart aria-label="Shopping cart" />
      <Badge>{children}</Badge>
    </div>
  ),
};
