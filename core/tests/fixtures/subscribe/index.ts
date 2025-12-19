import { Fixture } from '~/tests/fixtures/fixture';

export class SubscribeFixture extends Fixture {
  subscribedEmails: string[] = [];

  trackSubscription(email: string): void {
    this.subscribedEmails.push(email);
  }

  async cleanup(): Promise<void> {
    this.skipIfReadonly();

    await Promise.all(this.subscribedEmails.map((email) => this.api.subscribe.unsubscribe(email)));

    this.subscribedEmails = [];
  }
}
