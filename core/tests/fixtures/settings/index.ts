import { Fixture } from '~/tests/fixtures/fixture';
import { InventorySettings } from '~/tests/fixtures/utils/api/settings';

export class SettingsFixture extends Fixture {
  private initialInventorySettings: InventorySettings | null = null;

  async getInventorySettings(): Promise<InventorySettings> {
    const settings = await this.api.settings.getInventorySettings();

    return settings;
  }

  async setInventorySettings(settings: InventorySettings): Promise<void> {
    if (!this.initialInventorySettings) {
      this.initialInventorySettings = await this.getInventorySettings();
    }

    await this.api.settings.setInventorySettings(settings);
  }

  async cleanup() {
    if (this.initialInventorySettings) {
      await this.api.settings.setInventorySettings(this.initialInventorySettings);
    }
  }
}
