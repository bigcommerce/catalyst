import { z } from 'zod';

import { httpClient } from '../client';
import { apiResponseSchema } from '../schema';

import { InventorySettings, SettingsApi } from '.';

const InventorySettingsSchema = z
  .object({
    default_out_of_stock_message: z.string(),
    show_out_of_stock_message: z.boolean(),
    stock_level_display: z.enum(['dont_show', 'show', 'show_when_low']).nullable(),
  })
  .transform(
    (data): InventorySettings => ({
      defaultOutOfStockMessage: data.default_out_of_stock_message,
      showOutOfStockMessage: data.show_out_of_stock_message,
      stockLevelDisplay: data.stock_level_display,
    }),
  );

const transformInventorySettingsData = (data: InventorySettings) => ({
  default_out_of_stock_message: data.defaultOutOfStockMessage,
  show_out_of_stock_message: data.showOutOfStockMessage,
  stock_level_display: data.stockLevelDisplay,
});

export const settingsHttpClient: SettingsApi = {
  getInventorySettings: async (): Promise<InventorySettings> => {
    const resp = await httpClient
      .get(`/v3/settings/inventory`)
      .parse(apiResponseSchema(InventorySettingsSchema));

    return resp.data;
  },
  setInventorySettings: async (settings: InventorySettings): Promise<void> => {
    await httpClient.put(`/v3/settings/inventory`, transformInventorySettingsData(settings));
  },
};
