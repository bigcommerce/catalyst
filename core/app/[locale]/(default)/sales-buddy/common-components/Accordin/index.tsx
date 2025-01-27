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

const Accordions = ({ accordions, styles, contentCss, toggleAccordion, openIndexes, setOpenIndexes }: { accordions: Accordion[], styles: string, contentCss?: string, toggleAccordion: (index: number) => void, openIndexes: any, setOpenIndexes: any }) => {
  return (
    <div id="accordion-collapse" className="w-[460px]" data-accordion="collapse">
      {accordions.map((accordion, index) => (
        <div
          key={index}
          className={`${openIndexes &&  openIndexes.includes(index) ? 'bg-[#FFFFFF]' : 'bg-[#F3F4F6]'}`}
        >
          <h2
            className={`flex h-[52px] items-center justify-center ${styles} ${openIndexes && openIndexes.includes(index) ? 'border-b-0' : ''}`}
            id={`accordion-collapse-heading-${index + 1}`}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 font-medium text-gray-500"
              onClick={() => toggleAccordion(index)}
              aria-expanded={openIndexes && openIndexes.includes(index)}
              aria-controls={`accordion-collapse-body-${index + 1}`}
            >
              <span>{accordion.title}</span>
              <svg
                className={`h-4 w-3 shrink-0 transition-transform duration-200 ${openIndexes && openIndexes.includes(index) ? 'rotate-0' : 'rotate-180'
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
            className={`${openIndexes && openIndexes.includes(index) ? 'block' : 'hidden'} ${contentCss ? contentCss : 'p-3'}  dark:border-gray-700`}
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