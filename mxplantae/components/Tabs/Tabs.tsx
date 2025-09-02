'use client'

import { Ref, forwardRef } from 'react'

import * as RadixTabs from '@radix-ui/react-tabs'
import clsx from 'clsx'

type Tab = {
  title?: string
  code?: string
  children?: React.ReactNode
}

type Props = {
  className?: string
  tabs: Tab[]
  ariaLabel?: string
}

export const Tabs = forwardRef(function Tabs(
  { className, tabs, ariaLabel = 'Tabs' }: Props,
  ref: Ref<HTMLDivElement>
) {
  return (
    <RadixTabs.Root ref={ref} className={clsx('flex flex-col', className)} defaultValue="0">
      {tabs.length > 0 ? (
        <>
          <RadixTabs.List className="flex shrink-0 overflow-hidden" aria-label={ariaLabel}>
            {tabs?.map((tab, index) => (
              <RadixTabs.Trigger
                key={index}
                className="border-gray-light/30 text-gray-light data-[state=active]:text-gray-dark relative flex grow select-none items-center justify-center border-b-2 px-3 pb-2 pt-1 text-lg font-bold outline-none transition-colors duration-300 ease-in-out data-[state=active]:border-[#f39a67]"
                value={index.toString()}
              >
                {tab.title}
              </RadixTabs.Trigger>
            ))}
          </RadixTabs.List>
          {tabs.map((tab, index) => (
            <RadixTabs.Content key={index} className="outline-none " value={index.toString()}>
              {tab.children}
            </RadixTabs.Content>
          ))}
        </>
      ) : (
        <div className="p-6 text-center text-lg font-light">
          There are no tabs. Try adding some.
        </div>
      )}
    </RadixTabs.Root>
  )
})

export default Tabs
