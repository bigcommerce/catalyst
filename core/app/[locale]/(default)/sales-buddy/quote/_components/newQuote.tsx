'use client';

import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import closeIcon from '~/public/add-to-cart/flyoutCloseIcon.svg';
import { BcImage } from '~/components/bc-image';

interface DialogQuoteProps {
  children: React.ReactNode;
}

const NewQuote: React.FC<DialogQuoteProps> = ({ children }) => {
  const newCustomer = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true },
    { name: 'company', label: 'Company', type: 'text', required: false },
    { name: 'phoneNumber', label: 'Phone Number', type: 'text', required: false },
  ];

  const [customerType, setCustomerType] = useState<string>('');

  return (
    <Dialog.Root>
      <Dialog.Trigger className="">{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 h-[80vh] w-[45vw] min-w-[300px] -translate-x-1/2 -translate-y-1/2 transform overflow-auto rounded-lg">
          <div className="flex flex-col gap-[20px] rounded-[6px] bg-white px-[30px] py-[20px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] ![pointer-events:unset]">
            <Dialog.Close asChild>
              <button
                aria-modal
                className="text-violet11 inline-flex h-full w-full appearance-none items-center justify-end rounded-full"
                aria-label="Close"
              >
                <BcImage
                  alt="Close Icon"
                  width={14}
                  height={14}
                  unoptimized={true}
                  className=""
                  src={closeIcon}
                />
              </button>
            </Dialog.Close>
            <div className="flex flex-col gap-[20px] text-[14px]">
              <div className="text-center text-[20px] font-bold">New Quote</div>
              <div className="grid grid-cols-[25%_75%] items-center gap-[20px_3px]">
                <div className="font-bold">Customer</div>
                <div className="flex justify-center">
                  <select
                    onChange={(e) => setCustomerType(e.target.value)}
                    name=""
                    id=""
                    className="w-full border-none bg-neutral-200 p-[10px_5px] outline-none"
                  >
                    <option value="">Select</option>
                    <option value="New Customer">New Customer</option>
                    <option value="Existing Customer">Existing Customer</option>
                  </select>
                </div>

                {customerType === 'New Customer' && (
                  <>
                    {newCustomer.map((field) => {
                      return (
                        <React.Fragment key={field.name}>
                          <div className="font-bold">
                            {field.label}
                            {field.required && (
                              <span className="font-normal text-[#A71F23]"> *</span>
                            )}
                          </div>
                          <div className="flex justify-center">
                            <input
                              className="w-full bg-neutral-200 p-[10px_5px] outline-none"
                              type={field.type}
                              placeholder={field.label}
                              name={field.name}
                              required={field.required}
                            />
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </>
                )}

                {customerType === 'Existing Customer' && (
                  <>
                    <div className="font-bold">Choose Customer</div>
                    <div className="flex justify-center">
                      <input
                        className="w-full bg-neutral-200 p-[10px_5px] outline-none"
                        type="email"
                        placeholder="Customer Email"
                      />
                    </div>
                  </>
                )}
              </div>
              {customerType && (
                <div className="mt-[10px] flex justify-center">
                  <button className="flex cursor-pointer items-center justify-center rounded-[20px] border border-brand-600 bg-brand-600 p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-brand-600">
                    Add Product
                  </button>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default NewQuote;
