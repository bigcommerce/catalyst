import { ButtonLink, Props } from '@/vibes/soul/primitives/button-link';

type MSButtonLinkProps = Omit<Props, 'href'> & {
  link: { href?: string; target?: string };
  text: string;
};

export function MSButtonLink({ link, text, ...props }: MSButtonLinkProps) {
  return (
    <ButtonLink href={link.href ?? '#'} target={link.target} {...props}>
      {text}
    </ButtonLink>
  );
}
