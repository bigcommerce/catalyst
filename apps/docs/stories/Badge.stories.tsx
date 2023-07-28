import { Badge, BadgeProps } from '@bigcommerce/reactant/Badge';
import type { Meta, StoryObj } from '@storybook/react';
import { ShoppingCart } from 'lucide-react';

const meta: Meta<typeof Badge> = {
  component: Badge,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const BasicExample: Story = {
  args: {
    children: 12,
  },
  render: ({ children }: BadgeProps) => (
    <div className="min-h-6 min-w-6 relative mt-3 inline-block p-3" role="status">
      <Badge>{children}</Badge>
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    children: 3,
  },
  render: ({ children }: BadgeProps) => (
    <div className="min-h-6 min-w-6 relative mt-3 inline-block p-3" role="status">
      <ShoppingCart aria-label="Shopping cart" />
      <Badge>{children}</Badge>
    </div>
  ),
};
