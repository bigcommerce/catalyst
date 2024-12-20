import { clsx } from 'clsx';

/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --section-max-width-medium: 768px;
 *   --section-max-width-lg: 1024px;
 *   --section-max-width-xl: 1280px;
 *   --section-max-width-2xl: 1536px;
 * }
 * ```
 */
export function StickySidebarLayout({
  className,
  sidebar,
  children,
  sidebarSize = '1/3',
  sidebarPosition = 'before',
  containerSize = '2xl',
}: {
  className?: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  containerSize?: 'md' | 'lg' | 'xl' | '2xl';
  sidebarSize?: '1/4' | '1/3' | '1/2' | 'small' | 'medium' | 'large';
  sidebarPosition?: 'before' | 'after';
}) {
  return (
    <section className={clsx('group/pending @container', className)}>
      <div
        className={clsx(
          'mx-auto flex flex-col items-stretch gap-x-16 gap-y-10 px-4 py-10 @xl:px-6 @xl:py-14 @4xl:flex-row @4xl:px-8 @4xl:py-20',
          {
            md: 'max-w-[var(--section-max-width-md,768px)]',
            lg: 'max-w-[var(--section-max-width-lg,1024px)]',
            xl: 'max-w-[var(--section-max-width-xl,1280px)]',
            '2xl': 'max-w-[var(--section-max-width-2xl,1536px)]',
          }[containerSize],
        )}
      >
        <div
          className={clsx(
            'shrink-0',
            sidebarPosition === 'after' ? 'order-2' : 'order-1',
            {
              '1/3': '@4xl:w-1/3',
              '1/2': '@4xl:w-1/2',
              '1/4': '@4xl:w-1/4',
              small: '@4xl:w-48',
              medium: '@4xl:w-60',
              large: '@4xl:w-80',
            }[sidebarSize],
          )}
        >
          <div className="sticky top-10">{sidebar}</div>
        </div>
        <div
          className={clsx(
            sidebarPosition === 'after' ? 'order-1' : 'order-2',
            {
              '1/3': '@4xl:w-2/3',
              '1/2': '@4xl:w-1/2',
              '1/4': '@4xl:w-3/4',
              small: '@4xl:flex-1',
              medium: '@4xl:flex-1',
              large: '@4xl:flex-1',
            }[sidebarSize],
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
