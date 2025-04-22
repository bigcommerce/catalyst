import { type Streamable } from '@/vibes/soul/lib/streamable';

export interface Breadcrumb {
  label: string;
  href: string;
}

export interface BreadcrumbsData {
  breadcrumbs: Streamable<Breadcrumb[]>;
}

export { Breadcrumbs } from '@/vibes/soul/sections/breadcrumbs';
