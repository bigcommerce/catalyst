'use client';
import Image from 'next/image';
import { title } from 'process';
import { useState } from 'react';
import { Accordions } from '~/components/ui/accordions';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/form';
import NotesIcons from "../assets/add_notes.png"
import CartInterface from './cartInterface';
import CustomerSupportDrawer from '../customerSupportDrawer';
// import { fetchCartData } from '../_actions/get-cart-data';

export default function SalesBuddyProductPage() {
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);
  const [quoteNumber, setQuoteNumber] = useState('');

  const toggleAccordion = (index: number) => {
    setOpenAccordions((prevOpenAccordions) =>
      prevOpenAccordions.includes(index)
        ? prevOpenAccordions.filter((i) => i !== index)
        : [...prevOpenAccordions, index],
    );
  };

  const accordions = [
    {
      title: (
        <h4 className="flex items-center gap-2 text-base font-normal">
          <div className="flex items-center bg-white">
            <Image src={NotesIcons} alt="App-icon" />
          </div>
          <span className="flex items-center">Add to Existing Quote</span>
        </h4>
      ),
      content: (
        <div className="bg-white">
          <Input
            id="quote"
            placeholder="#Quote"
            // value={accountId}
            // onChange={(e) => setAccountId(e.target.value)}
            className="mb-4"
          />
          <Button className="w-full bg-green-600 text-white">ADD TO QUOTE</Button>
        </div>
      ),
    },
    {
      title: (
        <h4 className="className='mt-5' flex items-center gap-2 text-base font-normal">
          <div className="flex items-center">{/* <Image src={NotesIcons} alt="App-icon" /> */}</div>
          <span className="flex items-center">Cost and Pricing - United States</span>
        </h4>
      ),
      content: (
        <div className="bg-white">
          <table className="w-full border-collapse border-b border-gray-300 text-sm">
            <thead className="mt-5">
              <tr className="text-left">
                <th className="p-1">SKU</th>
                <th className="p-1">Cost</th>
                <th className="p-1">IMAP</th>
                <th className="p-1">Floor (%)</th>
                <th className="p-1">Floor ($)</th>
              </tr>
            </thead>
            <tbody>
              {/* Add rows dynamically */}
              {[...Array(2)].map((_, i) => (
                <tr key={i} className="">
                  <td className="border-b p-2">ABCDE-123-FG</td>
                  <td className="border-b p-2">$0000.00</td>
                  <td className="border-b p-2">$0000.00</td>
                  <td className="border-b p-2">00%</td>
                  <td className="border-b p-2">$0000.00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      title: (
        <h4 className="className='mt-5' flex items-center gap-2 text-base font-normal">
          <div className="flex items-center">{/* <Image src={NotesIcons} alt="App-icon" /> */}</div>
          <span className="flex items-center">Inventory</span>
        </h4>
      ),
      content: (
        <div className="bg-white">
          {/* Inventory items */}
          <div className="border-b p-2">
            <p className="font-bold">ABCDE-123-FG</p>
            <p className="text-[14px] text-[#353535]">
              ## In Stock | Distribution Center Inventory
            </p>
            <div className="flex justify-between">
              <p className="text-sm text-[#353535]">Quoizel - Gose Creek, SC (1006) </p>
              <p className="bg-[#F5E9E8] p-[5px] text-right text-sm">
                Updated <span className="text-[#353535] font-bold"> 5 Days Ago</span>
              </p>
            </div>
          </div>
          <div className="border-b p-2">
            <p className="font-bold">ABCDE-123-FG</p>
            <p className="text-[14px] text-[#353535]">## Back Ordered | 50 Expected MM/DD/YYYY</p>
            <div className="flex justify-between">
              <p className="text-sm text-[#353535]">Supplier Inventory NSOID ##### </p>
              <p className="bg-[#EAF4EC] p-[5px] text-right text-sm">
                Updated <span className="font-bold text-[#167E3F]">Today</span>
              </p>
            </div>
          </div>
          <div className="p-2">
            <span className="text-sm text-gray-500"></span>
            <p className="font-bold">ABCDE-123-FG</p>
            <p className="text-[14px] text-[#353535]">## In Stock | Belami Warehouse Inventory</p>
            <div className="flex justify-between">
              <p className="text-sm text-[#353535]">Hinkley -Cheveland,OH (1004)</p>
              <p className="bg-[#F5E9E8] p-[5px] text-sm">
                Updated <span className="font-bold text-[#167E3F]">2 Days Ago</span>
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="border-none p-1">
        <div className="mb-5">
          <h2 className="text-[24px] font-semibold">Product ID: #12345678</h2>
          <p className="text-[16px] font-bold text-[#353535]">by Manufacturer Name</p>
        </div>

      

        {/* Accordions */}
        <div className= "bg-white mt-[15px] ">
          <Accordions styles="border-t border-b p-1" accordions={accordions} type="multiple" />
        </div>

        {/* Quick Links */}
        <div className="mt-4">
          <h3 className="text-l font-semibold">Quick Links</h3>
          <div className="mt-2 flex flex-col space-y-2">
            <Button variant="primary" className="justify-between bg-[#5C5C5C]">
              Product Details <span>Edit > </span>
            </Button>
            <Button variant="primary" className="justify-between bg-[#353535]">
              Supplier Details <span>Edit ></span>
            </Button>
            <Button variant="primary" className="justify-between bg-[#5C5C5C]">
              Go to Supplier TNC <span>View ></span>
            </Button>
          </div>
        </div>
      </div>
      <div className='mt-3'><CartInterface /></div>
    </div>
  );
}
