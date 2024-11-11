import clsx from 'clsx';

export function SectionLayout({
  className,
  children,
  containerSize = '2xl',
}: {
  className?: string;
  children: React.ReactNode;
  containerSize?: 'lg' | 'xl' | '2xl';
}) {
  return (
    <section className={clsx('w-full @container', className)}>
      <div
        className={clsx(
          'mx-auto px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20',
          {
            lg: 'max-w-screen-lg',
            xl: 'max-w-screen-xl',
            '2xl': 'max-w-screen-2xl',
          }[containerSize],
        )}
      >
        {children}
      </div>
    </section>
  );
}
