import { Fixture } from '~/tests/fixtures/fixture';
import { Redirect, UpsertRedirectData } from '~/tests/fixtures/utils/api/redirects';

export class RedirectsFixture extends Fixture {
  redirects: Redirect[] = [];

  async upsertRedirect(data: UpsertRedirectData): Promise<Redirect | undefined> {
    this.skipIfReadonly();

    const redirect = await this.api.redirects.upsert(data);

    if (redirect) {
      this.redirects.push(redirect);
    }

    return redirect;
  }

  async cleanup() {
    await this.api.redirects.delete(this.redirects.map(({ id }) => id));
  }
}
