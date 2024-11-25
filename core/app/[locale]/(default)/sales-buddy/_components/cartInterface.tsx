'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Accordions } from '~/components/ui/accordions';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/form';
import ShopIcon from '../assets/badge.png';

import ChatIcon from '../assets/chat.png';
import CategoryIcon from "../assets/category.png"

export default function CartInterface() {
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);
  const [accountId, setAccountId] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [sku, setSku] = useState('');
  const [cost, setCost] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [productName, setProductName] = useState('');

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
          <div className="flex items-center">
            <Image src={ShopIcon} alt="App-icon" />
          </div>
          <span className="flex items-center">Add an Account ID</span>
        </h4>
      ),
      content: (  
        <div>
          <label htmlFor="accountId" className="mb-1 block text-sm font-medium text-gray-700">
            Account ID
          </label>
          <Input
            id="accountId"
            placeholder="Account ID"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="mb-4"
          />
          <Button className="w-full bg-green-600 text-white">ASSIGN ID</Button>
        </div>
      ),
    },
    {
      title: (
        <h4 className="flex items-center gap-2 text-base font-normal">
          <div className="flex items-center">
            <Image src={CategoryIcon} alt="App-icon" />
          </div>
          <span className="flex items-center">Add Item to Cart</span>
        </h4>
      ),
      content: (
        <div className="space-y-4">
          <div>
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
              Supplier*
            </label>
            <Input
              id="supplier"
              placeholder="Choose Supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
              Full SKU*
            </label>
            <Input
              id="sku"
              placeholder="Full SKU"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
              Our Cost*
            </label>
            <Input
              id="cost"
              placeholder="Our Cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="retailPrice" className="block text-sm font-medium text-gray-700">
              Retail Price*
            </label>
            <Input
              id="retailPrice"
              placeholder="Retail Price"
              value={retailPrice}
              onChange={(e) => setRetailPrice(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
              Product Name (Optional)
            </label>
            <Input
              id="productName"
              placeholder="Product Name (Optional)"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full"
            />
          </div>
          <Button className="w-full bg-green-600 text-white">ADD TO CART</Button>
        </div>
      ),
    },
    {
      title: (
        <h4 className="flex items-center gap-2 text-base font-normal">
          <div className="flex items-center">
            <Image src={ChatIcon} alt="App-icon" />
          </div>
          <span className="flex items-center">Add Order Comments (Internal)</span>
        </h4>
      ),
      content: <div className="space-y-4 m-5"></div>,
    },
  ];

  return (
    <>
      <div className="mt-[15px] bg-white px-[20px]">
        {/* <h2 className="text-[24px] font-semibold">Customer Information</h2> */}
        {/* Accordions */}
        <Accordions accordions={accordions} type="multiple" />
        {/* Quick Links */}
      </div>
    </>
  );
}
