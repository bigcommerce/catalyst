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
      contentGap: string;
      styles: string;
    }
  | {
      accordions: Accordion[];
      className?: string;
      defaultValue?: string[];
      type: 'multiple';
      contentGap: string;
      styles: string;
      titlestyle:string
    };

// const Accordions = ({ accordions, ...props }: Props) => {
//   return (
//     <AccordionPrimitive.Root {...props} className={props.contentGap} defaultValue={props.defaultValue}>
//       {accordions.map((accordion, i) => (
//         <AccordionPrimitive.Item
//           key={i}
//           defaultValue={accordions[i]}
//           className={props.styles}
//           value={accordion.title}
//         >
//           <AccordionPrimitive.Header className={`flex ${props.titlestyle}`}>
//             <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between py-[9.5px] text-lg font-bold outline-none transition-all focus-visible:text-secondary [&[data-state=open]>svg]:rotate-180">
//               {accordion.title}
//               <ChevronDown className="h-6 w-6 shrink-0 transition-transform duration-200" />
//             </AccordionPrimitive.Trigger>
//           </AccordionPrimitive.Header>
//           <AccordionPrimitive.Content
//             className={`data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down m-0 overflow-hidden transition-all`}
//           >
//             {accordion.content}
//           </AccordionPrimitive.Content>
//         </AccordionPrimitive.Item>
//       ))}
//     </AccordionPrimitive.Root>
//   );
// };

const Accordions = ({ accordions, ...props }: Props) => {
  return (
    <AccordionPrimitive.Root
      {...props}
      className={props.contentGap}
      defaultValue={props.defaultValue || props.defaultValue}
    >
      {accordions.map((accordion, i) => (
        <AccordionPrimitive.Item
          key={i}
          defaultValue={accordions[i].title} // This can be removed if it's not needed
          className={props.styles}
          value={accordion.title}
        >
          <AccordionPrimitive.Header className={`flex ${props.titlestyle}`}>
            <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between py-[9.5px] text-lg font-bold outline-none transition-all focus-visible:text-secondary [&[data-state=open]>svg]:rotate-180">
              {accordion.title}
              <ChevronDown className="h-6 w-6 shrink-0 transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content
            className={`mt-[10px] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down m-0 overflow-hidden transition-all`}
          >
            {accordion.content}
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
};

export { Accordions };
