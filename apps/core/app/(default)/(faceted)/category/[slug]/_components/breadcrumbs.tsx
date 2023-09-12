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
  }>;
  category: string;
}

export const Breadcrumbs = ({ breadcrumbs, category }: Props) => (
  <ReactantBreadcrumbs className="py-4">
    {breadcrumbs.map(({ name, entityId }, index, arr) => {
      if (arr.length - 1 === index) {
        return (
          <BreadcrumbItem asChild isActive={category === name} key={entityId}>
            <Link href={`/category/${entityId}`}>{name}</Link>
          </BreadcrumbItem>
        );
      }

      return (
        <Fragment key={entityId}>
          <BreadcrumbItem asChild isActive={category === name}>
            <Link href={`/category/${entityId}`}>{name}</Link>
          </BreadcrumbItem>
          <BreadcrumbDivider>
            <ChevronRight aria-hidden="true" size={16} />
          </BreadcrumbDivider>
        </Fragment>
      );
    })}
  </ReactantBreadcrumbs>
);
