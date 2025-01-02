'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Accordions } from '../Accordin/index';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/form';
import NotesIcons from '../../assets/add_notes.png';
import {  get_product_data, PdpProduct } from '../common-functions';
// Utility for styles
const TailwindCustomCssValues = {
  font: 'font-open-sans',
  baseTextColor: 'text-[#353535]',
  buttonBgPrimary: 'bg-[#5C5C5C]',
  buttonBgSecondary: 'bg-[#353535]',
};


export default function SalesBuddyProductPage() {
  const [childSku, setChildSku] = useState([]);
  const retrievedProductData = JSON.parse(localStorage.getItem('productInfo') || '{}');
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);
  const [quoteNumber, setQuoteNumber] = useState('');

  const toggleAccordion = (index: number) => {
    setOpenAccordions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const costPricingTableData = (data) => {
    
    let adjustCostObject = data?.productVariantsMetafields;
    const floorValues = Object?.keys(data.Metafields)?.flatMap((key) => {
      const dataArray = data?.Metafields[key]?.data[0]; // Access the entire data array
      return { 'floor%': dataArray?.value };
    });
    
    let getSkuImap = Object?.values(data?.productVariants).flatMap((variants) => {
      return variants?.map((variant) => {
        const resourceId = variant?.variants?.id; 
        const adjustedCostData = adjustCostObject[resourceId]?.data || [];
        const adjustedCost = adjustedCostData[0]?.value; 
        const stockPlace = adjustedCostData[1]?.value; 

        return {
          id: variant?.variants?.id,
          productid: variant?.product_id,
          sku: variant?.variants?.sku,
          calculated_price: variant?.variants?.calculated_price,
          AdjustedCost: adjustedCost || variant?.variants?.calculated_price +"*", // Include AdjustedCost
          stockPlace: stockPlace, // Include stockPlace
          floorPercentage: floorValues[0]['floor%'] || null, // Include floor% value
          floorPrice: parseFloat(
            floorValues[0]['floor%'] * adjustedCost || variant?.variants?.calculated_price,
          ).toFixed(2),
        };
      });
    });
    setChildSku(getSkuImap)
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await get_product_data(retrievedProductData.productId);
        if (data.status === 200) {
          costPricingTableData(data?.data?.output);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };
    fetchData(); // Call the async function
  }, []);
  
  // console.log(childSku);
  
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
              {childSku?.map((skuNum: any, i: any) => (
                <tr key={i}>
                  {[
                    skuNum.sku,
                    skuNum.AdjustedCost,
                    skuNum.calculated_price,
                    skuNum.floorPercentage,
                    skuNum.floorPrice,
                  ].map((data, j) => (
                    <td key={j} className="border-b px-[5px] py-[5px]">
                      {data}
                    </td>
                  ))}
                </tr>
                // <tr key={i}>{skuNum.sku}</tr>
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
          {childSku?.map((skuNum, index) => {
                // Step 1: Split the stockPlace details by double pipe
            const entries = skuNum?.stockPlace?.split('||').map(entry => entry?.trim());
            // Step 2: Split each entry by single pipe
            const stockDetails = entries?.map(entry => entry?.split('|').map(item => item?.trim()));
            
            const item = {
              id: skuNum?.sku, // Use skuNum.sku instead of hardcoded id
              status:stockDetails,
                // index === 0
                //   ? '## In Stock | Distribution Center Inventory'
                //   : index === 1
                //     ? '## Back Ordered | 50 Expected MM/DD/YYYY'
                //     : '## In Stock | Belami Warehouse Inventory',
              // location:
              //   index === 0
              //     ? 'Quoizel - Gose Creek, SC (1006)'
              //     : index === 1
              //       ? 'Supplier Inventory NSOID #####'
              //       : 'Hinkley - Cleveland, OH (1004)',
              // updated: index === 0 ? '5 Days Ago' : index === 1 ? 'Today' : '2 Days Ago',
              // updatedColor: index === 0 ? '#F5E9E8' : index === 1 ? '#EAF4EC' : '#FBF4E9',
            };

            return (
              
                <div key={index} className="space-y-[5px] border-b pb-[10px] pt-[10px]">
                  <p className="font-bold">{item.id}</p>
                {
                 item.status ? <>
                  {item?.status?.map((details, detailIndex) => (
                    <div key={detailIndex} className=' w-full mb-2'> {/* Added margin-bottom for spacing */}
                      <div className=" justify-between w-full">
                        <p className="text-[14px] open-sans text-[#353535]">{details[0]} | {details[1]}</p> {/* Assuming the first item is the location */}
                        <div className='flex justify-between items-center'>
                          <p className="mr-2">{details[2]}</p> {/* Added margin-right for spacing */}
                          <p
                            className={`p-[5px] text-sm ${detailIndex === 0 ? 'text-[#6A4C1E]' : detailIndex === 1 ? 'text-[#167E3F]' : 'text-[#6A4C1E]'}`}
                            style={{ backgroundColor: details[3] }} // Assuming the fourth item is the updatedColor
                          >
                            <span
                              className={`font-bold ${detailIndex === 0 ? 'text-[#6A4C1E]' : detailIndex === 1 ? 'text-[#167E3F]' : 'text-[#6A4C1E]'}`}
                            >
                              {details[3]} {/* Assuming the fourth item is the updated value */}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  </> :<div className="space-y-[5px]  pb-[10px] pt-[10px]">No Inventory Available </div> 
                }
                
                
                  {/* <div className="flex justify-between">
                    <p className="text-sm text-[#353535]">{item.location}</p>
                    <p
                      className={`p-[5px] text-sm ${index === 0 ? 'text-[#6A4C1E]' : index === 1 ? 'text-[#167E3F]' : 'text-[#6A4C1E]'}`}
                      style={{ backgroundColor: item.updatedColor }}
                    >
                      Updated{' '}
                      <span
                        className={`font-bold ${index === 0 ? 'text-[#6A4C1E]' : index === 1 ? 'text-[#167E3F]' : 'text-[#6A4C1E]'}`}
                      >
                        {item.updated}
                      </span>
                    </p>
                  </div> */}
                </div>
              
            );
          })}
        </div>
      ),
    },
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
      {/* <div className="w-[460px] space-y-[10px]">
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
      </div> */}
    </div>
  );
}
