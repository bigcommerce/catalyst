import { faker } from '@faker-js/faker';

import { Fixture } from '~/tests/fixtures/fixture';
import { CreateWebPageData, WebPage } from '~/tests/fixtures/utils/api/webpages';

export class WebPageFixture extends Fixture {
  webPages: WebPage[] = [];

  getById(id: number): Promise<WebPage> {
    return this.api.webPages.getById(id);
  }

  async create(data?: Partial<CreateWebPageData>): Promise<WebPage> {
    this.skipIfReadonly();

    const webPage = await this.api.webPages.create(this.fakeCreatePageData(data));

    this.webPages.push(webPage);

    return webPage;
  }

  async cleanup() {
    await this.api.webPages.delete(this.webPages.map(({ id }) => id));
  }

  private fakeCreatePageData(data?: Partial<CreateWebPageData>): CreateWebPageData {
    return {
      parentId: 0,
      name: `Catalyst Test Page ${faker.string.alpha(5)}`,
      type: 'page',
      body: faker.lorem.paragraphs({ min: 1, max: 5 }),
      isVisibleInNavigation: true,
      isCustomersOnly: false,
      ...data,
    };
  }
}
