/* eslint-disable no-console */
import { z } from 'zod';

import { httpClient } from '../client';

import { AdjustInventoryItem, BackorderMessage, BackorderSettingsItem, InventoryApi } from '.';

const BackorderMessageSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    message: z.string(),
    isDefault: z.boolean(),
  })
  .transform(
    (data): BackorderMessage => ({
      id: data.id,
      numericId: parseBackorderMessageId(data.id),
      name: data.name,
      message: data.message,
      isDefault: data.isDefault,
    }),
  );

function parseBackorderMessageId(opaqueId: string): number {
  const match = /\d+$/.exec(opaqueId);

  if (!match) {
    throw new Error(`Cannot parse numeric ID from backorder message ID: ${opaqueId}`);
  }

  return Number(match[0]);
}

const GraphqlResponseSchema = z.object({
  data: z.record(z.unknown()).nullable(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

async function adminGraphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const operationMatch = /(?:mutation|query)\s+(\w+)/.exec(query);
  const operationName = operationMatch?.[1] ?? 'unknown';

  console.log(`[adminGraphql] ${operationName} variables:`, JSON.stringify(variables, null, 2));

  const parsed = await httpClient
    .post('/graphql', { query, variables })
    .parse(GraphqlResponseSchema);

  console.log(`[adminGraphql] ${operationName} response:`, JSON.stringify(parsed, null, 2));

  if (parsed.errors?.length) {
    throw new Error(`Admin GraphQL error: ${parsed.errors.map((e) => e.message).join(', ')}`);
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return parsed.data as T;
}

const CREATE_BACKORDER_MESSAGES = `
  mutation CreateBackorderMessages($input: CreateBackorderMessagesInput!) {
    inventory {
      createBackorderMessages(input: $input) {
        errors {
          errorDetails { fieldName, errorMessage, errorCode }
        }
      }
    }
  }
`;

const GET_BACKORDER_MESSAGES = `
  query GetBackorderMessages($filters: GetBackorderMessagesFiltersInput) {
    store {
      inventory {
        backorderMessages(filters: $filters) {
          messages { id, name, message, isDefault }
        }
      }
    }
  }
`;

const DELETE_BACKORDER_MESSAGES = `
  mutation DeleteBackorderMessages($filter: DeleteBackorderMessagesFilterInput) {
    inventory {
      deleteBackorderMessages(filter: $filter) {
        errors {
          errorDetails { fieldName, errorMessage, errorCode }
        }
      }
    }
  }
`;

interface GetBackorderMessagesResponse {
  store: {
    inventory: {
      backorderMessages: {
        messages: Array<{ id: string; name: string; message: string; isDefault: boolean }>;
      };
    };
  };
}

export const inventoryHttpClient: InventoryApi = {
  adjustAbsoluteLevel: async (items: AdjustInventoryItem[]): Promise<void> => {
    const body = {
      items: items.map((item) => ({
        product_id: item.productId,
        ...(item.variantId != null ? { variant_id: item.variantId } : {}),
        location_id: item.locationId,
        quantity: item.quantity,
      })),
      reason: 'Automated test adjustment',
    };

    console.log(
      '[inventory] PUT /v3/inventory/adjustments/absolute body:',
      JSON.stringify(body, null, 2),
    );
    await httpClient.put('/v3/inventory/adjustments/absolute', body);
    console.log('[inventory] PUT /v3/inventory/adjustments/absolute succeeded');
  },

  configureLocationItems: async (
    locationId: number,
    settings: BackorderSettingsItem[],
  ): Promise<void> => {
    const body = {
      settings: settings.map((item) => ({
        identity: {
          product_id: item.productId,
          ...(item.variantId != null ? { variant_id: item.variantId } : {}),
        },
        ...(item.backorderLimit !== undefined ? { backorder_limit: item.backorderLimit } : {}),
        ...(item.backorderMessageId !== undefined
          ? { backorder_message_id: item.backorderMessageId }
          : {}),
      })),
    };

    console.log(
      `[inventory] PUT /v3/inventory/locations/${locationId}/items body:`,
      JSON.stringify(body, null, 2),
    );
    await httpClient.put(`/v3/inventory/locations/${locationId}/items`, body);
    console.log(`[inventory] PUT /v3/inventory/locations/${locationId}/items succeeded`);
  },

  createBackorderMessages: async (
    messages: Array<{ name: string; message: string; isDefault?: boolean }>,
  ): Promise<BackorderMessage[]> => {
    await adminGraphql(CREATE_BACKORDER_MESSAGES, {
      input: { messages },
    });

    const names = messages.map((m) => m.name);
    const data = await adminGraphql<GetBackorderMessagesResponse>(GET_BACKORDER_MESSAGES, {
      filters: { names },
    });

    return data.store.inventory.backorderMessages.messages.map((m) =>
      BackorderMessageSchema.parse(m),
    );
  },

  getBackorderMessagesByNames: async (names: string[]): Promise<BackorderMessage[]> => {
    const data = await adminGraphql<GetBackorderMessagesResponse>(GET_BACKORDER_MESSAGES, {
      filters: { names },
    });

    return data.store.inventory.backorderMessages.messages.map((m) =>
      BackorderMessageSchema.parse(m),
    );
  },

  deleteBackorderMessages: async (messageIds: string[]): Promise<void> => {
    if (messageIds.length === 0) {
      return;
    }

    await adminGraphql(DELETE_BACKORDER_MESSAGES, {
      filter: { messageIds },
    });
  },
};
