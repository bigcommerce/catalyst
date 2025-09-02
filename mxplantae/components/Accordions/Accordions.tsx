'use client'

import React, { ReactNode, Ref, forwardRef } from 'react'

import * as Accordion from '@radix-ui/react-accordion'
import clsx from 'clsx'

type AccordionItem = {
  title: ReactNode
  body: ReactNode
}

type Props = {
  className?: string
  accordions: AccordionItem[]
  type: 'single' | 'multiple'
}

export const Accordions = forwardRef(function Accordions(
  { className, accordions, type = 'multiple' }: Props,
  ref: Ref<HTMLUListElement>
) {
  return (
    <Accordion.Root type={type} asChild>
      <ul className={clsx(className, 'w-full space-y-5')} ref={ref}>
        {accordions.length === 0 ? (
          <div className="p-6 text-center text-lg">There are no Accordions. Try adding some.</div>
        ) : (
          accordions.map((accordion, i) => (
            <Accordion.Item key={i} value={`${i + 1}`} asChild>
              <li className="group rounded-xl bg-white py-5 shadow-2xl shadow-black/10">
                <Accordion.Header>
                  <Accordion.Trigger asChild>
                    <div className="flex w-full cursor-pointer items-center gap-x-4 px-5 md:px-10">
                      <div className="text-md flex-1 py-5 text-left font-bold leading-normal text-gray-900 md:text-lg">
                        {accordion.title}
                      </div>

                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-5 w-5 fill-gray-300"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="9"
                          className="h-5 w-0.5 origin-center transition-transform duration-300 group-data-[state=open]:rotate-90"
                        />
                        <rect y="9" className="h-0.5 w-5" />
                      </svg>
                    </div>
                  </Accordion.Trigger>
                </Accordion.Header>

                <Accordion.Content className="w-full overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
                  <div className="text-md px-5 pb-1 leading-relaxed text-gray-900 md:px-10 md:pb-3">
                    {accordion.body}
                  </div>
                </Accordion.Content>
              </li>
            </Accordion.Item>
          ))
        )}
      </ul>
    </Accordion.Root>
  )
})

export default Accordions
