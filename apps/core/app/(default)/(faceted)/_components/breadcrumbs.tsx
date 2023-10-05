import {
  BreadcrumbDivider,
  BreadcrumbItem,
  Breadcrumbs as ReactantBreadcrumbs,
} from '@bigcommerce/reactant/Breadcrumbs';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Fragment } from 'react';

interface Props {
  breadcrumbs: Array<{
    name: string;
    entityId: number;
    path: string | null;
  }>;
  category: string;
}

export const Breadcrumbs = ({ breadcrumbs, category }: Props) => (
  <ReactantBreadcrumbs className="py-4">
    {breadcrumbs.map(({ name, entityId, path }, index) => {
      if (!path || breadcrumbs.length - 1 === index) {
        return (
          <BreadcrumbItem isActive={category === name} key={entityId}>
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
  </ReactantBreadcrumbs>
);
