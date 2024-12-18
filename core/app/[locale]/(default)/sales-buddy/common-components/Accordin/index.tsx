import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useRef, useState } from 'react';

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
      contentgap: string;
      styles: string;
    }
  | {
      accordions: Accordion[];
      className?: string;
      defaultValue?: string[];
      type: 'multiple';
      contentgap: string;
      styles: string;
      titlestyle: string;
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

// const Accordions = ({ accordions, ...props }: Props) => {
//   return (
//     <AccordionPrimitive.Root
//       {...props}
//       className={props.contentgap}
//       defaultValue={props.defaultValue || props.defaultValue}
//     >
//       {accordions.map((accordion, i) => (
//         <AccordionPrimitive.Item
//           key={i}
//           defaultValue={accordions[i].title} // This can be removed if it's not needed
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
//             className={`mt-[10px] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down m-0 overflow-hidden transition-all`}
//           >
//             {accordion.content}
//           </AccordionPrimitive.Content>
//         </AccordionPrimitive.Item>
//       ))}
//     </AccordionPrimitive.Root>
//   );
// };

// export { Accordions };

const Accordions = ({ accordions,styles }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="accordion-collapse" className="w-[460px]" data-accordion="collapse">
      {accordions.map((accordion: { title: string | number }, index: Key | null | undefined) => (
        <div
          key={index}
          className={`${openIndex === index ? 'bg-[#FFFFFF]' : 'bg-[#F3F4F6]'}`}
        >
          <h2
            className={`flex h-[52px] items-center justify-center ${styles} ${openIndex === index ? 'border-b-0' : ''}`}
            id={`accordion-collapse-heading-${index + 1}`}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 font-medium text-gray-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:focus:ring-gray-800"
              onClick={() => toggleAccordion(index)}
              aria-expanded={openIndex === index}
              aria-controls={`accordion-collapse-body-${index + 1}`}
            >
              <span>{accordion.title}</span>
              <svg
                className={`h-4 w-3 shrink-0 transition-transform duration-200 ${
                  openIndex === index ? 'rotate-0' : 'rotate-180'
                }`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="#1C1B1F"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5 5 1 1 5"
                />
              </svg>
            </button>
          </h2>
          <div
            id={`accordion-collapse-body-${index + 1}`}
            className={`${openIndex === index ? 'block' : 'hidden'} p-3 dark:border-gray-700`}
            aria-labelledby={`accordion-collapse-heading-${index + 1}`}
          >
            <div className="mr-5 w-[440px]">{accordion.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export { Accordions };