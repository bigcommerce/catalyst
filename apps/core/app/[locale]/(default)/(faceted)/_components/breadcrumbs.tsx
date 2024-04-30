import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

import { Link } from '~/components/link';
import {
  BreadcrumbDivider,
  BreadcrumbItem,
  Breadcrumbs as ComponentsBreadcrumbs,
} from '~/components/ui/breadcrumbs';

interface Props {
  breadcrumbs: Array<{
    name: string;
    entityId: number;
    path: string | null;
  }>;
  category: string;
}

export const Breadcrumbs = ({ breadcrumbs, category }: Props) => (
  <ComponentsBreadcrumbs className="py-4">
    {breadcrumbs.map(({ name, entityId, path }, index) => {
      if (!path || breadcrumbs.length - 1 === index) {
        return (
          <BreadcrumbItem className="font-extrabold" isActive={category === name} key={entityId}>
            {name}
          </BreadcrumbItem>
        );
      }

      return (
        <Fragment key={entityId}>
          <BreadcrumbItem asChild isActive={category === name}>
            <Link href={path}>{name}</Link>
          </BreadcrumbItem>
          <BreadcrumbDivider>
            <ChevronRight aria-hidden="true" size={16} />
          </BreadcrumbDivider>
        </Fragment>
      );
    })}
  </ComponentsBreadcrumbs>
);
