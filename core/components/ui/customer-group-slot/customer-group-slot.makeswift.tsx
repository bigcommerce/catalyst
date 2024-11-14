import { Combobox, List, Shape, Slot, Style } from '@makeswift/runtime/controls';

import { Customers, CustomersType } from '~/app/api/customer-groups/route';
import { runtime } from '~/lib/makeswift/runtime';

import { CustomerGroupSlot } from './customer-group-slot';

async function fetchData(): Promise<CustomersType> {
  const response = await fetch('/api/customer-groups');
  const data: unknown = await response.json();

  const groups = Customers.parse(data);

  return groups;
}

runtime.registerComponent(CustomerGroupSlot, {
  type: 'catalyst-customer-group-slot',
  label: 'Catalyst / Customer Group Slot',
  props: {
    className: Style(),
    slots: List({
      label: 'Targeted customer groups',
      type: Shape({
        type: {
          group: Combobox({
            label: 'Group',
            getOptions: async () => {
              const data = await fetchData();

              return data.map((d) => ({
                id: `${d.id}`,
                label: d.name,
                value: `${d.id}`,
              }));
            },
          }),
          slot: Slot(),
        },
      }),
      getItemLabel(item) {
        return item?.group?.label ?? 'Unselected group';
      },
    }),
    selectedGroup: Combobox({
      label: 'Selected group for builder',
      getOptions: async () => {
        const data = await fetchData();

        return data
          .map((d) => ({
            id: `${d.id}`,
            label: d.name,
            value: `${d.id}`,
          }))
          .concat({
            id: 'no-group',
            label: 'No group',
            value: 'no-group',
          });
      },
    }),
    noGroupSlot: Slot(),
  },
});
