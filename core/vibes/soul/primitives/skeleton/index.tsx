import { clsx } from 'clsx';
import { ReactNode } from 'react';

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --skeleton: color-mix(in oklab, hsl(var(--contast-300)), white 75%);
 * }
 * ```
 */
function SkeletonRoot({
  className,
  children,
  pending = false,
}: {
  className?: string;
  children?: React.ReactNode;
  pending?: boolean;
}) {
  return (
    <div
      className={clsx('@container', className)}
      data-pending={pending ? '' : undefined}
      role={pending ? 'status' : undefined}
    >
      {children}
      {pending && <span className="sr-only">Loading...</span>}
    </div>
  );
}

function SkeletonBox({ className }: { className?: string }) {
  return <div className={clsx('bg-[var(--skeleton,hsl(var(--contrast-300)/15%))]', className)} />;
}

function SkeletonText({
  characterCount = 10,
  className,
}: {
  characterCount?: number | 'full';
  className?: string;
}) {
  return (
    <div className={clsx('flex h-[1lh] items-center', className)}>
      <div
        className={clsx(
          `h-[1ex] max-w-full rounded-[inherit] bg-[var(--skeleton,hsl(var(--contrast-300)/15%))]`,
        )}
        style={{ width: characterCount === 'full' ? '100%' : `${characterCount}ch` }}
      />
    </div>
  );
}

function SkeletonIcon({ className, icon }: { className?: string; icon: ReactNode }) {
  return (
    <div className={clsx('text-[var(--skeleton,hsl(var(--contrast-300)))] opacity-25', className)}>
      {icon}
    </div>
  );
}

export { SkeletonIcon as Icon, SkeletonRoot as Root, SkeletonBox as Box, SkeletonText as Text };
