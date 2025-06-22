import { Checkbox, Select, Slot, Style } from '@makeswift/runtime/controls';
import clsx from 'clsx';

import { runtime } from '~/lib/makeswift/runtime';

const itemsPerRowClasses = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-2',
  '3': 'grid-cols-3',
  '4': 'grid-cols-4',
};

export function SectionLayout({
  className,
  children,
  containerSize = '2xl',
  hideOverflow = false,
  itemsPerRowDesktop = '4',
  itemsPerRowTablet = '2',
  itemsPerRowMobile = '1',
}: {
  className?: string;
  children: React.ReactNode;
  containerSize?: 'md' | 'lg' | 'xl' | '2xl';
  hideOverflow?: boolean;
  itemsPerRowDesktop: string;
  itemsPerRowTablet: string;
  itemsPerRowMobile: string;
}) {
  const gridClassNames = clsx(
    'grid',
    // @ts-ignore
    itemsPerRowClasses[itemsPerRowMobile], // mobile-first default
    // @ts-ignore
    `sm:${itemsPerRowClasses[itemsPerRowTablet]}`, // tablet (sm breakpoint)
    // @ts-ignore
    `lg:${itemsPerRowClasses[itemsPerRowDesktop]}`, // desktop (lg breakpoint)
  );

  return (
    <section className={clsx('@container', hideOverflow && 'overflow-hidden', className)}>
      <div
        className={clsx(
          'mx-auto px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20',
          {
            md: 'max-w-[var(--section-max-width-md,768px)]',
            lg: 'max-w-[var(--section-max-width-lg,1024px)]',
            xl: 'max-w-[var(--section-max-width-xl,1280px)]',
            '2xl': 'max-w-[var(--section-max-width-2xl,1536px)]',
          }[containerSize],
        )}
      >
        <div className={gridClassNames}>{children}</div>
      </div>
    </section>
  );
}

runtime.registerComponent(SectionLayout, {
  type: 'layouts-section-git',
  label: 'GIT / Section (GIT)',
  icon: 'layout',
  props: {
    className: Style({ properties: [...Style.Default, Style.Border] }),
    children: Slot(),
    containerSize: Select({
      label: 'Container size',
      options: [
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
        { value: 'xl', label: 'XL' },
        { value: '2xl', label: '2XL' },
      ],
      defaultValue: '2xl',
    }),
    itemsPerRowDesktop: Select({
      label: 'Items per row (desktop)',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
      ],
      defaultValue: '4',
    }),
    itemsPerRowTablet: Select({
      label: 'Items per row (tablet)',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
      ],
      defaultValue: '2',
    }),
    itemsPerRowMobile: Select({
      label: 'Items per row (mobile)',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
      ],
      defaultValue: '1',
    }),
    hideOverflow: Checkbox({
      label: 'Hide overflow',
      defaultValue: false,
    }),
  },
});
