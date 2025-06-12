import { Group, List, Select, Slot, Style, TextInput } from '@makeswift/runtime/controls';

import { Accordion, AccordionItem } from '@/vibes/soul/primitives/accordion';
import { runtime } from '~/lib/makeswift/runtime';

interface MSAccordionItem {
  title: string;
  children: React.ReactNode;
}

interface MSAccordionsProps {
  className: string;
  type: 'single' | 'multiple';
  colorScheme: 'light' | 'dark';
  items: MSAccordionItem[];
}

runtime.registerComponent(
  function MSAccordion({ className, items, colorScheme, type }: MSAccordionsProps) {
    return (
      <Accordion
        className={className}
        collapsible={type === 'single' ? true : undefined}
        type={type}
      >
        {items.length < 1 && (
          <div className="p-4 text-center text-lg text-gray-400">Add accordion items</div>
        )}
        {items.map(({ title, children }, index) => (
          <AccordionItem
            colorScheme={colorScheme}
            key={index}
            title={title}
            value={index.toString()}
          >
            {children}
          </AccordionItem>
        ))}
      </Accordion>
    );
  },
  {
    type: 'primitive-accordions',
    label: 'Basic / Accordion',
    icon: 'carousel',
    props: {
      className: Style(),
      items: List({
        label: 'Items',
        type: Group({
          label: 'Accordion item',
          props: {
            title: TextInput({ label: 'Title', defaultValue: 'This is an item title' }),
            children: Slot(),
          },
        }),
        getItemLabel(accordion) {
          return accordion?.title || 'Untitled item';
        },
      }),
      type: Select({
        label: 'Selection type',
        options: [
          { value: 'single', label: 'Single' },
          { value: 'multiple', label: 'Multiple' },
        ],
        defaultValue: 'multiple',
      }),
      colorScheme: Select({
        label: 'Color scheme',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ],
        defaultValue: 'light',
      }),
    },
  },
);
