/* eslint-disable no-console */
import { z } from 'zod';

import { httpClient } from '../client';
import { apiResponseSchema } from '../schema';

import { InventorySettings, SettingsApi } from '.';

const InventorySettingsSchema = z
  .object({
    default_out_of_stock_message: z.string(),
    show_out_of_stock_message: z.boolean(),
    stock_level_display: z.enum(['dont_show', 'show', 'show_when_low']).nullable(),
    show_backorder_availability_prompt: z.boolean().optional(),
    backorder_availability_prompt: z.string().optional(),
    show_backorder_message: z.boolean().optional(),
    show_quantity_on_backorder: z.boolean().optional(),
    show_quantity_on_hand: z.boolean().optional(),
  })
  .transform(
    (data): InventorySettings => ({
      defaultOutOfStockMessage: data.default_out_of_stock_message,
      showOutOfStockMessage: data.show_out_of_stock_message,
      stockLevelDisplay: data.stock_level_display,
      showBackorderAvailabilityPrompt: data.show_backorder_availability_prompt,
      backorderAvailabilityPrompt: data.backorder_availability_prompt,
      showBackorderMessage: data.show_backorder_message,
      showQuantityOnBackorder: data.show_quantity_on_backorder,
      showQuantityOnHand: data.show_quantity_on_hand,
    }),
  );

const transformInventorySettingsData = (data: InventorySettings) => ({
  default_out_of_stock_message: data.defaultOutOfStockMessage,
  show_out_of_stock_message: data.showOutOfStockMessage,
  stock_level_display: data.stockLevelDisplay,
  show_backorder_availability_prompt: data.showBackorderAvailabilityPrompt,
  backorder_availability_prompt: data.backorderAvailabilityPrompt,
  show_backorder_message: data.showBackorderMessage,
  show_quantity_on_backorder: data.showQuantityOnBackorder,
  show_quantity_on_hand: data.showQuantityOnHand,
});

export const settingsHttpClient: SettingsApi = {
  getInventorySettings: async (): Promise<InventorySettings> => {
    const resp = await httpClient
      .get(`/v3/settings/inventory`)
      .parse(apiResponseSchema(InventorySettingsSchema));

    return resp.data;
  },
  setInventorySettings: async (settings: InventorySettings): Promise<void> => {
    const body = transformInventorySettingsData(settings);

    console.log('[settings] PUT /v3/settings/inventory body:', JSON.stringify(body, null, 2));
    await httpClient.put(`/v3/settings/inventory`, body);
    console.log('[settings] PUT /v3/settings/inventory succeeded');
  },
};
