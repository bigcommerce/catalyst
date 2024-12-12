import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Accordions } from '../Accordin'; // Replace with your accordion library
import ShoppingCartIcon from '../../assets/shopping_cart_checkout.png'; // Update paths
import DataLossIcon from '../../assets/data_loss_prevention.png';
import PersonIcon from '../../assets/person_add.png';
import { Input } from '../Input';
import { createCustomerAccount } from '../../_actions/create-customer-account';

function CustomerSupportPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const cartIdRef = useRef<HTMLInputElement>(null);
  const findCustomerRefs = {
    email: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    name: useRef<HTMLInputElement>(null),
    company: useRef<HTMLInputElement>(null),
  };
  const createAccountRefs = {
    fullname: useRef<HTMLInputElement>(null),
    company: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    referrerId: useRef<HTMLInputElement>(null),
  };

  const handleCartLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cartId = cartIdRef.current?.value;
    console.log('Cart ID:', cartId); // Process cartId as needed
  };

  const handleFindCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const findCustomerData = {
      email: findCustomerRefs.email.current?.value,
      phone: findCustomerRefs.phone.current?.value,
      name: findCustomerRefs.name.current?.value,
      company: findCustomerRefs.company.current?.value,
    };
    console.log('Find Customer Data:', findCustomerData); // Process findCustomerData as needed
  };

  // const handleCreateAccountSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   // Construct account data with validation
  //   const createAccountData = {
  //     fullname: createAccountRefs.fullname.current?.value?.trim() || '',
  //     company: createAccountRefs.company.current?.value?.trim() || '',
  //     email: createAccountRefs.email.current?.value?.trim() || '',
  //     phone: createAccountRefs.phone.current?.value?.trim() || '',
  //     referrerId: createAccountRefs.referrerId.current?.value?.trim() || '',
  //     access_id: process.env.SALES_BUDDY_ACCESS_ID,
  //   };

  //   console.log('Create Account Data:', createAccountData);

  //   // Validate required fields
  //   if (!createAccountData.fullname || !createAccountData.email) {
  //     console.error('Full name and email are required fields.');
  //     alert('Please provide a full name and a valid email address.');
  //     return;
  //   }

  //   try {
  //     // Call the createCustomerAccount API function
  //     alert('fdsjfsahkjfkfd')
  //     const response = await createCustomerAccount(createAccountData);

  //     // Handle API response
  //     if (response.status === 200) {
  //       console.log('Account created successfully:', response.data);
  //       alert('Account created successfully!');
  //     } else {
  //       const errorMessage = response.error || 'An unknown error occurred';
  //       console.error('Error creating account:', errorMessage);
  //       alert(`Failed to create account: ${errorMessage}`);
  //     }
  //   } catch (error: any) {
  //     console.error('Error during account creation:', error);
  //     alert(`An error occurred: ${error.message || 'Unknown error'}`);
  //   }
  // };
const handleCreateAccountSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Construct account data with validation
  const createAccountData = {
    fullname: createAccountRefs.fullname.current?.value?.trim() || '',
    company: createAccountRefs.company.current?.value?.trim() || '',
    email: createAccountRefs.email.current?.value?.trim() || '',
    phone: createAccountRefs.phone.current?.value?.trim() || '',
    referrerId: createAccountRefs.referrerId.current?.value?.trim() || '',
    access_id: process.env.SALES_BUDDY_ACCESS_ID,
  };

  console.log('Create Account Data:', createAccountData);

  // Validate required fields
  if (!createAccountData.fullname || !createAccountData.email) {
    console.error('Full name and email are required fields.');
    // Set an error message in the state to display in the UI
    setErrorMessage('Please provide a full name and a valid email address.');
    return;
  }

  try {
    // Call the createCustomerAccount API function
    const response = await createCustomerAccount(createAccountData);

    // Handle API response
    if (response.status === 200) {
      console.log('Account created successfully:', response.data);
      // Set a success message in the state to display in the UI
      setSuccessMessage('Account created successfully!');
    } else {
      const errorMessage = response.error || 'An unknown error occurred';
      console.error('Error creating account:', errorMessage);
      // Set an error message in the state to display in the UI
      setErrorMessage(`Failed to create account: ${errorMessage}`);
    }
  } catch (error: any) {
    console.error('Error during account creation:', error);
    // Set an error message in the state to display in the UI
    setErrorMessage(`An error occurred: ${error.message || 'Unknown error'}`);
  }
};


  const renderInputFields = (fields: Array<{ id: string; label: string }>, refs: any) => {
    return fields.map((item) => (
      <div key={item.id} className="mt-[10px]">
        <label
          htmlFor={item.id}
          className="font-open-sans block h-[32px] content-center tracking-[0.5px] text-[#353535]"
        >
          {item.label}
        </label>
        <Input ref={refs[item.id]} id={item.id} className="w-[225px]" />
      </div>
    ));
  };

  const accordions = [
    {
      title: (
        <div className="flex items-center gap-[5px] text-base font-normal">
          <Image src={ShoppingCartIcon} alt="Cart Lookup Icon" />
          <span className="font-open-sans tracking-[0.15px] text-[#353535]">
            Customer Cart Lookup
          </span>
        </div>
      ),
      content: (
        <form onSubmit={handleCartLookupSubmit}>
          <Input
            ref={cartIdRef}
            id="cart-id"
            placeholder="Cart ID"
            className="font-open-sans w-[225px]"
          />
          <button
            type="submit"
            className="mt-[10px] flex h-[42px] w-full items-center justify-center rounded bg-[#1DB14B] tracking-[1.25px] text-white hover:bg-[#178B3E]"
          >
            <p className="font-open-sans text-[14px] font-medium tracking-[1.25px]">FETCH CART</p>
          </button>
        </form>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-[10px] text-base font-normal">
          <Image src={DataLossIcon} alt="Find Customer Icon" />
          <span className="font-open-sans tracking-[0.15px] text-[#353535]">Find Customer</span>
        </div>
      ),
      content: (
        <form
          onSubmit={handleFindCustomerSubmit}
          className="mt-[10px] flex w-[420px] flex-col justify-center bg-white pb-[10px]"
        >
          {renderInputFields(
            [
              { id: 'email', label: 'Email' },
              { id: 'phone', label: 'Phone' },
              { id: 'name', label: 'Full Name' },
              { id: 'company', label: 'Company' },
            ],
            findCustomerRefs,
          )}
          <button
            type="submit"
            className="mt-[10px] flex h-[42px] w-full items-center justify-center rounded bg-[#1DB14B] tracking-[1.25px] text-white hover:bg-[#178B3E]"
          >
            <p className="font-open-sans text-[14px] font-medium tracking-[1.25px]">
              FIND CUSTOMER
            </p>
          </button>
        </form>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-[5px] text-base font-normal">
          <Image src={PersonIcon} alt="Create Account Icon" />
          <span className="font-open-sans tracking-[0.15px] text-[#353535]">
            Create a New Account
          </span>
        </div>
      ),
      content: (
        <form onSubmit={handleCreateAccountSubmit} className="space-y-[10px]">
          {renderInputFields(
            [
              { id: 'fullname', label: 'Full Name*' },
              { id: 'company', label: 'Company (Optional)' },
              { id: 'email', label: 'Email*' },
              { id: 'phone', label: 'Phone (Optional)' },
              { id: 'referrerId', label: 'Referrer ID*' },
            ],
            createAccountRefs,
          )}
          <button
            type="submit"
            className="mt-[10px] flex h-[42px] w-full items-center justify-center rounded bg-[#1DB14B] tracking-[1.25px] text-white hover:bg-[#178B3E]"
          >
            <p className="font-open-sans text-[14px] font-medium tracking-[1.25px]">CREATE</p>
          </button>
        </form>
      ),
    },
  ];

  return (
    <div className="w-[460px]">
      <h2 className="h-[32px] content-center text-2xl font-normal text-[#353535]">
        Customer Information
      </h2>
      <div className="mt-[20px]">
        <Accordions
          styles="border-y-[1px] border-x-0 -my-[1px] border-[#CCCBCB] bg-white py-[10px] px-[20px] text-[16px]"
          accordions={accordions}
          titlestyle=""
          type="multiple"
        />
      </div>
    </div>
  );
}

export default CustomerSupportPage;