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

import { mergeSections } from '../../utils/merge-sections';

type FooterProps = ComponentPropsWithoutRef<typeof Footer>;

// MakeswiftFooter does not support streamable sections
type ContextProps = Omit<FooterProps, 'sections'> & {
  sections: Awaited<FooterProps['sections']>;
};

const PropsContext = createContext<ContextProps>({
  sections: [],
});

export const PropsContextProvider = ({
  value,
  children,
}: PropsWithChildren<{ value: ContextProps }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

interface Props {
  logo: {
    show: boolean;
    src?: string;
    width: number;
    height: number;
    alt: string;
  };
  sections: Array<{
    title: string;
    links: Array<{
      label: string;
      link: { href: string };
    }>;
  }>;
  copyright?: string;
}

function combineSections(
  passedSections: ContextProps['sections'],
  makeswiftSections: Props['sections'],
): ContextProps['sections'] {
  return mergeSections(
    passedSections,
    makeswiftSections.map(({ title, links }) => ({
      title,
      links: links.map(({ label, link }) => ({ label, href: link.href })),
    })),
    (left, right) => ({ ...left, links: [...left.links, ...right.links] }),
  );
}

export const MakeswiftFooter = forwardRef(
  ({ logo, sections, copyright }: Props, ref: Ref<HTMLDivElement>) => {
    const passedProps = useContext(PropsContext);
    const logoObject = logo.src ? { src: logo.src, alt: logo.alt } : passedProps.logo;

    return (
      <Footer
        {...passedProps}
        copyright={copyright ?? passedProps.copyright}
        logo={logo.show ? logoObject : undefined}
        logoHeight={logo.show ? logo.height : 0}
        logoWidth={logo.show ? logo.width : 0}
        ref={ref}
        sections={combineSections([], sections)} //{combineSections(passedProps.sections, sections)}
      />
    );
  },
);
