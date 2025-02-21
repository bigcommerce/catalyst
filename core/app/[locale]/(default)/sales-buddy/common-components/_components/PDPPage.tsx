'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Accordions } from '../Accordin/index';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/form';
import NotesIcons from '../../assets/add_notes.png';
import { get_product_data, PdpProduct } from '../common-functions';
import Loader from './Spinner';
import { usePathname, useRouter } from 'next/navigation';
import { useCompareDrawerContext } from '~/components/ui/compare-drawer';
import { CreateQuote } from '../../quote/actions/CreateQuote';
import { sendEmailToCustomer } from '../../quote/actions/SendEmailToCustomer';
import { CartData } from '../../quote/_components/RquestQuoteFlyoutForm';
import { GetCartDetials } from '../../quote/actions/GetCartDetials';
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
  const { storeProductDetailsForQuote } = useCompareDrawerContext();

  const [loading, setLoading] = useState({
    cost: false,
    inventory: false,
  });
  const quoteInputRef = useRef<HTMLInputElement>(null);
  const [quoteCartData, setquoteCartData] = useState<CartData[]>();
  // const toggleAccordion = (index: number) => {
  //   setOpenAccordions((prev) =>
  //     prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
  //   );
  // };
  const pageName = usePathname();
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
    const locale = 'en';
    router.push(`/${locale}/sales-buddy/common-components/Quote/QuoteCart`);
  };


  const fetchCartData = async () => {
    try {
      const CartItemsData: any = await GetCartDetials();
      const cartLineItems = CartItemsData?.lineItems?.physicalItems || [];
      const customItmes = CartItemsData?.lineItems?.customItems || [];
  
      const formattedCutomItemData = customItmes.map(item => ({
        bc_sku: item.sku,
        bc_product_name: item.name,
        bc_product_id: 0,
        bc_variant_id: "custom",
        bc_variant_sku: item.entityId,
        bc_variant_name: "custom",
        options: "custom",
        type: "custom",
      }));
  
      if (cartLineItems.length > 0) {
        const lineItemsData = cartLineItems.map((item: any) => {
          const selectedOptions = item?.selectedOptions || [];
  
          const productSelectedOpt = selectedOptions
            ?.map((option: any) => {
              if (Array.isArray(item?.baseCatalogProduct?.productOptions?.edges)) {
                const optionFromProduct = item?.baseCatalogProduct?.productOptions?.edges.find(
                  (prodOption: any) => prodOption.node.entityId === option.entityId
                );
  
                if (optionFromProduct) {
                  const selectedValue = optionFromProduct?.node?.values?.edges.find(
                    (valueItem: any) => valueItem.node.entityId === option.valueEntityId
                  );
  
                  if (selectedValue) {
                    const isVariant = optionFromProduct.node.isVariantOption ?? false;
  
                    if (isVariant) {
                      return { type: "variant", label: selectedValue.node.label };
                    } else {
                      return {
                        type: "modifier",
                        label: selectedValue.node.label,
                        modifierId: optionFromProduct.node.entityId,
                        modifierOptionId: selectedValue.node.entityId,
                      };
                    }
                  }
                }
              }
              return undefined;
            })
            .filter(Boolean);
  
          const variantLabels = productSelectedOpt
            ?.filter((item: any) => item?.type === "variant")
            .map((item: any) => item?.label)
            .join(", ");
  
          return {
            bc_product_id: item.productEntityId,
            bc_sku: item.sku,
            bc_product_name: item.name,
            bc_variant_id: item.variantEntityId,
            bc_variant_sku: item?.sku,
            bc_variant_name: variantLabels || "",
            options: productSelectedOpt.map((opt: any) => opt.label).join(", "),
            type: "product",
          };
        });
  
        const finalLineItems = [...lineItemsData, ...formattedCutomItemData];
        setquoteCartData(finalLineItems);
        return finalLineItems; 
      } else {
        setquoteCartData([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching updated cart data:", error);
      return [];
    }
  };
  

  const handleAddToQuote = async () => {
    // Find the quote button
    const quoteButton = document.getElementById("custom-quote");
    if (!quoteButton) {
      console.warn("custom-quote button not found in DOM.");
      return;
    }
  
    // Validate quote input early
    if (!quoteInputRef.current || !quoteInputRef.current.value) {
      console.warn("Quote input is empty.");
      return;
    }
    const quoteValue = quoteInputRef.current.value;
    console.log("Quote Value:", quoteValue);
  
    try {
      // Handle quote button click if not on cart page
        
      if (pageName === '/cart/') {
        await fetchCartData();
      }  

        await handleQuoteButtonClick(quoteButton);
        console.log('Click processing completed');
  
      // Wait for local storage to be updated
      const getLatestQuoteData = () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const latestQuoteData = JSON.parse(localStorage.getItem("Q_R_data") || "{}");
           
            resolve(latestQuoteData);
          }, 3000);
        });
      };
  
      // Get the latest quote data
      const latestQuoteData = await getLatestQuoteData();
  
      // Create the quote request
      await createQuoteRequest(quoteValue, quoteCartData as CartData[], latestQuoteData);
  
    } catch (error) {
      console.error('Error during quote processing:', error);
    }
  };
  
  // Helper function to handle the quote button click
  async function handleQuoteButtonClick(quoteButton: HTMLElement) {
    return new Promise((resolve) => {
      let isProcessingComplete = false;
      
      const handleProcessingComplete = () => {
        isProcessingComplete = true;
        observer.disconnect();
        resolve();
      };
  
      const observer = new MutationObserver((mutations) => {
        // Add your specific conditions here to determine when processing is complete
        // For example, waiting for a specific element to appear/disappear
        const processingComplete = mutations.some(mutation => {
          // Customize this condition based on your DOM changes
          // Example: check for a success message or updated cart state
          return mutation.target.classList.contains('quote-added') || 
                 mutation.target.getAttribute('data-quote-status') === 'complete';
        });
  
        if (processingComplete) {
          handleProcessingComplete();
        }
      });
  
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'data-quote-status']
      });
  
      quoteButton.click();
  
      // Safety timeout
      setTimeout(() => {
        if (!isProcessingComplete) {
          handleProcessingComplete();
        }
      }, 5000);
    });
  }
  
  const createQuoteRequest = async (quoteId: string, cartData: CartData[], latestQuoteData: any) => {
    console.log("localData>>>", latestQuoteData);
    console.log("localCartData>>>", cartData);
    const UpdatelatestQuoteData = JSON.parse(localStorage.getItem("Q_R_data") || "{}");
      console.log("UpdatelatestQuoteData------------------,", UpdatelatestQuoteData);
    let dataToSend = {
      quote_id: quoteId, 
      bc_customer_id: '',  
      quote_type:"old", 
      qr_customer:'', 
      quote_by: "agent",
      qr_product: pageName === '/cart/' ? cartData : [UpdatelatestQuoteData],
      page_type: pageName === '/cart/' ? 'cart' : 'pdp',
      cart_url: ""
    };
  
    try {
      const result = await CreateQuote(dataToSend);
      console.log("Quote successfully", result);
      if (result) {
        console.log("Quote successfully created:", dataToSend);

        const emailResult = await sendEmailToCustomer(dataToSend);
        console.log("Email sent successfully:", emailResult);
      } else {
        console.error("Failed to create quote.");
      }
    } catch (error) {
      console.error("Error creating quote:", error);
    }
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
          <Input id="quote" placeholder="Quote#" className="mb-4" ref={quoteInputRef} />
          <Button onClick={handleAddToQuote}
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
                const item = {
                  id: skuNum?.variants_sku,
                  status: skuNum?.stock_information,
                };
                const toMapData=item.status
                return (
                  <div key={index} className="space-y-[5px] border-b pb-[10px] pt-[10px]">
                    {/* Item ID (Bold) */}
                    <p className="font-bold text-[16px]">{item.id}</p>

                    {Object?.keys(toMapData)?.length > 0 ? (
                      <div key={index} className="w-full  flex flex-col ">
                        {/* Line1 and Line2 */}
                        <div className="flex flex-col w-full gap-y-1">
                          <p className="text-[14px] font-semibold text-[#353535]">{toMapData["line1:"]}</p>
                          <p className="text-[14px] text-[#353535]">{toMapData["line2:"]}</p>
                        </div>

                        {/* Line3 and Status */}
                        <div className="flex justify-between items-center w-full ">
                          <p className="text-[14px] text-[#353535] flex-1">{toMapData["line3:"]}</p>

                          {/* Status Badge */}
                          {(() => {
                            const days = toMapData["days:"];
                            let textColor = "";
                            let bgColor = "";
                            let statusText = "";

                            if (days <= 1) {
                              textColor = "text-[#167E3F]";
                              bgColor = "bg-[#EAF4EC]";
                              statusText = "Updated Today";
                            } else if (days >= 2 && days <= 3) {
                              textColor = "text-[#6A4C1E]";
                              bgColor = "bg-[#F5E9E8]";
                              statusText = `Updated ${days} Days Ago`;
                            } else {
                              textColor = "text-[#561813]";
                              bgColor = "bg-[#F5E9E8]";
                              statusText = `Updated ${days} Days Ago`;
                            }

                            return (
                              <p className={`px-3 py-1 text-sm font-semibold rounded-md ${textColor} ${bgColor}`}>
                                {statusText}
                              </p>
                            );
                          })()}
                        </div>
                      </div>

                    ) : (
                      <div className="pb-[10px] pt-[10px] text-gray-500">No Inventory Available</div>
                    )}
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
