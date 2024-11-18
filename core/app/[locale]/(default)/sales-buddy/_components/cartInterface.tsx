'use client';
import { useState } from 'react';
import { Accordions } from '~/components/ui/accordions';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/form';

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
        <h4 className="text-base font-normal">
          Add an Account ID
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
      title:(
        <h4 className="text-base font-normal">
          Add an Account ID
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
  ];

  return (
    <>
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
      <div className="bg-white mt-[15px] px-[20px]">
        {/* Accordions */}
        <Accordions
          accordions={accordions}
          type="multiple"
        />
        {/* Quick Links */}
      </div>
    </>
  );
}
