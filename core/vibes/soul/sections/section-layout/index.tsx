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
export function SectionLayout({
  className,
  children,
  containerSize = '2xl',
}: {
  className?: string;
  children: React.ReactNode;
  containerSize?: 'md' | 'lg' | 'xl' | '2xl';
}) {
  return (
    <section className={clsx('@container', className)}>
      <div
        className={clsx(
          'mx-auto px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20',
          {
            md: 'max-w-screen-[var(--section-max-width-md,768px)]',
            lg: 'max-w-screen-[var(--section-max-width-lg,1024px)]',
            xl: 'max-w-screen-[var(--section-max-width-xl,1280px)]',
            '2xl': 'max-w-screen-[var(--section-max-width-2xl,1536px)]',
          }[containerSize],
        )}
      >
        {children}
      </div>
    </section>
  );
}
