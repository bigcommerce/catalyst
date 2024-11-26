'use client';
import React, { useState } from 'react'
import AppIcon from "./assets/image.png";
import AgentTools from './_components/agentToolDrawer';
import CartInterface from './_components/cartInterface';
import Image from 'next/image';
import { Accordions } from '~/components/ui/accordions';
import { Button } from '~/components/ui/button';
import { Checkbox, Input } from '~/components/ui/form';
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
  // const windowPathName=window.location.href
  // const pathMatch = path.match(/\/([^\/?]*)/);
  // const lastSegment = pathMatch ? pathMatch[1] : '';

  // // Regular expression to check if it ends with numbers
  // const endsWithNumbers = /\d+$/.test(lastSegment);

  // console.log(endsWithNumbers)

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
                      {/* <InternalSearch /> */}
                    </>
                  ) : path == '/cart/' ? (
                    <>
                      <ReferalId />
                      <CartInterface />
                      <CustomerSupport />
                    </>
                  ) : path.split('/').length - 1 === 2 ? (
                    <SalesBuddyProductPage />
                  ) : (
                    <InternalSearch />
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
          <Input
            id="cart-id"
            placeholder="Enter Cart ID"
            className="mt-2 "
          />
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
      <p className="mt-[40px] text-[24px] font-normal text-[#353535]">Customer Information</p>
      <div className="mt-[15px] bg-white">
        <Accordions styles="border-t border-b p-1" accordions={accordions} type="multiple" />
      </div>
    </>
  );
}



function InternalSearch() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const ourInventoryFilters = ['24', '1836', '18456', '3242', '3', '42'];
  const supplierInventoryFilters = ['1836', '18456', '3242', '3', '42'];

  // Function to handle checkbox toggle
  const handleFilterToggle = (filter: string) => {
    setSelectedFilters((prevSelectedFilters) =>
      prevSelectedFilters.includes(filter)
        ? prevSelectedFilters.filter((f) => f !== filter)
        : [...prevSelectedFilters, filter],
    );
  };

  // Function to remove a filter from selected filters
  const handleFilterRemove = (filter: string) => {
    setSelectedFilters((prevSelectedFilters) => prevSelectedFilters.filter((f) => f !== filter));
  };

  const accordions = [
    {
      title: (
        <h4 className="flex items-center gap-2 text-[#353535] text-base font-normal">
          <span className="flex items-center"> Our Inventory</span>
        </h4>
      ),
      content: (
        <div className="mt-2 space-y-2">
          {ourInventoryFilters.map((filter) => (
            <div key={filter} className="flex items-center gap-2">
              <Checkbox
                id={`our-inventory-${filter}`}
                checked={selectedFilters.includes(filter)}
                onCheckedChange={() => handleFilterToggle(filter)}
              />
              <label htmlFor={`our-inventory-${filter}`} className="text-sm text-gray-700">
                {filter}
              </label>
            </div>
          ))}
        </div>
      ),
    },
    {
      title:  <h4 className="flex items-center gap-2 text-[#353535] text-base font-normal">
          <span className="flex items-center"> Supplier Inventory</span>
        </h4>,
      content: (
        <div className="mt-2 space-y-2">
          {supplierInventoryFilters.map((filter) => (
            <div key={filter} className="flex items-center gap-2">
              <Checkbox
                id={`supplier-inventory-${filter}`}
                checked={selectedFilters.includes(filter)}
                onCheckedChange={() => handleFilterToggle(filter)}
              />
              <label htmlFor={`supplier-inventory-${filter}`} className="text-sm text-gray-700">
                {filter}
              </label>
            </div>
          ))}
          <div className="mt-2">
            <a href="#" className="text-sm text-blue-600">
              (+)&nbsp;Show ## More
            </a>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full rounded-lg bg-gray-100 bg-white p-2">
      <h2 className="mb-4 text-[24px] text-lg font-normal  text-[#353535]">
        Internal Search
      </h2>

      <div className="mb-4 rounded-lg p-3">
        <h3 className="mb-2 text-sm font-semibold"> Filters</h3>
        <div className="flex flex-wrap gap-2">
          {selectedFilters.length === 0 ? (
            <span className="text-sm text-gray-500">No filters selected</span>
          ) : (
            selectedFilters.map((filter) => (
              <span
                key={filter}
                className="flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm"
              >
                {filter}
                <button
                  onClick={() => handleFilterRemove(filter)}
                  className="ml-1 text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      <Accordions
        styles="border-t border-b p-1"
        accordions={accordions}
        type="multiple"
        defaultValue={['Our Inventory', 'Supplier Inventory']}
      />

      <div className="mt-4">
        <Input
          placeholder="Search the docs…"
          // icon={<MagnifyingGlassIcon height="16" width="16" />}
        />
      </div>

      <Button className="mt-4 w-full bg-green-600 text-white hover:bg-green-700">Search</Button>
    </div>
  );
}