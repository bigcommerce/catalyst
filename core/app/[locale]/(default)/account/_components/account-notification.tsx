'use client';

import { Message } from '~/components/ui/message';

import { useAccountStatusContext } from './account-status-provider';

interface Props {
  message: string;
}

export const AccountNotification = ({ message }: Props) => {
  const { accountState } = useAccountStatusContext();

  return (
    accountState.status === 'success' && (
      <Message className="col-span-full mb-8 w-full text-gray-500" variant={accountState.status}>
        <p>{message}</p>
      </Message>
    )
  );
};
