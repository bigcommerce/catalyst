import { clsx } from 'clsx';

export function StickySidebarLayout({
  className,
  sidebar,
  children,
  sidebarSize = '1/3',
  sidebarPosition = 'left',
  containerSize = '2xl',
}: {
  className?: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  containerSize?: 'lg' | 'xl' | '2xl';
  sidebarSize?: '1/4' | '1/3' | '1/2' | 'small' | 'medium' | 'large';
  sidebarPosition?: 'left' | 'right';
}) {
  return (
    <section className={clsx('@container', className)}>
      <div
        className={clsx(
          'mx-auto flex flex-col items-stretch gap-x-16 gap-y-10 px-4 py-10 @xl:px-6 @xl:py-14 @4xl:flex-row @4xl:px-8 @4xl:py-20',
          {
            lg: 'max-w-screen-lg',
            xl: 'max-w-screen-xl',
            '2xl': 'max-w-screen-2xl',
          }[containerSize],
        )}
      >
        <div
          className={clsx(
            'shrink-0',
            sidebarPosition === 'right' ? 'order-2' : 'order-1',
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
            sidebarPosition === 'right' ? 'order-1' : 'order-2',
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
