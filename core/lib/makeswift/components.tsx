import { Select, Style, TextInput } from '@makeswift/runtime/controls';

import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';

import { runtime } from './runtime';

interface LinkButtonProps {
  className?: string;
  variant: 'primary' | 'secondary' | 'subtle';
  href: string;
  buttonText: string;
}

runtime.registerComponent(
  function LinkButton({ className, variant, href, buttonText }: LinkButtonProps) {
    return (
      <Button asChild className={className} variant={variant}>
        <Link href={href}>{buttonText}</Link>
      </Button>
    );
  },
  {
    type: 'catalyst-link-button',
    label: 'Catalyst/Link Button',
    props: {
      className: Style(),
      buttonText: TextInput({ defaultValue: 'Shop All', label: 'Button Text' }),
      variant: Select({
        label: 'Variant',
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'subtle', label: 'Subtle' },
        ],
        defaultValue: 'primary',
      }),
      href: TextInput({ defaultValue: '/shop-all', label: 'Link URL' }),
    },
  },
);
