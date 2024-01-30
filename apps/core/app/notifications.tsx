import { Toaster } from 'react-hot-toast';

export const Notifications = () => {
  return (
    <Toaster
      containerClassName="px-6 2xl:container sm:px-10 lg:px-12 2xl:mx-auto 2xl:px-0"
      position="top-right"
      toastOptions={{
        className:
          '!text-black !rounded !border !border-gray-200 !bg-white !shadow-lg !py-4 !px-6 !text-base',
      }}
    />
  );
};
