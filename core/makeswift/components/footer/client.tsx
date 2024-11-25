'use client';

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type PropsWithChildren,
  type Ref,
  useContext,
} from 'react';

import { Footer } from '@/vibes/soul/sections/footer';
import { mergeSections } from '~/makeswift/lib/merge-sections';

type Props = ComponentPropsWithoutRef<typeof Footer>;

interface MakeswiftSection {
  title?: string;
  links: Array<{
    label: string;
    link: { href: string };
  }>;
}

const PropsContext = createContext<Props>({
  sections: [],
});

export const PropsContextProvider = ({ value, children }: PropsWithChildren<{ value: Props }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

export const MakeswiftFooter = forwardRef(
  (
    {
      sections,
    }: {
      sections: MakeswiftSection[];
    },
    ref: Ref<HTMLDivElement>,
  ) => {
    const passedProps = useContext(PropsContext);

    return (
      <Footer
        ref={ref}
        {...{
          ...passedProps,
          sections: mergeSections(
            passedProps.sections,
            sections.map(({ title, links }) => ({
              title,
              links: links.map(({ label, link }) => ({ label, href: link.href })),
            })),
            (left, right) => ({ ...left, links: [...left.links, ...right.links] }),
          ),
        }}
      />
    );
  },
);
