import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { ReactNode } from 'react';

interface Accordion {
  content: ReactNode;
  title: string;
}

type Props =
  | {
      accordions: Accordion[];
      className?: string;
      defaultValue?: string;
      type: 'single';
    }
  | {
      accordions: Accordion[];
      className?: string;
      defaultValue?: string[];
      type: 'multiple';
    };

const Accordions = ({ accordions, ...props }: Props) => {
  return (
    <AccordionPrimitive.Root {...props}>
      {accordions.map((accordion, i) => (
        <AccordionPrimitive.Item key={i} value={accordion.title}>
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between py-[9.5px] text-lg font-bold outline-none transition-all hover:text-secondary focus-visible:text-secondary [&[data-state=open]>svg]:rotate-180">
              {accordion.title}
              <ChevronDown className="h-6 w-6 shrink-0 transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down mb-4 overflow-hidden transition-all">
            {accordion.content}
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
};

export { Accordions };
