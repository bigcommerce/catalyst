export interface InventorySettings {
  readonly defaultOutOfStockMessage?: string;
  readonly showOutOfStockMessage?: boolean;
  readonly stockLevelDisplay?: 'dont_show' | 'show' | 'show_when_low' | null;
  readonly showBackorderAvailabilityPrompt?: boolean;
  readonly backorderAvailabilityPrompt?: string;
  readonly showBackorderMessage?: boolean;
  readonly showQuantityOnBackorder?: boolean;
  readonly showQuantityOnHand?: boolean;
}

export interface SettingsApi {
  getInventorySettings: () => Promise<InventorySettings>;
  setInventorySettings: (settings: InventorySettings) => Promise<void>;
}

export { settingsHttpClient } from './http';
