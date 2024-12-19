'use client';

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type PropsWithChildren,
  type Ref,
  useContext,
} from 'react';

import { useStreamable } from '@/vibes/soul/lib/streamable';
import { Footer } from '@/vibes/soul/sections/footer';

import { mergeSections } from '../../utils/merge-sections';

type Props = ComponentPropsWithoutRef<typeof Footer>;

interface MakeswiftSection {
  heading?: string;
  links: Array<{
    text: string;
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
      logo,
      sections,
      copyright,
    }: {
      logo?: {
        show: boolean;
        src?: string;
        width?: number;
        alt: string;
      };
      sections: MakeswiftSection[];
      copyright: string;
    },
    ref: Ref<HTMLDivElement>,
  ) => {
    const passedProps = useContext(PropsContext);
    const passedSections = useStreamable(passedProps.sections);

    return (
      <Footer
        logo={logo?.src && logo.show ? { src: logo.src, alt: logo.alt } : undefined}
        logoWidth={logo?.width}
        ref={ref}
        {...{
          ...passedProps,
          sections: mergeSections(
            passedSections,
            sections.map(({ heading, links }) => ({
              title: heading,
              links: links.map(({ text, link }) => ({ label: text, href: link.href })),
            })),
            (left, right) => ({ ...left, links: [...left.links, ...right.links] }),
          ),
        }}
        copyright={copyright}
      />
    );
  },
);
