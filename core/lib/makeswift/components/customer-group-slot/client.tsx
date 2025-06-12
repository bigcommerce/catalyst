'use client';

import { useIsInBuilder } from '@makeswift/runtime/react';
import { clsx } from 'clsx';
import { ReactNode } from 'react';
import useSWR from 'swr';

import { GetCustomerGroupResponse } from '~/client/queries/get-customer';

import { CustomerGroupSchema } from './schema';

export const NO_GROUP_ID = 'no-group';

async function fetchCustomerGroupData(): Promise<GetCustomerGroupResponse | undefined> {
  const response = await fetch('/api/customer/group');

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: unknown = await response.json();
  const group = CustomerGroupSchema.parse(data);

  return group;
}

function UntargetedGroup() {
  return (
    <div className="p-4 text-center text-lg text-gray-400">
      This group needs to be added to "Targeted customer groups".
    </div>
  );
}

function getGroupSlot(
  allSlots: Array<{ group?: string; slot: ReactNode }> | undefined,
  simulateGroup: boolean,
  simulatedGroup: string,
  customerGroupId: number | undefined,
  noGroupSlot: ReactNode,
): ReactNode {
  const simulatedSlot = allSlots?.find((s) => s.group === simulatedGroup)?.slot ?? (
    <UntargetedGroup />
  );
  const actualSlot = allSlots?.find((s) => s.group === `${customerGroupId}`)?.slot ?? (
    <UntargetedGroup />
  );

  if (!customerGroupId && !simulateGroup) {
    return noGroupSlot;
  }

  return simulateGroup ? simulatedSlot : actualSlot;
}

export function SlotSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx(className, 'relative w-full animate-pulse p-2')}>
      <div className="line-clamp-1 h-20 w-full rounded-lg bg-contrast-100" />
    </div>
  );
}

interface Props {
  className: string;
  slots?: Array<{ group?: string; slot: ReactNode }>;
  simulatedGroup?: string;
  noGroupSlot: ReactNode;
}

export function CustomerGroupSlot({
  className,
  slots,
  simulatedGroup = NO_GROUP_ID,
  noGroupSlot,
}: Props) {
  const allSlots = slots?.concat({ group: NO_GROUP_ID, slot: noGroupSlot });
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
    allSlots,
    isInBuilder,
    simulatedGroup,
    customerGroupId,
    noGroupSlot,
  );

  return <div className={className}>{groupSlot}</div>;
}
