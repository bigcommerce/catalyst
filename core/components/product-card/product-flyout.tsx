'use client';

import { useFormatter } from 'next-intl';
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { BcImage } from '~/components/bc-image';
import { useCommonContext } from '~/components/common-context/common-provider';
import { Loader2 as Spinner } from 'lucide-react';
import {
  GetCustomerGroupById,
  GetEmailId,
  GetProductMetaFields,
  GetProductVariantMetaFields,
  GetVariantsByProductId,
} from '~/components/management-apis';
import { ProductAccessories } from './product-accessories';
import Link from 'next/link';
import { CheckoutButton } from '~/app/[locale]/(default)/cart/_components/checkout-button';
import { GetVariantsByProductSKU } from '~/components/graphql-apis';
import { InputPlusMinus } from '../form-fields/input-plus-minus';
import closeIcon from '~/public/add-to-cart/flyoutCloseIcon.svg';
import { calculateProductPrice, commonSettinngs } from '../common-functions';
import { getSessionUserDetails } from '~/auth';

const getVariantProductInfo = async (metaData: any, discountRules:any) => {
  let variantProductInfo: any = [],
    accessoriesLabelData: any = [],
    skuArrayData: any = [];
  if (metaData?.[0]?.value) {
    let variantDatas: any = JSON?.parse(metaData?.[0]?.value);
    if (variantDatas?.length > 0) {
      let variantProductIdSkus: Array<any> = [];
      variantDatas?.forEach(async (itemData: any) => {
        variantProductIdSkus?.push(itemData?.products?.[0]?.parent_sku);
        accessoriesLabelData?.push({
          sku: itemData?.products?.[0]?.parent_sku,
          label: itemData?.label,
        });
        if (itemData?.products?.[0]?.variants) {
          skuArrayData?.push(...itemData?.products?.[0]?.variants);
        } else {
          skuArrayData?.push(itemData?.products?.[0]?.parent_sku);
        }
      });
      if (variantProductIdSkus?.length) {
        let parentProductInformation = await GetVariantsByProductSKU(variantProductIdSkus);
        
        if (parentProductInformation?.length > 0) {
          for await (const productInfo of parentProductInformation) {
            const categories = removeEdgesAndNodes(productInfo?.categories);
            const categoryId = categories[0]?.entityId;
            const categoryIds = categoryId ? [categoryId] : [];
            let varaiantProductData = await GetVariantsByProductId(productInfo?.entityId);
            let variantNewObject: any = [];
            let productName: string = productInfo?.name;
            let updatedProductData = await calculateProductPrice(varaiantProductData,"accessories",discountRules,categoryIds);
            
            let imageArray: Array<any> = removeEdgesAndNodes(productInfo?.images);
            updatedProductData?.forEach(async (item: any) => {
              if (skuArrayData?.find((sku: any) => sku == item?.sku)) {
                let optionValues: string = item?.option_values
                  ?.map((data: any) => data?.label)
                  ?.join(' ');
                optionValues = optionValues ? '-' + optionValues : '';
                let getProductImage = imageArray?.find((image: any) =>
                  image?.altText?.includes(item?.mpn),
                );
                let salePriceData = item?.price;
                let price = item?.price;
                if (price != item?.sale_price && item?.sale_price > 0) {
                  salePriceData = item?.sale_price;
                }
                variantNewObject.push({
                  image: getProductImage?.url,
                  price: price,
                  retail_price: item?.retail_price,
                  sale_price: salePriceData,
                  id: item?.id,
                  mpn: item?.mpn,
                  sku: item?.sku,
                  name: optionValues,
                  purchasing_disabled:item?.purchasing_disabled,
                  selectedOptions: item?.selectedOption,
                  update_price_for_msrp: item?.UpdatePriceForMSRP,
                });
              }
            });
            let productAccesslabel = accessoriesLabelData?.find(
              (prod: any) => prod?.sku == productInfo?.sku,
            );
            if (variantNewObject?.length > 0) {
              variantProductInfo.push({
                label: productAccesslabel?.label,
                productData: variantNewObject,
                entityId: productInfo?.entityId,
              });
            }
          }
        }
      }
    }
  }
  return variantProductInfo;
};

