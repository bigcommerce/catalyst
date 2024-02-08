import { getWebPages } from '~/client/queries/get-web-pages';

import { BaseFooterMenu } from '../footer-menus';

export const WebPageFooterMenu = async () => {
  const storeWebPages = await getWebPages();

  const items = storeWebPages.map((page) => ({
    name: page.name,
    path: page.__typename === 'ExternalLinkPage' ? page.link : page.path,
  }));

  if (!items.length) {
    return null;
  }

  return <BaseFooterMenu items={items} title="Navigate" />;
};
