'use client';

import { Combobox, Group, List, Slot, Style } from '@makeswift/runtime/controls';
import { useIsInBuilder } from '@makeswift/runtime/react';
import { clsx } from 'clsx';
import { ReactNode } from 'react';
import useSWR from 'swr';

import { GetCustomerGroupResponse } from '~/client/queries/get-customer';
import { runtime } from '~/lib/makeswift/runtime';

import { CustomerGroupSchema, CustomerGroupsSchema, CustomerGroupsType } from './schema';

const DEFAULT_GROUP_ID = 'default-group';
const NO_GROUP_ID = '0';
const NOT_LOGGED_IN = 'not-logged-in';

async function getAllCustomerGroups(): Promise<CustomerGroupsType | null> {
  const response = await fetch('/api/customer/groups');

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: unknown = await response.json();
  const groups = CustomerGroupsSchema.parse(data);

  return groups;
}

async function fetchCustomerGroupData(): Promise<GetCustomerGroupResponse | undefined> {
  const response = await fetch('/api/customer/group');

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: unknown = await response.json();
  const group = CustomerGroupSchema.parse(data);

  return group;
}

function getGroupSlot(
  selectedSlots: Array<{ group?: string; slot: ReactNode }> | undefined,
  simulateGroup: boolean,
  simulatedGroup: string | undefined,
  unselectedSlot: ReactNode,
  customerGroupId: number | string = NOT_LOGGED_IN,
): ReactNode {
  const simulatedSlot =
    selectedSlots?.find((s) => {
      if (!s.group) return false;

      return s.group === simulatedGroup;
    })?.slot ?? unselectedSlot;

  const actualSlot =
    selectedSlots?.find((s) => {
      if (!s.group) return false;

      return s.group === `${customerGroupId}`;
    })?.slot ?? unselectedSlot;

  return simulateGroup ? simulatedSlot : actualSlot;
}

export function SlotSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx(className, 'relative w-full animate-pulse p-2')}>
      <div className="bg-contrast-100 line-clamp-1 h-20 w-full rounded-lg" />
    </div>
  );
}

interface Props {
  className: string;
  slots?: Array<{ group?: string; slot: ReactNode }>;
  simulatedGroup?: string;
  unselectedSlot: ReactNode;
}

function CustomerGroupSlot({ className, slots, simulatedGroup, unselectedSlot }: Props) {
  const isInBuilder = useIsInBuilder();

  const { data, isLoading, error } = useSWR<GetCustomerGroupResponse | undefined, Error>(
    '/api/customer/group',
    fetchCustomerGroupData,
  );

  if (isLoading) return <SlotSkeleton className={className} />;

  if (error) {
    return (
      <p className={clsx(className, 'p-4 text-center text-gray-500')}>
        An error occurred trying to fetch the customer's group.
      </p>
    );
  }

  const customerGroupId = data?.customer?.customerGroupId;

  const groupSlot = getGroupSlot(
    slots,
    isInBuilder,
    simulatedGroup,
    unselectedSlot,
    customerGroupId,
  );

  return <div className={className}>{groupSlot}</div>;
}

runtime.registerComponent(CustomerGroupSlot, {
  type: 'catalyst-customer-group-slot',
  label: 'Catalyst / Customer Group Slot',
  props: {
    className: Style(),
    slots: List({
      label: 'Selected groups',
      type: Group({
        label: 'Group',
        props: {
          group: Combobox({
            label: 'Name',
            getOptions: async (query) => {
              try {
                const data = await getAllCustomerGroups();

                if (!data) return [];

                return [
                  { id: NO_GROUP_ID, label: 'No group', value: NO_GROUP_ID },
                  { id: NOT_LOGGED_IN, label: 'Not logged in', value: NOT_LOGGED_IN },
                  ...data
                    .map((d) => ({
                      id: `${d.id}`,
                      label: d.name,
                      value: `${d.id}`,
                    }))
                    .filter((option) => option.label.toLowerCase().includes(query.toLowerCase())),
                ];
              } catch (error) {
                throw new Error(
                  `Error fetching customer group options. Make sure you are using the correct Storefront API key: ${String(error)}`,
                );
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

          if (!data) return [];

          return [
            { id: NO_GROUP_ID, label: 'No group', value: NO_GROUP_ID },
            { id: NOT_LOGGED_IN, label: 'Not logged in', value: NOT_LOGGED_IN },
            { id: DEFAULT_GROUP_ID, label: 'Unselected groups', value: DEFAULT_GROUP_ID },
            ...data
              .map((d) => ({
                id: `${d.id}`,
                label: d.name,
                value: `${d.id}`,
              }))
              .filter((option) => option.label.toLowerCase().includes(query.toLowerCase())),
          ];
        } catch (error) {
          throw new Error(
            `Error fetching customer group options. Make sure you are using the correct Storefront API key: ${String(error)}`,
          );
        }
      },
    }),
    unselectedSlot: Slot(),
  },
});
