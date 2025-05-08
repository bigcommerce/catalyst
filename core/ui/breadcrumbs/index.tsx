import { type Streamable } from '@/vibes/soul/lib/streamable';

interface Breadcrumb {
  label: string;
  href: string;
}

export interface BreadcrumbsData {
  breadcrumbs: Streamable<Breadcrumb[]>;
}
