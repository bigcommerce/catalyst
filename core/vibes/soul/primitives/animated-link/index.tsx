import { Link } from '~/components/link';

import { clsx } from 'clsx';

export type AnimatedLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function AnimatedLink({ href, label, className }: AnimatedLinkProps) {
  return (
    <Link
      href={href}
      className={clsx(
        'origin-left pb-0.5 font-semibold transition-[background-size] duration-500 [background:linear-gradient(0deg,hsl(var(--primary)),hsl(var(--primary)))_no-repeat_left_bottom_/_0_2px] hover:bg-[size:100%_2px] focus:outline-none focus-visible:bg-[size:100%_2px]',
        className,
      )}
    >
      {label}
    </Link>
  );
}
