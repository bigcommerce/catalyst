import { clsx } from 'clsx';

// eslint-disable-next-line valid-jsdoc
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
  paddingOptionsLargeDesktop,
  paddingOptionsDesktop,
  paddingOptionsTablet,
  paddingOptionsMobile,
  hideOverflow = false,
}: {
  className?: string;
  children: React.ReactNode;
  containerSize?: 'md' | 'lg' | 'xl' | '2xl';
  hideOverflow?: boolean;
  paddingOptionsLargeDesktop: string;
  paddingOptionsDesktop: string;
  paddingOptionsTablet: string;
  paddingOptionsMobile: string;
}) {
  return (
    <section className={clsx('@container', hideOverflow && 'overflow-hidden', className)}>
      <div
        className={clsx(
          `@4xl:py-${paddingOptionsLargeDesktop} mx-auto px-4 py-${paddingOptionsMobile} @md:py-${paddingOptionsTablet} @xl:px-6 @xl:py-${paddingOptionsDesktop} @4xl:px-8`,
          {
            md: 'max-w-[var(--section-max-width-md,768px)]',
            lg: 'max-w-[var(--section-max-width-lg,1024px)]',
            xl: 'max-w-[var(--section-max-width-xl,1280px)]',
            '2xl': 'max-w-[var(--section-max-width-2xl,1536px)]',
          }[containerSize],
        )}
      >
        {children}
      </div>
    </section>
  );
}
