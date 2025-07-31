import { Card, CardProps } from '@/vibes/soul/primitives/card';

type MSCardProps = Omit<CardProps, 'href' | 'image'> & {
  link?: { href?: string; target?: string };
  imageSrc?: string;
  imageAlt: string;
};

export function MSCard({ link, imageSrc, imageAlt, ...props }: MSCardProps) {
  return (
    <Card
      {...props}
      href={link?.href ?? ''}
      image={imageSrc ? { src: imageSrc, alt: imageAlt } : undefined}
    />
  );
}
