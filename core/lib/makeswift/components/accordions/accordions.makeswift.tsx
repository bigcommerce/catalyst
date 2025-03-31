import { Group, List, Select, Slot, Style, TextInput } from '@makeswift/runtime/controls';

import { Accordion, AccordionItem } from '@/vibes/soul/primitives/accordion';
import { runtime } from '~/lib/makeswift/runtime';

interface MSAccordion {
  title: string;
  children: React.ReactNode;
}

interface MSAccordionsProps {
  className: string;
  type: 'single' | 'multiple';
  colorScheme: 'light' | 'dark';
  accordions: MSAccordion[];
}

runtime.registerComponent(
  function MSAccordions({ className, accordions, colorScheme, type }: MSAccordionsProps) {
    return (
      <Accordion
        className={className}
        collapsible={type === 'single' ? true : undefined}
        type={type}
      >
        {accordions.length < 1 && (
          <div className="p-4 text-center text-lg text-gray-400">Add accordions</div>
        )}
        {accordions.map(({ title, children }, index) => (
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
    label: 'Basic / Accordions',
    icon: 'carousel',
    props: {
      className: Style(),
      accordions: List({
        label: 'Accordions',
        type: Group({
          label: 'Accordion item',
          props: {
            title: TextInput({ label: 'Title', defaultValue: 'This is an accordion title' }),
            children: Slot(),
          },
        }),
        getItemLabel(accordion) {
          return accordion?.title || 'Accordion';
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
