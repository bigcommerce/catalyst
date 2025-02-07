'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Accordions } from '../Accordin/index';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/form';
import NotesIcons from '../../assets/add_notes.png';
import { get_product_data, PdpProduct } from '../common-functions';
import Loader from './Spinner';
import { useRouter } from 'next/navigation';
import ProductQuoteCart from '../Quote/QuoteCart';
import QuoteRequestPage from '../Quote/RequestForQuote';
// Utility for styles
const TailwindCustomCssValues = {
  font: 'font-open-sans',
  baseTextColor: 'text-[#353535]',
  buttonBgPrimary: 'bg-[#5C5C5C]',
  buttonBgSecondary: 'bg-[#353535]',
};


interface SalesBuddyProductPageProps {
  toggleAccordion: (index: number) => void;
  openIndexes: number[];
  setOpenIndexes: (indexes: number[]) => void;
  QouteToggleAccordion: (index: number) => void,
  qouteIndex: number[],
  setQouteIndex: any
}

export default function SalesBuddyProductPage({ toggleAccordion, openIndexes, setOpenIndexes, QouteToggleAccordion ,qouteIndex,setQouteIndex  }: SalesBuddyProductPageProps) {
  const [childSku, setChildSku] = useState([]);
  const retrievedProductData = JSON.parse(localStorage.getItem('productInfo') || '{}');
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);
  const [quoteNumber, setQuoteNumber] = useState('');
  const [loading, setLoading] = useState({
    cost: false,
    inventory: false,
  });
  // const toggleAccordion = (index: number) => {
  //   setOpenAccordions((prev) =>
  //     prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
  //   );
  // };
  const router = useRouter();
  const costPricingTableData = (data) => {
    setChildSku(data.child_sku)
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading((prev) => ({ ...prev, cost: true }));
      try {
        const data = await get_product_data(retrievedProductData.productId);
        if (data.status === 200) {
          console.log(data?.data?.output);
          
          costPricingTableData(data?.data?.output);
          setLoading((prev) => ({ ...prev, cost: false }));
        }
      } catch (error) {
        setLoading((prev) => ({ ...prev, cost: false }));
        console.error('Error fetching product data:', error);
      }
    };
    fetchData(); // Call the async function
  }, []);

  const handleRedirect = () => {
    const locale = 'en'; // Replace with the actual locale you want to use
    router.push(`/${locale}/sales-buddy/common-components/Quote/QuoteCart`);
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
          <Button onClick={() => { handleRedirect() }}
            className={`${TailwindCustomCssValues.font} w-full bg-[#1DB14B] font-normal text-white`}
          >
            ADD TO QUOTE
          </Button>

          {/* <ProductQuoteCart/>
          <QuoteRequestPage/> */}
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
              <tr className="text-left h-[34px]">
                {['SKU', 'Cost', 'IMAP', 'Floor (%)', 'Floor ($)'].map((header) => (
                  <th key={header} className="p-1">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            {
              loading.cost == false &&
              <tbody>
                {
                  childSku?.map((skuNum: any, i: number) => (
                    <tr key={i} className='h-[34px]'>
                      {[
                        skuNum?.variants_sku ?? 'N/A',
                        skuNum?.adjusted_cost
                          ? Number(skuNum.adjusted_cost).toFixed(2)
                          : "0000.00",
                        skuNum?.variant_price
                          ? Number(skuNum.variant_price).toFixed(2)
                          : "0000.00",
                        skuNum?.floor_percentage
                          ? `${(skuNum?.floor_percentage)}%`
                          : '00.00%',
                        skuNum?.floor_percentage
                          ? (skuNum?.floor_percentage * skuNum?.adjusted_cost).toFixed(2)
                          : '0.00',
                      ].map((data, j) => (
                        <td key={j} className="border-b px-[5px] py-[5px]">
                          {data}
                        </td>
                      ))}
                    </tr>
                  ))
                }
              </tbody>
            }

          </table>
          {loading?.cost == true &&
            <div className='flex justify-center w-full p-5'>
              <Loader />
            </div>
          }
        </div>
      ),
    },
    inventory: {
      title: <h4 className="text-[20px] font-normal text-[#353535]">Inventory</h4>,
      content: (

        <>
          {loading.cost == false &&
            <div className="w-[460px] bg-white p-[20px]">
              {childSku?.map((skuNum, index) => {
                // Step 1: Split the stockPlace details by double pipe
                const entries = skuNum?.stock_information?.split('||').map(entry => entry?.trim());
                // Step 2: Split each entry by single pipe
                const stockDetails = entries?.map(entry => entry?.split('|').map(item => item?.trim()));
                const item = {
                  id: skuNum?.variants_sku, // Use skuNum.sku instead of hardcoded id
                  status: stockDetails,
                };

                return (

                  <div key={index} className="space-y-[5px] border-b pb-[10px] pt-[10px]">
                    <p className="font-bold">{item.id}</p>
                    {
                      item.status ? <>
                        {item?.status?.map((details, detailIndex) => (
                          <div key={detailIndex} className="w-full mb-2">
                            <div className=" justify-between items-center w-full">
                              <p className="text-[14px] open-sans text-[#353535]">
                                {details[0]} | {details[1]}
                              </p>
                              <p className="mr-2">{details[2]}</p>
                            </div>

                            <div className="flex justify-between items-center w-full">
                              <p className="mr-2 flex-1 text-left">{details[3]}</p>

                              {/* Determine text color dynamically */}
                              {(() => {
                                const textColor =
                                  detailIndex === 1 ? 'text-[#167E3F] bg-[#EAF4EC] ' : 'text-[#6A4C1E] bg-[#F5E9E8]';

                                return (
                                  <p
                                    className={`p-[5px] text-sm ${textColor}`}
                                    
                                  >
                                    <span className={`font-bold ${textColor}`}>{details[4]}</span>
                                  </p>
                                );
                              })()}
                            </div>
                          </div>

                        ))}
                      </> : <div className="space-y-[5px]  pb-[10px] pt-[10px]">No Inventory Available </div>
                    }
                  </div>

                );
              })}
            </div>
          }
          {
            loading.cost == true &&
            <div className='flex justify-center w-full'>
              <Loader />
            </div>
          }
        </>

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
          toggleAccordion={QouteToggleAccordion}
          openIndexes={qouteIndex}
          setOpenIndexes={setQouteIndex}
        // type="multiple"
        />
      </div>
      <div className="w-full">
        <Accordions
          styles="  py-[10px] px-[20px] text-[16px]"
          accordions={[ACCORDION_DATA.costPricing, ACCORDION_DATA.inventory]}
          contentCss="px-5"
          toggleAccordion={toggleAccordion}
          openIndexes={openIndexes}
          setOpenIndexes={setOpenIndexes}

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
