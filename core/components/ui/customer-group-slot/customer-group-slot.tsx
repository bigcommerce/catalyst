import { useIsInBuilder } from '@makeswift/runtime/react';
import { ReactNode } from 'react';
import useSWR from 'swr';

import { GetCustomerGroupResponse } from '~/client/queries/get-customer';

interface Props {
  className: string;
  slots?: Array<{ group?: string; slot: ReactNode }>;
  selectedGroup?: string;
  noGroupSlot: ReactNode;
}

export function CustomerGroupSlot({
  className,
  slots,
  selectedGroup = 'no-group',
  noGroupSlot,
}: Props) {
  const allSlots = slots?.concat({ group: 'no-group', slot: noGroupSlot });
  const isInBuilder = useIsInBuilder();
  const { data, isLoading } = useSWR<GetCustomerGroupResponse>('/api/customer-group', async () => {
    const response = await fetch('/api/customer-group');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.json();
  });

  // If we're in the builder, render the selected group slot, otherwise use the group from the API. Coalesce to noGroupSlot if no group is found
  const groupSlot = isInBuilder
    ? (allSlots?.find((s) => s.group === selectedGroup)?.slot ?? (
        // If the selectedGroup does not exist in the list of slots
        <div className="p-4 text-center text-lg text-gray-400">
          This group needs to be added to "Targeted customer groups".
        </div>
      ))
    : allSlots?.find((s) => s.group === `${data?.customer?.customerGroupId}`)?.slot;

  const slot = !data?.customer?.customerGroupId && !isInBuilder ? noGroupSlot : groupSlot;

  if (isLoading) return 'Loading...';

  return <div className={className}>{slot}</div>;
}
