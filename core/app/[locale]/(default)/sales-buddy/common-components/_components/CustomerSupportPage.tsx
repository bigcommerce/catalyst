import React from 'react';
import Image from 'next/image';
import { Accordions } from '../Accordin'; // Replace with your accordion library
import ShoppingCartIcon from '../../assets/shopping_cart_checkout.png'; // Update paths
import DataLossIcon from '../../assets/data_loss_prevention.png';
import PersonIcon from '../../assets/person_add.png';
import { Input } from '../Input';
function CustomerSupportPage() {
  // Helper to render input fields dynamically
  const renderInputFields = (fields:any) => {
    return fields.map((item:any) => (
      <div key={item.id} className=" mt-[10px]">
        <label htmlFor={item.id} className="font-open-sans tracking-[0.5px] h-[32px] content-center block text-[#353535]">
          {item.label}
        </label>
        <Input id={item.id} className="w-[225px]" />
      </div>
    ));
  };

  // Accordion configurations
  const accordions = [
    {
      title: (
        <div className="flex items-center gap-[5px] text-base font-normal">
          <Image src={ShoppingCartIcon} alt="Cart Lookup Icon" />
          <span className="font-open-sans text-[#353535] tracking-[0.15px]">Customer Cart Lookup</span>
        </div>
      ),
      content: (
        <div className="">
          <Input id="cart-id" placeholder="Cart ID" className="font-open-sans w-[225px]" />
          <button className="flex h-[42px] w-full mt-[10px] items-center justify-center rounded bg-[#1DB14B] text-white hover:bg-[#178B3E]">
            <p className="font-open-sans text-[14px] tracking-[1.25px] font-medium">FETCH CART</p>
          </button>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-[10px] text-base font-normal">
          <Image src={DataLossIcon} alt="Find Customer Icon" />
          <span className="font-open-sans text-[#353535] tracking-[0.15px]">Find Customer</span>
        </div>
      ),
      content: (
        <div className="justify-center flex flex-col w-[420px]  bg-white  pb-[10px] mt-[10px]">
          {renderInputFields([
            { id: 'email', label: 'Email' },
            { id: 'phone', label: 'Phone' },
            { id: 'name', label: 'Full Name' },
            { id: 'company', label: 'Company' },
          ])}
          <button className="flex h-[42px] mt-[10px] w-full items-center justify-center rounded bg-[#1DB14B] text-white hover:bg-[#178B3E] tracking-[1.25px]">
            <p className="font-open-sans text-[14px] tracking-[1.25px] font-medium">FIND CUSTOMER</p>
          </button>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-[5px] text-base font-normal">
          <Image src={PersonIcon} alt="Create Account Icon" />
          <span className="font-open-sans text-[#353535] tracking-[0.15px]">Create a New Account</span>
        </div>
      ),
      content: (
        <div className="space-y-[10px]">
          {renderInputFields([
            { id: 'fullname', label: 'Full Name*' },
            { id: 'company', label: 'Company (Optional)' },
            { id: 'email', label: 'Email*' },
            { id: 'phone', label: 'Phone (Optional)' },
            { id: 'referrer-id', label: 'Referrer ID*' },
          ])}
          <button className="flex h-[42px] mt-[10px] w-full items-center justify-center rounded bg-[#1DB14B] text-white hover:bg-[#178B3E] tracking-[1.25px]">
            <p className="font-open-sans text-[14px] tracking-[1.25px] font-medium">CREATE</p>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-[460px] ">
      <h2 className="text-2xl h-[32px] content-center font-normal text-[#353535]">Customer Information</h2>
      <div className="mt-[20px] ">
        <Accordions
          styles=" border-y-[1px] border-x-0 -my-[1px] border-[#CCCBCB] bg-white py-[10px] px-[20px] text-[16px] "
          accordions={accordions}
          titlestyle="   "
          type="multiple"
        />
      </div>
    </div>
  );
}

export default CustomerSupportPage;
