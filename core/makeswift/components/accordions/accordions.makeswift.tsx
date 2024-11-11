import { List, Select, Shape, Slot, Style, TextInput } from '@makeswift/runtime/controls';

import { Accordion, Accordions } from '@/vibes/soul/primitives/accordions';
import { runtime } from '~/lib/makeswift/runtime';

interface MSAccordion {
  title: string;
  children: React.ReactNode;
}

interface MSAccordionsProps {
  className: string;
  accordions: MSAccordion[];
  type: 'single' | 'multiple';
}

runtime.registerComponent(
  function MSAccordions({ className, accordions, type }: MSAccordionsProps) {
    return (
      <Accordions className={className} collapsible type={type}>
        {accordions.length < 1 && (
          <div className="p-4 text-center text-lg text-gray-400">Add accordions</div>
        )}
        {accordions.map(({ title, children }, index) => (
          <Accordion key={index} title={title} value={index.toString()}>
            {children}
          </Accordion>
        ))}
      </Accordions>
    );
  },
  {
    type: 'primitive-accordions',
    label: 'Basic / Accordions',
    // icon: "accordion", TODO: (drew) add icon
    props: {
      className: Style(),
      accordions: List({
        label: 'Accordions',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: 'Accordion Text' }),
            children: Slot(),
          },
        }),
        getItemLabel(accordion) {
          return accordion?.title || 'Accordion';
        },
      }),
      type: Select({
        label: 'Selection Type',
        options: [
          { value: 'single', label: 'Single' },
          { value: 'multiple', label: 'Multiple' },
        ],
        defaultValue: 'single',
      }),
    },
  },
);
