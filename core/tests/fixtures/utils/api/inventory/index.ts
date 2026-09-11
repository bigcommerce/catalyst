export interface BackorderMessage {
  readonly id: string;
  readonly numericId: number;
  readonly name: string;
  readonly message: string;
  readonly isDefault: boolean;
}

export interface AdjustInventoryItem {
  readonly productId: number;
  readonly variantId?: number;
  readonly locationId: number;
  readonly quantity: number;
}

export interface BackorderSettingsItem {
  readonly productId: number;
  readonly variantId?: number;
  readonly backorderLimit?: number | null;
  readonly backorderMessageId?: number | null;
}

export interface InventoryApi {
  adjustAbsoluteLevel: (items: AdjustInventoryItem[]) => Promise<void>;
  configureLocationItems: (locationId: number, settings: BackorderSettingsItem[]) => Promise<void>;
  createBackorderMessages: (
    messages: Array<{ name: string; message: string; isDefault?: boolean }>,
  ) => Promise<BackorderMessage[]>;
  getBackorderMessagesByNames: (names: string[]) => Promise<BackorderMessage[]>;
  deleteBackorderMessages: (messageIds: string[]) => Promise<void>;
}

export { inventoryHttpClient } from './http';
