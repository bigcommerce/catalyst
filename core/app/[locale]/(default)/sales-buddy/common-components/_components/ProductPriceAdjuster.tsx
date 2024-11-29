"use client";
import React, { useState } from 'react';
import { Input } from '../Input';
import PencilIcon from "~/app/[locale]/(default)/sales-buddy/assets/stylus.png"
import Image from 'next/image';
interface ProductPriceAdjusterProps {
  parentSku: string;
  sku: string;
  initialCost: string;
  initialFloor: number;
  initialMarkup: number;
}
const EditIcon =()=>{
  return (
    <svg width="19" height="14" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      {' '}
      <path
        d="M1.7028 17.9723C1.3528 18.0556 1.04864 17.9681 0.790302 17.7098C0.531969 17.4515 0.444469 17.1473 0.527802 16.7973L1.5278 12.0223L6.4778 16.9723L1.7028 17.9723ZM6.4778 16.9723L1.5278 12.0223L12.9778 0.572314C13.3611 0.188981 13.8361 -0.00268555 14.4028 -0.00268555C14.9695 -0.00268555 15.4445 0.188981 15.8278 0.572314L17.9278 2.67231C18.3111 3.05565 18.5028 3.53065 18.5028 4.09731C18.5028 4.66398 18.3111 5.13898 17.9278 5.52231L6.4778 16.9723ZM14.4028 1.97231L4.0528 12.3223L6.1778 14.4473L16.5278 4.09731L14.4028 1.97231Z"
        fill="white"
      />{' '}
    </svg>
  );
}

const ProductPriceAdjuster: React.FC<ProductPriceAdjusterProps> = ({
  parentSku,
  sku,
  initialCost,
  initialFloor,
  initialMarkup,
}) => {
  const [cost, setCost] = useState<string>(initialCost);
  const [floor] = useState<number>(initialFloor);
  const [markup] = useState<number>(initialMarkup);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newCost, setNewCost] = useState<string>(cost);

  const handleSave = () => {
    setCost(newCost); // Update the cost value
    setIsEditing(false); // Exit editing mode
  };
  

  return (
    <div className="w-full bg-[#353535] p-1 text-white">
      {/* Parent SKU */}
      <div className="m-1 flex justify-between">
        <p className="text-[10px] font-semibold">PARENT SKU</p>
        <p className="text-[10px]">{parentSku}</p>
      </div>
      <hr className="border-white-600 m-2" />

      {/* SKU */}
      <div className="m-1 flex justify-between">
        <p className="text-[10px] font-semibold">SKU</p>
        <p className="text-[10px]">{sku}</p>
      </div>
      <hr className="border-white-600 m-2" />

      {/* Cost */}
      <div className="m-1 flex justify-between">
        <p className="text-[10px] font-semibold">Cost</p>
        <p className="text-[10px]">{cost}</p>
      </div>
      <hr className="border-white-600 m-2" />

      {/* Floor */}
      <div className="m-1 flex justify-between">
        <p className="text-[10px] font-semibold">Floor ($)</p>
        <p className="text-[10px]">{floor?.toFixed(2)}</p>
      </div>
      <hr className="border-white-600 m-2" />

      {/* Markup */}
      <div className="m-1 flex justify-between">
        <p className="text-[10px] font-semibold">Markup</p>
        <p className="text-[10px]">{markup?.toFixed(1)}</p>
      </div>
      <hr className="border-white-600 m-2" />

      {/* Adjust Price Button */}
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full rounded bg-green-600 px-4 py-2 text-[12px] text-white hover:bg-green-700"
        >
          <div className="flex items-center justify-center">
            {' '}
            {/* Changed justify-content to justify-center */}
            <EditIcon />
            {/* Added width and height for icon size */}
            <span className="">ADJUST PRICE</span> {/* Added margin for spacing */}
          </div>
        </button>
      )}

      {/* Input and Save/Cancel Buttons */}
      {isEditing && (
        <>
          <Input
            // type="number"
            value={newCost}
            style={{ color: 'black' }}
            onChange={(e) => setNewCost(e.target.value)}
            className="text-black-700 mb-4 w-full rounded border-none bg-[#FFFFFF] p-2"
            placeholder="$0.00"
          />

          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={() => setIsEditing(false)}
              className="mb-2 mr-2 w-full rounded bg-white px-4 py-2 text-black"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="mb-2 w-full rounded bg-[#1DB14B] px-4 py-2 text-white"
            >
              Save
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductPriceAdjuster;
