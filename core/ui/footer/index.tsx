import { type Streamable } from '@/vibes/soul/lib/streamable';

interface Link {
  href: string;
  label: string;
}

interface Section {
  title?: string;
  links: Link[];
}

export interface FooterData {
  sections: Streamable<Section[]>;
}
