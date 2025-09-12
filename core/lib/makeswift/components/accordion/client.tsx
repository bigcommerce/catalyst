import { Accordion, AccordionItem } from '@/vibes/soul/primitives/accordion';

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

export function MSAccordion({ className, items, colorScheme, type }: MSAccordionsProps) {
  return (
    <Accordion className={className} collapsible={type === 'single' ? true : undefined} type={type}>
      {items.length < 1 && (
        <div className="p-4 text-center text-lg text-gray-400">Add accordion items</div>
      )}
      {items.map(({ title, children }, index) => (
        <AccordionItem colorScheme={colorScheme} key={index} title={title} value={index.toString()}>
          {children}
        </AccordionItem>
      ))}
    </Accordion>
  );
}
