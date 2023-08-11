import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@bigcommerce/reactant/Accordion';
import type { Meta, StoryObj } from '@storybook/react';
import { Info } from 'lucide-react';

const meta: Meta<typeof Accordion> = {
  component: Accordion,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Accordion>;

export const BasicExample: Story = {
  render: () => (
    <Accordion className="w-full" defaultValue={['brand', 'size']} type="multiple">
      <AccordionItem value="brand">
        <AccordionTrigger>Brand</AccordionTrigger>
        <AccordionContent>
          <ul className="list-inside list-disc">
            <li>Gucci</li>
            <li>Versace</li>
            <li>Ralph Lauren</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="size">
        <AccordionTrigger>Size</AccordionTrigger>
        <AccordionContent>
          <ul className="list-inside list-disc">
            <li>Small</li>
            <li>Medium</li>
            <li>Large</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="rating">
        <AccordionTrigger>Rating</AccordionTrigger>
        <AccordionContent>
          <ul className="list-inside list-disc">
            <li>Good</li>
            <li>Neutral</li>
            <li>Bad</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithComponentExample: Story = {
  render: () => (
    <Accordion className="w-full" collapsible type="single">
      <AccordionItem value="rating">
        <AccordionTrigger>
          <div className="flex flex-row items-center gap-2">
            <Info />
            <span className="ml-2">Information</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-4">
          This product is made from 100% cotton and is machine washable.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