export const ProductFlyout = ({
  data: product,
  fanPopup,
  blankAddImg,
  from,
  showFlyout,
  showFlyoutFn,
  discountRules,
}: {
  data: any;
  fanPopup: string;
  blankAddImg: string;
  from: string;
  showFlyout?: Boolean;
  showFlyoutFn?: any;
  discountRules?: any;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [commonSettingsValues, setCommonSettingsValues] = useState<any>([]);
  const format = useFormatter();
  const productFlyout = useCommonContext();
  let productData = productFlyout?.productData;
  let cartItemsData = productFlyout?.cartData;
  let open;
  let setOpen;
  let currencyCode: any;
  const [productQty, setProductQty] = useState<number>(1);
  const [skusWithoutAccessories, setSkusWithoutAccessories] = useState<string[]>([]); // State for SKUs without accessories
  let variantData: any = [], optionsData: any = [];
  if (from == 'pdp') {
    variantData = removeEdgesAndNodes(product?.variants);
    optionsData = removeEdgesAndNodes(product?.productOptions);
    open = productFlyout.open;
    setOpen = productFlyout?.handlePopup;
    currencyCode = productData?.extendedSalePrice?.currencyCode
  } else {
    variantData = [{
      entityId: product?.variantEntityId,
      sku: product?.sku
    }];
    optionsData = product?.selectedOptions;
    open = showFlyout;
    setOpen = showFlyoutFn;
    currencyCode = product?.extendedSalePrice?.currencyCode
  }
  
  const [variantProductData, setVariantProductData] = useState<any>([]);
  let productId = (from == 'pdp') ? product?.entityId : product?.productEntityId;
  let productQtyData = (from == 'pdp') ? productData?.quantity : product?.quantity;
  if (variantData && optionsData && optionsData?.length > 0) {
    let variantProduct: any = variantData?.find((item: any) => item?.sku == product?.sku);
    useEffect(() => {
      const getProductMetaData = async () => {
        let metaData = await GetProductVariantMetaFields(
          productId,
          variantProduct?.entityId,
          'Accessories',
        );
        let productData = await getVariantProductInfo(metaData,discountRules);
        setVariantProductData([...productData]);
        if (!productData || productData?.length === 0) {
          setVariantProductData([]);
          const storedSkus = JSON.parse(localStorage.getItem('skusWithoutAccessories') || '[]');
          if (!storedSkus.includes(product?.sku)) {

            setSkusWithoutAccessories(prev => [...prev, product?.sku]);
            localStorage.setItem('skusWithoutAccessories', JSON.stringify([...storedSkus, product?.sku]));
          }
        } else {
          const storedSkus = JSON.parse(localStorage.getItem('skusWithoutAccessories') || '[]');
          const updatedSkus = storedSkus?.filter((sku: any) => sku !== product?.sku);
          localStorage.setItem('skusWithoutAccessories', JSON.stringify(updatedSkus));
        }
        var getAllCommonSettinngsValues = await commonSettinngs([product?.brand?.entityId]);
        setCommonSettingsValues(getAllCommonSettinngsValues);
      };

      if (variantProduct) {
        getProductMetaData();
      }
      setProductQty(productQtyData);
    }, [variantProduct?.entityId, productId, productQtyData]);
  } else {
    useEffect(() => {
      const getProductMetaData = async () => {
        let metaData = await GetProductMetaFields(productId, 'Accessories');
        let productData = await getVariantProductInfo(metaData,discountRules);
        setVariantProductData([...productData]);
        if (!productData || productData?.length === 0) {
          setVariantProductData([]);
          const storedSkus = JSON.parse(localStorage.getItem('skusWithoutAccessories') || '[]');
          if (!storedSkus?.includes(product?.sku)) {

            setSkusWithoutAccessories(prev => [...prev, product?.sku]);
            localStorage?.setItem('skusWithoutAccessories', JSON?.stringify([...storedSkus, product?.sku]));
          }
        } else {
          const storedSkus = JSON.parse(localStorage.getItem('skusWithoutAccessories') || '[]');
          const updatedSkus = storedSkus?.filter((sku: any) => sku !== product?.sku);
          localStorage?.setItem('skusWithoutAccessories', JSON?.stringify(updatedSkus));
        }
      };
      getProductMetaData();
      setProductQty(productQtyData);
    }, [productId, productQtyData]);
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
          <Dialog.Content className="popup-container-parent data-[state=open]:animate-contentShow left-[50%] sm:left-[unset] fixed right-[unset] sm:right-[0] top-[50%] z-[100] flex h-[100vh] w-[90vw] max-w-[610px] [transform:translate(-50%,-50%)] sm:translate-y-[-50%] animate-mobSlideInFromLeft sm:animate-slideInFromLeft flex-col gap-[20px] overflow-auto rounded-[6px] bg-white px-[40px] py-[20px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
            <div
              className={`flyout-loading ${isLoading ? 'flex' : 'hidden'} fixed left-0 top-0 z-50 h-full w-full items-center justify-center`}
            >
              <Spinner className="animate-spin rounded-[50%] bg-[#8b8d8f] text-white shadow-[0_10px_38px_2000px_#0e121659,_0_10px_20px_2000px_#0e121633]" />
            </div>
            <div className={`flex ${isLoading ? 'overflow-hidden' : ''} flex-col gap-[20px]`}>
              <div className="flex flex-col items-center justify-center gap-[20px]">
                <Dialog.Close asChild>
                  <button
                    aria-modal
                    className="text-violet11 inline-flex h-full w-full appearance-none items-center justify-center rounded-full"
                    aria-label="Close"
                  >
                    <BcImage
                      alt="Close Icon"
                      width={14}
                      height={14}
                      unoptimized={true}
                      className=""
                      src={closeIcon}
                    />
                  </button>
                </Dialog.Close>
                <div className="gap-1.25 flex w-full flex-row items-center justify-center bg-[#EAF4EC] px-2.5">
                  <Dialog.Title className="text-mauve12 m-0 text-[20px] font-medium tracking-[0.15px] text-[#167E3F]">
                    {from == 'pdp' ? 'Added to Cart!' : 'Add Accessories' }
                  </Dialog.Title>
                </div>
              </div>
              <Dialog.Description></Dialog.Description>
              {from == 'pdp' && (
                <Dialog.Content className="popup-box1 !pointer-events-auto flex flex-col items-center gap-[30px] ssm:flex-row ssm:items-start">
                  <div className="popup-box1-div1 relative flex h-[200px] w-[200px] border border-[#cccbcb] ssm:h-[160px] ssm:w-[140px]">
                    <BcImage
                      alt={productData?.name}
                      width={140}
                      height={140}
                      unoptimized={true}
                      className="popup-box1-div-img absolute h-full w-full object-contain"
                      src={productData?.imageUrl}
                    />
                  </div>
                  <div className="popup-box1-div2 relative flex max-w-[360px] flex-shrink-[50] flex-col gap-[3px] text-center ssm:gap-[1px] ssm:text-start [&_.input-plus-minus-container]:self-center [&_.input-plus-minus-container]:ssm:[align-self:unset]">
                    <p className="text-center text-[14px] font-normal tracking-[0.25px] text-[#353535] ssm:text-left">
                      {productData?.name}
                    </p>
                    <p className="popup-box1-div2-sku text-center text-[12px] leading-[1.5rem] tracking-[0.4px] text-[#5C5C5C] ssm:text-left ssm:tracking-[0.015625rem]">
                      SKU: {product?.mpn}
                    </p>
                    {productData?.selectedOptions?.map((selectedOption: any, index: number) => {
                      let pipeLineData = '';
                      if (index < productData?.selectedOptions?.length - 2) {
                        pipeLineData = ',';
                      }
                      return (
                        <div
                          key={selectedOption?.entityId}
                          className="text-center ssm:flex ssm:items-center ssm:text-start"
                        >
                          <span className="popup-box1-div2-sku text-[12px] font-normal leading-[1.5rem] tracking-[0.4px] text-[#5C5C5C] ssm:tracking-[0.015625rem]">
                            {selectedOption.name}:
                          </span>
                          <span className="popup-box1-div2-sku text-[12px] font-normal leading-[1.5rem] tracking-[0.4px] text-[#5C5C5C] ssm:tracking-[0.015625rem]">
                            {selectedOption.value}
                          </span>
                          {pipeLineData && (
                            <span className="popup-box1-div2-sku text-[12px] font-normal leading-[1.5rem] tracking-[0.4px] text-[#5C5C5C] ssm:tracking-[0.015625rem]">
                              {' '}
                              {pipeLineData}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    <div className="md:flex-row">
                      {productData?.originalPrice?.value &&
                        productData?.selectedOptions?.length === 0 &&
                        productData?.originalPrice?.value !== productData?.listPrice?.value ? (
                        <div className="">
                          {format.number(productData?.originalPrice?.value * productData?.quantity, {
                            style: 'currency',
                            currency: productData?.originalPrice?.currencyCode,
                          })}
                        </div>
                      ) : null}
                      {productData?.extendedSalePrice?.value ? (
                        <div className="text-center text-[14px] font-normal leading-[1.5rem] tracking-[0.25px] text-[#353535] ssm:text-right">
                          {format.number(productData?.extendedSalePrice?.value, {
                            style: 'currency',
                            currency: productData?.extendedSalePrice?.currencyCode,
                          })}
                        </div>
                      ) : null}
                    </div>
                    <InputPlusMinus
                      product="true"
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      productData={productData}
                    />
                  </div>
                </Dialog.Content>
              )}

              {variantProductData && variantProductData?.length > 0 &&
                 commonSettingsValues?.[product?.brand?.entityId]?.use_accessories &&
                (
                  <>
                    <hr className="my-[20px] border-[#93cfa1]" />
                    <div className="pop-up-text flex flex-col gap-4">
                      <div className="flex flex-col gap-[20px]">
                        <div className="text-[20px] font-medium tracking-[0.15px] text-black">
                          You May Also Need
                        </div>
                        <div className="accessories-data flex flex-col gap-[20px]">
                          {variantProductData &&
                            variantProductData?.map((accessories: any, index: number) => (
                              <div
                                className="product-card flex flex-col items-center gap-[20px] border border-[#cccbcb] p-[20px] sm:flex-row"
                                key={index}
                              >
                                <ProductAccessories
                                  isLoading={isLoading}
                                  setIsLoading={setIsLoading}
                                  accessories={accessories}
                                  fanPopup={fanPopup}
                                  blankAddImg={blankAddImg}
                                  index={index}
                                  from={from}
                                  currencyCode={currencyCode}
                                  data={product}
                                />
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </>
                )
              }
              {!variantProductData  && (
                <div className="text-center text-gray-500">
                No accessories available for this product.
              </div>
              )}
              {from == 'pdp' && cartItemsData && (
                <>
                  <hr className="" />
                  <div className="footer-section flex flex-col gap-[20px]">
                    <div className="subtotal-section flex flex-col items-start gap-[10px]">
                      <div className="text-[20px] font-medium tracking-[0.15px] text-[#008BB7]">
                        Free Shipping
                      </div>
                      <div className="flex w-full flex-row items-start justify-between gap-[10px]">
                        <div className="items-qty text-[20px] font-medium tracking-[0.15px] text-black">
                          Subtotal ({cartItemsData?.lineItems?.totalQuantity}){' '}
                          {cartItemsData?.lineItems?.totalQuantity > 1 ? 'items' : 'item'}:
                        </div>
                        <div className="total-price text-[20px] font-medium tracking-[0.15px] text-black">
                          {cartItemsData?.totalExtendedListPrice?.currencyCode &&
                            format.number(cartItemsData?.totalExtendedListPrice?.value, {
                              style: 'currency',
                              currency: cartItemsData?.totalExtendedListPrice?.currencyCode,
                            })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="cart-buttons grid grid-cols-1 ssm:grid-cols-2 items-start gap-[10px]">
                      <Dialog.Close asChild>
                        <Link
                          className="hover:text-secondary flex h-[41px] w-[100%] flex-row items-center justify-center self-stretch rounded-[3px] border border-[#b3dce8] text-[14px] text-sm font-medium uppercase tracking-[1.25px] text-[#002A37]"
                          href="/cart"
                        >
                          View Cart
                        </Link>
                      </Dialog.Close>
                      <CheckoutButton cartId={cartItemsData?.entityId} />
                    </div>
                  </div>
                </>
              )}
              <Dialog.Close asChild>
                <button
                  aria-modal
                  className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute right-[10px] top-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full"
                  aria-label="Close"
                ></button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
