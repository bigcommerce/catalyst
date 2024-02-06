import { Calendar } from '@bigcommerce/components/Calendar';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta: Meta<typeof Calendar> = {
  component: Calendar,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Calendar>;

const StoryRender = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);

  return <Calendar mode="single" onSelect={setDate} selected={date} />;
};

export const Single: Story = {
  render: () => <StoryRender />,
};
