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

type Props = ComponentPropsWithoutRef<typeof Footer>;
type Section = Props['sections'][number];

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

const mergeSections = (defaultSections: Section[], sections: Section[]): Section[] => {
  const defaultSectionKeys = new Set(defaultSections.map((section) => section.title));
  const sectionsMap = new Map(sections.map(({ title, links }) => [title, links]));

  return [
    ...defaultSections.map((section) => ({
      ...section,
      links: [...section.links, ...(sectionsMap.get(section.title ?? '') ?? [])],
    })),
    ...sections.filter((section) => !defaultSectionKeys.has(section.title ?? '')),
  ];
};

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
          ),
        }}
      />
    );
  },
);
