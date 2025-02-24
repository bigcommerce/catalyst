'use client';

import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import closeIcon from '~/public/add-to-cart/flyoutCloseIcon.svg';
import { BcImage } from '~/components/bc-image';
import { getBrand } from '../actions/brand';

interface NewProductQuoteProps {
  children: React.ReactNode;
  onAddProduct: (product: any) => void;
}

const NewProductQuote: React.FC<NewProductQuoteProps> = ({ children, onAddProduct }) => {
  const [productData, setProductData] = useState({
    brand: "",
    name: 'Shirt',
    sku: 'sku12345',
    quantity: 1,
    price: 100
  });
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
    setSelectedBrand(value);
  };

  const handleSave = () => {
    
    onAddProduct(productData);
    setProductData({ brand: '', name: '', sku: '', quantity: 0, price: 0 });
  };

  const getProductBrands=async()=>{
    var getBrandData =await getBrand()
    console.log("getBrandData---------", getBrandData.output);
    setBrands(getBrandData.output)
    
  }


  return (
    <Dialog.Root>
      <Dialog.Trigger className="">{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[80vh] w-[45vw] min-w-[300px] -translate-x-1/2 -translate-y-1/2 transform overflow-auto rounded-lg">
          <div className="flex flex-col gap-[20px] rounded-[6px] bg-white shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] ![pointer-events:unset]">
            <div className="flex flex-col divide-y-[1px] divide-gray-200">
              <Dialog.Title>
                <div className="px-[30px] py-[20px] text-[18px] font-bold">
                  Create Custom Product
                </div>
              </Dialog.Title>
              <div className="grid grid-cols-2 gap-[16px] px-[30px] py-[20px]">
                <div className="col-span-2 flex flex-row items-center justify-start gap-[20px]">
                  <div className="text-[12px] text-[rgba(0,0,0,0.54)]">Brand</div>
                  <div>
                    <select
                      className="w-full border-b border-b-black p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
                      name="brand"
                      value={productData.brand}
                      onChange={handleChange}
                    >
                      <option  value={""}>{"select option"}</option>
                      {
                        brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="name" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={productData.name}
                    onChange={handleChange}
                    className="w-full border-b border-b-black p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="sku" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={productData.sku}
                    onChange={handleChange}
                    className="w-full border-b border-b-black p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="quantity" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={productData.quantity}
                    onChange={handleChange}
                    className="w-full border-b border-b-black p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="price" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                    Price
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={productData.price}
                    onChange={handleChange}
                    className="w-full border-b border-b-black p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
                  />
                </div>
              </div>
              <div className="flex flex-row items-center justify-end gap-[15px] px-[30px] py-[20px] pt-3 [&_button]:h-[35px] [&_button]:min-w-[50px] [&_button]:rounded-[5px] [&_button]:border [&_button]:border-[rgb(60,100,244)] [&_button]:px-[20px]">
                <Dialog.Close asChild>
                  <button className="bg-transparent text-[14px] font-semibold text-[rgb(60,100,244)] hover:bg-[rgb(60,100,244)] hover:text-white">
                    Cancel
                  </button>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <button
                    onClick={handleSave}
                    className="bg-[rgb(60,100,244)] text-[14px] font-semibold text-white hover:bg-transparent hover:text-[rgb(60,100,244)]"
                  >
                    Save
                  </button>
                </Dialog.Close>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default NewProductQuote;
