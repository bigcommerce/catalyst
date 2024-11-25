'use client';
import React, { useState } from 'react'
import InternalSearch from './_components/internalSearch';
import AppIcon from "./assets/image.png";
import AgentTools from './_components/agentToolDrawer';
import CartInterface from './_components/cartInterface';
import Image from 'next/image';
import { Accordions } from '~/components/ui/accordions';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/form';
import ShoppingCartIcon from './assets/shopping_cart_checkout.png';
import PersonIcon from './assets/person_add.png';
import DataLossIcon from './assets/data_loss_prevention.png';
import ProductPriceAdjuster from './_components/ProductPriceAdjuster';
import SalesBuddyProductPage from './_components/agentToolDrawer';
import { usePathname } from 'next/navigation';

export default function CustomerSupportDrawer() {
  // State to control the visibility of the drawer modal
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // State to manage open status of multiple accordion items
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);
  const path = usePathname();
  // Function to toggle the drawer
  const toggleDrawer = () => setIsOpen(!isOpen);

  // Function to toggle each accordion item
  const toggleAccordion = (index: number) => {
    setOpenAccordions((prevOpenAccordions) =>
      prevOpenAccordions.includes(index)
        ? prevOpenAccordions.filter((i) => i !== index)
        : [...prevOpenAccordions, index],
    );
  };


  return (
    <div className="fixed left-[50px] top-[520px] h-[164px] w-[164px] rounded-full border-4 border-[#FFFE98] bg-[#353535] shadow-lg">
      {/* Icon button to open the drawer */}
      <button onClick={toggleDrawer} className="hover:pointer p-10 focus:outline-none">
        <Image src={AppIcon} alt="App-icon" />
        {/* <span>🛎️</span> /* Customer support icon */}
      </button>

      {/* Drawer modal */}
      {isOpen && (
        <>
         
          <div
            className="fixed inset-0 flex h-full justify-end"
            onClick={toggleDrawer} // Close drawer when background is clicked
          >
            <div
              className="relative h-full overflow-y-auto bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside drawer
              style={{ transform: 'translateX(0)', width: '500px' }}
            >
              {/* Close button */}
              <div className="flex h-[72px] w-[483px] items-center justify-start gap-2.5 bg-[#353535] pb-[20px] pl-[40px] pr-[40px] pt-[20px]">
                <Image className="h-[25.2px] w-[28px]" src={AppIcon} alt="header" />
                <span className="color-[#FFFF] h-[32px] w-[146px] text-[24px] font-bold text-white">
                  {' '}
                  Agent Tools
                </span>
                <span className="ml-[190px] text-white">
                  <button
                    onClick={toggleDrawer}
                    className="text-white-500 h-[14px] w-[14px] hover:text-gray-700"
                  >
                    ✖
                  </button>
                </span>
              </div>

              <div className="bg-[#f3f4f5] p-4">
                <div>
                  
                  {path == '/' ? (
                    <>
                      <ReferalId />
                      <CustomerSupport />
                    </>
                  )  : path == '/cart/' ? (
                    <>
                     <ReferalId />
                     <CartInterface/>
                     <CustomerSupport/>
                    </>
                  ) : path.split('/').length - 1 === 2 ? (
                    <SalesBuddyProductPage />
                  ): (
                    ''
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
function ReferalId(){
  const [showReferralInput, setShowReferralInput] = useState(false);

  return(
    <div className=" w-[460px]h-[81px] space-y-1 rounded-lg ">
        <div className="border-none flex flex-row justify-between">
          <h2 className="text-2xl font-normal">Cart ID: #123456789</h2>
          <span className="w-[110px] font-normal text-base h-[32px] bg-[#F2DEBE] flex items-center justify-center">Mark: #.#</span>
        </div>
        <div className="flex h-[36px] items-center justify-between">
          {!showReferralInput ? (
            <>
              <span className="text-sm text-green-600 cursor-pointer" onClick={() => setShowReferralInput(true)}>
                Add Referral ID +
              </span>
              <Button className="w-1/4 bg-green-600 px-2 text-white text-xs">RESET CART</Button>
            </>
          ) : (
            <>
              <input placeholder="Markup" className="w-[224px] h-[36px] border border-[#c1c1c1]" />
              <span className="text-xs text-green-600 cursor-pointer" onClick={() => setShowReferralInput(true)}>
                save
              </span>
              <Button className="w-1/4 bg-green-600 px-2 text-white text-xs">RESET CART</Button>
            </>
          )}
        </div>
      </div>
  )
}

 function CustomerSupport() {
  const accordions = [
    {
      title: (
        <h4 className="flex items-center gap-2 text-base font-normal">
          <div className="flex items-center">
            <Image src={ShoppingCartIcon} alt="App-icon" />
          </div>
          <span className="flex items-center"> Customer Cart Lookup</span>
        </h4>
      ),
      content: (
        <div className="p-2">
          <label htmlFor="cart-id" className="block text-gray-500">
            Cart ID
          </label>
          <Input id="cart-id" placeholder="Enter Cart ID" className="mt-2" />
          <Button className="mt-2 w-full bg-green-600 text-white hover:bg-green-700">
            Fetch Cart
          </Button>
        </div>
      ),
    },
    {
      title: (
        <h4 className="flex items-center gap-2 text-base font-normal">
          <div className="flex items-center">
            <Image src={PersonIcon} alt="App-icon" />
          </div>
          <span className="flex items-center"> Find Customer</span>
        </h4>
      ),
      content: (
        <div className="p-2">
          <label htmlFor="email" className="block text-gray-500">
            Email
          </label>
          <Input id="email" placeholder="Email" className="mt-2" />
          <label htmlFor="name" className="mt-2 block text-gray-500">
            Name
          </label>
          <Input id="name" placeholder="Name" className="mt-2" />
          <label htmlFor="company" className="mt-2 block text-gray-500">
            Company
          </label>
          <Input id="company" placeholder="Company" className="mt-2" />
          <Button className="mt-2 w-full bg-green-600 text-white hover:bg-green-700">
            Find Customer
          </Button>
        </div>
      ),
    },
    {
      //
      title: (
        <h4 className="flex items-center gap-2 text-base font-normal">
          <div className="flex items-center">
            <Image src={DataLossIcon} alt="App-icon" />
          </div>
          <span className="flex items-center"> Create a New Account</span>
        </h4>
      ),
      content: (
        <div className="p-2">
          <label htmlFor="account-name" className="block text-gray-500">
            Account Name
          </label>
          <Input id="account-name" placeholder="Account Name" className="mt-2" />
          <label htmlFor="account-type" className="mt-2 block text-gray-500">
            Account Type
          </label>
          <Input id="account-type" placeholder="Account Type" className="mt-2" />
          <Button className="mt-2 w-full bg-green-600 text-white hover:bg-green-700">
            Create Account
          </Button>
        </div>
      ),
    },
  ];

  return (
    
    <>
     <h2 className="mt-[40px] text-xl font-semibold">Customer Support</h2>
    <div className="mt-[15px] bg-white px-[20px]">
      <Accordions accordions={accordions} type="multiple" />
    </div>
    </>
  );
}

