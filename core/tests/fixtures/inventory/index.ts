import { faker } from '@faker-js/faker';

import { Fixture } from '~/tests/fixtures/fixture';
import { BackorderMessage } from '~/tests/fixtures/utils/api/inventory';

export class InventoryFixture extends Fixture {
  private createdMessageIds: string[] = [];

  async createBackorderMessage(input: {
    name?: string;
    message: string;
    isDefault?: boolean;
  }): Promise<BackorderMessage> {
    this.skipIfReadonly();

    const name = input.name ?? `auto-bo-msg-${faker.string.uuid()}`;
    const messages = await this.api.inventory.createBackorderMessages([
      { name, message: input.message, isDefault: input.isDefault },
    ]);

    const created = messages[0];

    if (!created) {
      throw new Error(`Failed to create backorder message "${name}"`);
    }

    this.createdMessageIds.push(created.id);

    return created;
  }

  async configureProductBackorder(config: {
    productId: number;
    variantId?: number;
    locationId: number;
    backorderLimit: number;
    backorderMessageId: number;
  }): Promise<void> {
    this.skipIfReadonly();

    await this.api.inventory.configureLocationItems(config.locationId, [
      {
        productId: config.productId,
        variantId: config.variantId,
        backorderLimit: config.backorderLimit,
        backorderMessageId: config.backorderMessageId,
      },
    ]);
  }

  async cleanup() {
    await this.api.inventory.deleteBackorderMessages(this.createdMessageIds);
  }
}
