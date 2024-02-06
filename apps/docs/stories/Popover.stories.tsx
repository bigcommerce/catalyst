import { Button } from '@bigcommerce/components/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@bigcommerce/components/Popover';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Popover> = {
  component: Popover,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>
        <Button variant="secondary">Open popover</Button>
      </PopoverTrigger>
      <PopoverContent>Place content for the popover here.</PopoverContent>
    </Popover>
  ),
};
