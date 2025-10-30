export interface InventorySettings {
  readonly defaultOutOfStockMessage?: string;
  readonly showOutOfStockMessage?: boolean;
  readonly stockLevelDisplay?: 'dont_show' | 'show' | 'show_when_low' | null;
}

export interface SettingsApi {
  getInventorySettings: () => Promise<InventorySettings>;
  setInventorySettings: (settings: InventorySettings) => Promise<void>;
}

export { settingsHttpClient } from './http';
