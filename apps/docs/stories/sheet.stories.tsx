import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
  SheetTrigger,
} from '@bigcommerce/components/sheet';
import type { Meta, StoryObj } from '@storybook/react';

// We need to remove these once we get variant types working with cva
interface StoryProps {
  side: 'top' | 'right' | 'bottom' | 'left';
}

const meta: Meta<StoryProps> = {
  title: 'Sheet',
  tags: ['autodocs'],
  argTypes: {
    side: { control: 'select', options: ['top', 'right', 'bottom', 'left'] },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

const Content = () => (
  <>
    <h3 className="mb-2 text-h5">Categories</h3>

    <ul className="flex flex-col">
      <li>
        <a className="block py-2" href="#gucci">
          Gucci
        </a>
      </li>
      <li>
        <a className="block py-2" href="#versace">
          Versace
        </a>
      </li>
      <li>
        <a className="block py-2" href="#ralph-lauren">
          Ralph Lauren
        </a>
      </li>
    </ul>
  </>
);

export const Basic: Story = {
  args: {
    side: 'left',
  },
  render: ({ side }) => (
    <Sheet>
      <SheetTrigger asChild>
        <button className="mx-auto block rounded-sm border p-2">Open</button>
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetClose />
        </SheetHeader>
        <Content />
      </SheetContent>
    </Sheet>
  ),
};

export const WithOverlay: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <button className="mx-auto block rounded-sm border p-2">Open</button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet w/ Overlay</SheetTitle>
          <SheetClose />
        </SheetHeader>
        <p>
          The overlay can add a backdrop to the sheet to obfuscate the view to the user interface.
        </p>
      </SheetContent>
      <SheetOverlay />
    </Sheet>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <button className="mx-auto block rounded-sm border p-2">Open</button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Sheet w/ Footer</SheetTitle>
          <SheetClose />
        </SheetHeader>
        <p>The footer allows you to pass add custom actions and controls.</p>
        <SheetFooter>
          <SheetClose asChild>
            <button className="rounded-sm border p-2">Apply</button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
