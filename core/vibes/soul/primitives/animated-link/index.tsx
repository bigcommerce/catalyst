import { clsx } from 'clsx';

import { Link } from '~/components/link';

export interface AnimatedLinkProps {
  link: {
    href: string;
    target?: string;
  };
  label: string;
  className?: string;
}

export function AnimatedLink({ link, label, className }: AnimatedLinkProps) {
  return (
    <Link
      className={clsx(
        'origin-left pb-0.5 font-semibold transition-[background-size] duration-300 [background:linear-gradient(0deg,hsl(var(--primary)),hsl(var(--primary)))_no-repeat_left_bottom_/_0_2px] hover:bg-[size:100%_2px] focus:outline-none focus-visible:bg-[size:100%_2px]',
        className,
      )}
      href={link.href}
    >
      {label}
    </Link>
  );
}
