import { ResultOf } from 'gql.tada';

import { HeaderFragment } from '~/components/header';

export const headerLinksTransformer = (data: ResultOf<typeof HeaderFragment>['categoryTree']) =>
  data.map(({ name, path, children }) => ({
    label: name,
    href: path,
    groups: children.map((firstChild) => ({
      label: firstChild.name,
      href: firstChild.path,
      links: firstChild.children.map((secondChild) => ({
        label: secondChild.name,
        href: secondChild.path,
      })),
    })),
  }));
