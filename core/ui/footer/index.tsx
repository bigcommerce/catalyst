import { type Streamable } from '@/vibes/soul/lib/streamable';

interface Link {
  href: string;
  label: string;
}

export interface Section {
  title?: string;
  links: Link[];
}

export interface FooterData {
  sections: Streamable<Section[]>;
}

export { Footer } from '@/vibes/soul/sections/footer';
