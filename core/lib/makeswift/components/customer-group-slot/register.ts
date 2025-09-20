import { Combobox, Group, List, Slot, Style } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { CustomerGroupSlot, NO_GROUP_ID } from './client';
import { CustomerGroupsSchema, CustomerGroupsType } from './schema';

async function getAllCustomerGroups(): Promise<CustomerGroupsType | null> {
  const response = await fetch('/api/customer/groups');

  if (!response.ok) {
    if (response.status === 403) {
      // 403 indicates the store-level API token is not configured, which is the default OCC setup
      return null;
    }

    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: unknown = await response.json();
  const groups = CustomerGroupsSchema.parse(data);

  return groups;
}

runtime.registerComponent(CustomerGroupSlot, {
  type: 'catalyst-customer-group-slot',
  label: 'Catalyst / Customer Group Slot',
  props: {
    className: Style(),
    slots: List({
      label: 'Targeted customer groups',
      type: Group({
        label: 'Group',
        props: {
          group: Combobox({
            label: 'Name',
            getOptions: async (query) => {
              try {
                const data = await getAllCustomerGroups();

                if (!data) return [];

                return data
                  .map((d) => ({
                    id: `${d.id}`,
                    label: d.name,
                    value: `${d.id}`,
                  }))
                  .filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
              } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error fetching customer group options:', error);

                return [];
              }
            },
          }),
          slot: Slot(),
        },
      }),
      getItemLabel(item) {
        return item?.group.label ?? 'Unselected group';
      },
    }),
    simulatedGroup: Combobox({
      label: 'Simulated group',
      getOptions: async (query) => {
        try {
          const data = await getAllCustomerGroups();

          if (!data) {
            // nullish data means we don't have access to the customer groups API
            return [
              {
                id: NO_GROUP_ID,
                label: 'Setup needed. See docs.',
                value: NO_GROUP_ID,
              },
            ];
          }

          return [
            {
              id: NO_GROUP_ID,
              label: 'No group',
              value: NO_GROUP_ID,
            },
            ...data
              .map((d) => ({
                id: `${d.id}`,
                label: d.name,
                value: `${d.id}`,
              }))
              .filter((option) => option.label.toLowerCase().includes(query.toLowerCase())),
          ];
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error fetching customer group options:', error);

          return [];
        }
      },
    }),
    noGroupSlot: Slot(),
  },
});
