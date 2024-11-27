import clsx from 'clsx';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { ComponentRef, forwardRef, lazy, Suspense, useMemo } from 'react';

export type IconName = keyof typeof dynamicIconImports;

// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const IconNames = Object.keys(dynamicIconImports) as IconName[];

type IconProps = Omit<LucideProps, 'ref'> & { name: IconName };

export const Icon = forwardRef<ComponentRef<'svg'>, IconProps>(
  ({ className, name, size = 24, ...props }, ref) => {
    const LucideIcon = useMemo(() => lazy(dynamicIconImports[name]), [name]);

    return (
      <Suspense
        fallback={
          <div
            className={clsx('animate-pulse rounded-full bg-contrast-100', className)}
            style={{ width: size, height: size }}
          />
        }
      >
        <LucideIcon ref={ref} {...props} className={className} size={size} />
      </Suspense>
    );
  },
);

export default Icon;
