'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Accordions } from '../Accordin/index';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/form';
import NotesIcons from '../../assets/add_notes.png';
import { ProductProvider } from '~/components/common-context/product-provider';
import { useCommonContext } from '~/components/common-context/common-provider';
// Utility for styles
const TailwindCustomCssValues = {
  font: 'font-open-sans',
  baseTextColor: 'text-[#353535]',
  buttonBgPrimary: 'bg-[#5C5C5C]',
  buttonBgSecondary: 'bg-[#353535]',
};

const ACCORDION_DATA = {
  existingQuote: {
    title: (
      <div className="flex items-center gap-[5px] text-base font-normal">
        <Image src={NotesIcons} alt="Add Notes Icon" />
        <span className={`${TailwindCustomCssValues.font} text-[#353535]`}>
          Add to Existing Quote
        </span>
      </div>
    ),
    content: (
      <div className="mt-3 w-full bg-white">
        <Input id="quote" placeholder="Quote#" className="mb-4" />
        <Button
          className={`${TailwindCustomCssValues.font} w-full bg-[#1DB14B] font-normal text-white`}
        >
          ADD TO QUOTE
        </Button>
      </div>
    ),
  },
  costPricing: {
    title: (
      <h4 className="text-[20px] font-normal text-[#353535]">Cost and Pricing - United States</h4>
    ),
    content: (
      <div className="bg-white">
        <table className="w-full border-collapse border-b border-gray-300 text-sm">
          <thead>
            <tr className="text-left">
              {['SKU', 'Cost', 'IMAP', 'Floor (%)', 'Floor ($)'].map((header) => (
                <th key={header} className="p-1">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(4)].map((_, i) => (
              <tr key={i}>
                {['ABCDE-123-FG', '$0000.00', '$0000.00', '00%', '$0000.00'].map((data, j) => (
                  <td key={j} className="border-b px-[5px] py-[5px]">
                    {data}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  inventory: {
    title: <h4 className="text-[20px] font-normal text-[#353535]">Inventory</h4>,
    content: (
      <div className="w-[460px] bg-white p-[20px]">
        {[
          {
            id: 'ABCDE-123-FG',
            status: '## In Stock | Distribution Center Inventory',
            location: 'Quoizel - Gose Creek, SC (1006)',
            updated: '5 Days Ago',
            updatedColor: '#F5E9E8',
          },
          {
            id: 'ABCDE-123-FG',
            status: '## Back Ordered | 50 Expected MM/DD/YYYY',
            location: 'Supplier Inventory NSOID #####',
            updated: 'Today',
            updatedColor: '#EAF4EC',
          },
          {
            id: 'ABCDE-123-FG',
            status: '## In Stock | Belami Warehouse Inventory',
            location: 'Hinkley - Cleveland, OH (1004)',
            updated: '2 Days Ago',
            updatedColor: '#FBF4E9',
          },
        ].map((item, index) => (
          <div key={index} className="space-y-[5px] border-b pb-[10px] pt-[10px]">
            <p className="font-bold">{item.id}</p>
            <p className="text-[14px] text-[#353535]">{item.status}</p>
            <div className="flex justify-between">
              <p className="text-sm text-[#353535]">{item.location}</p>
              <p
                className={`p-[5px] text-sm ${index == 0 ? 'text-[#6A4C1E]' : index == 1 ? 'text-[#167E3F]' : 'text-[#6A4C1E]'}`}
                style={{ backgroundColor: item.updatedColor }}
              >
                Updated{' '}
                <span
                  className={`font-bold ${index == 0 ? 'text-[#6A4C1E]' : index == 1 ? 'text-[#167E3F]' : 'text-[#6A4C1E]'} `}
                >
                  {item.updated}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
};

export default function SalesBuddyProductPage() {
  const retrievedProductData = JSON.parse(localStorage.getItem('productInfo') || '{}');
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",retrievedProductData);
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);
  const [quoteNumber, setQuoteNumber] = useState('');

  const toggleAccordion = (index: number) => {
    setOpenAccordions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <div className="space-y-[10px] overflow-x-hidden">
      {/* Product Info */}
      <div className="h-[64px] w-[460px]">
        <h2 className="text-[24px] font-normal">Product ID: {retrievedProductData.mpn}</h2>
        <p className="text-[16px] font-bold underline">by {retrievedProductData.brand}</p>
      </div>

      {/* Accordions */}
      <div className="w-full bg-[#FFFFFF]">
        <Accordions
          styles="border-y-[1px] border-x-0  border-[#CCCBCB] bg-white py-[10px] px-[20px] text-[16px]"
          accordions={[ACCORDION_DATA.existingQuote]}
          // type="multiple"
        />
      </div>
      <div className="w-full">
        <Accordions
          styles="  py-[10px] px-[20px] text-[16px]"
          accordions={[ACCORDION_DATA.costPricing, ACCORDION_DATA.inventory]}
          // type="multiple"
        />
      </div>

      {/* Quick Links */}
      <div className="w-[460px] space-y-[10px]">
        <h3 className="text-[20px] font-normal">Quick Links</h3>
        <div className="mt-2 flex flex-col space-y-2">
          {[
            { label: 'Product Details', action: 'Edit >' },
            { label: 'Supplier Details', action: 'Edit >' },
            { label: 'Go to Supplier TNC', action: 'View >' },
          ].map((link, i) => (
            <Button
              key={i}
              className={`h-[32px] justify-between ${i % 2 == 0 ? 'bg-[#5C5C5C]' : 'bg-[#353535]'}`}
            >
              <span className="text-[16px]">{link.label}</span> <span>{link.action}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
