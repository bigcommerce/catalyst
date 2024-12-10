'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Accordions } from '../Accordin/index';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/form';
import ShopIcon from '../../assets/badge.png';
import ChatIcon from '../../assets/chat.png';
import CategoryIcon from '../../assets/category.png';
import editIcon from '~/app/[locale]/(default)/sales-buddy/assets/edit_square.png';
import deleteIcon from '~/app/[locale]/(default)/sales-buddy/assets/delete.png';
export default function CartInterface() {
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);
  const [comment,setComments]=useState(false)
  const [formData, setFormData] = useState({
    accountId: '',
    supplier: '',
    sku: '',
    cost: '',
    retailPrice: '',
    productName: ''
  });

  const toggleAccordion = (index: number) => {
    setOpenAccordions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const accordions = [
    {
      title: <AccordionTitle icon={ShopIcon} text="Add an Account ID" />,
      content: (
        <div>
          <Input
            id="accountId"
            placeholder="Account ID"
            value={formData.accountId}
            onChange={handleInputChange}
            className="mb-[10px]"
          />
          <Button className="font-open-sans w-full bg-[#1DB14B] font-normal text-white tracking-[1.25px]">
            ASSIGN ID
          </Button>
        </div>
      ),
    },
    {
      title: <AccordionTitle icon={CategoryIcon} text="Add Item to Cart" />,
      content: (
        <div className="space-y-[10px]">
          {[
            {
              id: 'supplier',
              label: 'Supplier*',
              component: (
                <SelectDropdown
                  id="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                />
              ),
            },
            { id: 'sku', label: 'Full SKU*' },
            { id: 'cost', label: 'Our Cost*' },
            { id: 'retailPrice', label: 'Retail Price*' },
            { id: 'productName', label: 'Product Name (Optional)' },
          ].map(({ id, label, component }) => (
            <div key={id} className= "flex flex-col">
              <label htmlFor={id} className="font-open-sans block text-[16px] font-base text-gray-700 leading-[32px] tracking-[0.5px] content-center">
                {label}
              </label>
              {component || (
                <Input
                  id={id}
                  value={formData[id as keyof typeof formData]}
                  onChange={handleInputChange}
                  className="w-full"
                />
              )}
            </div>
          ))}
          <Button className="font-open-sans w-full bg-[#1DB14B] font-normal text-white tracking-[1.25px]">
            ADD TO CART
          </Button>
        </div>
      ),
    },
    {
      title: <AccordionTitle icon={ChatIcon} text="Add Order Comments (Internal)" />,
      content: (
        <div className="space-y-[10px]">
          <div className="bg-[#E8E7E7] p-[5px]">
            <textarea
              id="message"
              rows={4}
              className="font-open-sans block h-[282px] w-[430px] resize-none overflow-x-hidden rounded bg-[#E8E7E7] p-[10px] text-sm text-gray-900 focus:outline-none"
              placeholder="Write your thoughts here..."
              readOnly={comment ? true : false}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </textarea>
            {comment && (
              <div className="flex justify-between">
                <div
                  className="item-center flex justify-center p-1"
                  onClick={() => {
                    setComments(false);
                  }}
                >
                  <Image className="" src={editIcon} layout="intrinsic" alt="editIcon"/>
                  <span className="font-open-sans item-center mx-1 text-[#1DB14B]"> Edit</span>
                </div>
                <div
                  className="item-center flex justify-center p-1"
                  onClick={() => {
                    setComments(true);
                  }}
                >
                  <Image className="" src={deleteIcon} alt="deleteIcon"layout="intrinsic" />
                  <span className="font-open-sans item-center mx-1 text-[#A71F23]"> Delete</span>
                </div>

                
              </div>
            )}
          </div>
          <Button
            onClick={() => {
              setComments(true);
            }}
            className="font-open-sans w-full bg-[#1DB14B] font-normal text-white tracking-[1.25px]"
          >
            SAVE COMMENT
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mt-[15px] bg-white">
        <Accordions
          styles="border-y-[1px] border-x-0  border-[#CCCBCB] bg-white py-[10px] px-[20px] text-[16px]"
          // styles="border-t border-b border-[#CCCBCB] py-[10px] px-[20px] font-open-sans text-[16px]"
          accordions={accordions}
        />
      </div>
      <Button className="font-open-sans w-full bg-[#1DB14B] font-normal tracking-[1.25px] text-white">
        CREATE QUOTE
      </Button>
    </>
  );
}

function AccordionTitle({ icon, text }: { icon: string; text: string }) {
  return (
    <h4 className="flex items-center gap-1 text-base font-normal">
      <Image src={icon} alt="App-icon" />
      <span className="text-[#353535]">{text}</span>
    </h4>
  );
}

function SelectDropdown({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="font-open-sans block w-full rounded border-2 border-gray-200 p-3 text-sm text-[#7F7F7F] focus:outline-none"
    >
      <option value="" disabled>
        Choose Supplier
      </option>
      <option value="Supplier1">Supplier 1</option>
      <option value="Supplier2">Supplier 2</option>
    </select>
  );
}
