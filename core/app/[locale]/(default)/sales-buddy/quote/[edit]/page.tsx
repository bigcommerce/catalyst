import React from 'react';

import { Ellipsis, EllipsisVertical, RotateCw, Search, X } from 'lucide-react';
import AddDialog from '../_components/addDialog';
import DatePicker from '../_components';
import { BcImage } from '~/components/bc-image';
import CartIcon from '~/public/add-to-cart/addToCart.svg';
import PopOverClick from '../_components/PopOverClick';
import NewProductQuote from '../_components/newProductQuote';

const page = () => {
  const popOverContents = [
    { key: 'refresh-product', label: 'Refresh Product' },
    { key: 'delete', label: 'Delete' },
  ];

  return (
    <div className="flex justify-center bg-[#f7f8fc] py-[2rem] text-[#353535]">
      <div className="relative flex w-[90%] flex-col gap-[10px]">
        <div className="flex flex-col gap-5 bg-white p-4">
          <div className="text-[20px] font-bold text-[#313440]">Quote Information</div>
          <div className="grid grid-cols-2 gap-[16px]">
            <div className="col-span-2 flex flex-row items-center justify-start gap-[20px]">
              <div className="text-[0.8rem]">Company</div>
              <div>
                <select className="text-[0.8rem]" name="" id="">
                  <option value="">No Account</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col">
              <label htmlFor="" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                First Name
              </label>
              <input
                type="text"
                className="w-full border-b border-b-gray-400 p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                Last Name
              </label>
              <input
                type="email"
                className="w-full border-b border-b-gray-400 p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                Email
              </label>
              <input
                type="text"
                className="w-full border-b border-b-gray-400 p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                Company
              </label>
              <input
                type="number"
                className="w-full border-b border-b-gray-400 p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                Expiration Date
              </label>
              <input
                type="date"
                className="w-full border-b border-b-gray-400 p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                Phone No
              </label>
              <input
                type="text"
                className="w-full border-b border-b-gray-400 p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
              />
            </div>
          </div>
          <div>
            <button className="rounded-[5px] bg-[#3C64F4] p-[6px_16px] text-[12px] uppercase text-white hover:bg-[#3C64F4]/90">
              continue
            </button>
          </div>
        </div>
        {/* <div className="flex flex-col gap-1 bg-white p-4">
          <div className="flex flex-row gap-[20px]">
            <div className="text-[20px] text-[#313440]">Address</div>
            <button className="rounded-[5px] border border-gray-200 p-[3px_10px] text-[12px] uppercase hover:bg-gray-100">
              Edit
            </button>
          </div>
          <div className="flex flex-row items-center justify-start">
            <div className="flex flex-1 flex-col gap-[10px] text-[14px]">
              <div className="font-bold">Shipping Address</div>
              <div className="text-[12px]">
                <div>Rachel Liu</div>
                <div>3650 36th Street NW</div>
                <div>Calgary, Alberta T2L2L1</div>
                <div>Canada</div>
                <div>14033385248</div>
              </div>
            </div>
            <div className="flex-1 text-[14px]">
              <div className="flex flex-1 flex-col gap-[10px] text-[14px]">
                <div className="font-bold">Billing Address</div>
                <div className="text-[12px]">
                  <div>Rachel Liu</div>
                  <div>3650 36th Street NW</div>
                  <div>Calgary, Alberta T2L2L1</div>
                  <div>Canada</div>
                  <div>14033385248</div>
                </div>
              </div>
            </div>
          </div>
        </div> */}
        <div className="flex flex-col gap-5 bg-white p-4">
          <div className="flex flex-row items-center justify-between gap-[20px]">
            <div className="text-[20px] font-bold">Add product to quote</div>
            <div className="mr-5 flex flex-row items-center gap-5 text-[14px]">
              <div>Currency: CAD</div>
              <hr className="h-auto w-[1px] self-stretch bg-[rgba(0,0,0,0.12)]" />
              <div>
                <RotateCw className="cursor-pointer text-gray-400" />
              </div>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full table-auto border-collapse border">
              <thead className="bg-[#ededed] [&_th]:p-[12px] [&_th]:text-[12px]">
                <tr className="border-b-[#c9c9cb] uppercase hover:[&>th]:cursor-pointer">
                  <th className="">
                    <div className="flex items-center justify-center gap-1">
                      <div>Line Items</div>
                      {/* <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div> */}
                    </div>
                  </th>
                  <th className="">
                    <div className="flex items-center justify-center gap-1">
                      <div>Qty</div>
                      {/* <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div> */}
                    </div>
                  </th>
                  <th className="">
                    <div className="flex items-center justify-center gap-1">
                      <div>Unit Price</div>
                      {/* <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div> */}
                    </div>
                  </th>
                  <th className="">
                    <div className="flex items-center justify-center gap-1">
                      <div>Extended Price</div>
                    </div>
                  </th>
                  {/* <th className="">
                    <div className="flex items-center justify-center gap-1">
                      <div>Discount</div>
                      =
                    </div>
                  </th>
                  <th className="">
                    <div className="flex items-center justify-center gap-1">
                      <div>Subtotal</div>
                      
                    </div>
                  </th>
                  <th className="">
                    <div className="flex items-center justify-center gap-1">
                      <div>Quoted Subtotal</div>
                      
                    </div>
                  </th> */}
                  <th className="">
                    <div className="text-[#5C5C5C]">Action</div>
                  </th>
                </tr>
              </thead>
              <tbody className="[&_td]:p-[12px] [&_td]:text-center [&_td]:text-[12px] [&_td]:font-normal [&_tr:last-child]:[border-bottom:none;] [&_tr:last-child_td:last-child_.tooltip]:top-0 [&_tr:last-child_td:last-child_.tooltip]:translate-y-[-100%] [&_tr]:border-b [&_tr]:border-b-[#f6f7fb]">
                <tr>
                  <td className="min-w-[200px] max-w-[300px] [word-break:break-word]">
                    <div className="flex flex-row items-start gap-1">
                      <div className="min-h-[60px] min-w-[60px]">
                        <BcImage
                          width={60}
                          height={60}
                          unoptimized={true}
                          alt="product image"
                          src={CartIcon}
                        />
                      </div>
                      <div className="flex flex-col gap-[2px] text-left text-[12px]">
                        <div>
                          CHROMSPEC UV Syringe Filters, 25 mm, PVDF, 0.45 µm , Non-Sterile, with
                          Pre-Filter, Non-cancellable, Non-returnable, Please Note: Multiple
                          packages will be supplied in bulk, unless otherwise requested.
                        </div>
                        <div className="font-bold">
                          <span>SKU: </span>
                          <span>CSUV25P451PF</span>
                        </div>
                        {/* <div>
                          <div>Notes:</div>
                          <div>
                            <textarea
                              name=""
                              className="h-[52px] resize-none rounded-[5px] border border-gray-200 p-[10px_14px] outline-none"
                              id=""
                            ></textarea>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </td>
                  <td className="cursor-pointer">
                    <div>
                      <input
                        type="number"
                        className="w-full border-b border-b-black outline-none"
                      />
                    </div>
                  </td>
                  <td className="">$1,951.00</td>
                  <td className="">
                    <div>
                      <input
                        type="number"
                        className="w-full border-b border-b-black outline-none"
                      />
                    </div>
                  </td>
                  {/* <td className="">
                    <div>
                      <input
                        type="number"
                        className="w-full border-b border-b-black outline-none"
                      />
                    </div>
                  </td>
                  <td className="">$1,951.00</td>
                  <td className="">$1,951.00</td> */}
                  <td>
                    <div className="flex items-center justify-center gap-1 text-[#555]">
                      <PopOverClick popOverContents={popOverContents} from="edit">
                        <Ellipsis className="cursor-pointer text-[#555]" />
                      </PopOverClick>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex flex-row">
            <div className="flex flex-1 flex-col gap-[20px]">
              <div className="box-border flex flex-row justify-start bg-[#ededed] text-[12px] [&>button]:min-w-[150px] [&>button]:p-[12px] [&>button]:uppercase">
                <button className="border-b-2 border-b-[#3C64F4] text-[#3C64F4]">Search</button>
                <button className="hover:border-b-2 hover:border-b-[#3C64F4] hover:text-[#3C64F4]">
                  Search By SKU
                </button>
                <button className="hover:border-b-2 hover:border-b-[#3C64F4] hover:text-[#3C64F4]">
                  Custom Product
                </button>
              </div>
              <div className="flex flex-row items-center justify-start gap-[30px]">
                <div className="flex w-fit min-w-[300px] flex-row items-center justify-between gap-[10px] rounded-[5px] border border-gray-200 p-[5px] text-[12px]">
                  <div className="relative w-full">
                    <input
                      type="text"
                      className="w-full pr-5 outline-none"
                      placeholder="Search for products with keywords"
                    />
                    <X
                      width={16}
                      height={16}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-row items-center gap-[10px]">
                    <hr className="h-auto w-[1px] self-stretch bg-[rgba(0,0,0,0.12)]" />
                    <Search className="cursor-pointer" />
                  </div>
                </div>
                <div>
                  <NewProductQuote >
                  <button className='rounded-[5px] bg-[#3C64F4] p-[6px_16px] text-[12px] uppercase text-white hover:bg-[#3C64F4]/90'>New +</button>
                  </NewProductQuote>
                </div>
              </div>
              <div className="flex h-[128px] flex-col items-center justify-center gap-5 border border-gray-200 text-center">
                <div className="text-[14px] text-[rgb(176,182,186)]">No Products Added</div>
                <div className="text-[16px] text-[rgb(63,81,181)]">Use search to add products</div>
              </div>
            </div>
            <div className="flex min-w-[340px] flex-col justify-end gap-[16px] p-[16px] text-[12px]">
              <div className="flex flex-row items-center justify-between">
                <label htmlFor="">Original Total</label>
                <div className="text-left">$2,772.70</div>
              </div>
              {/* <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-[5px]">
                  <label className="" htmlFor="">
                    Original Total
                  </label>
                  <select name="" id="" className="border-b border-b-black outline-none">
                    <option value="">Per Line Item</option>
                    <option value="Total %">Total %</option>
                    <option value="Fixed Amount">Fixed Amount</option>
                  </select>
                </div>
                <div className="text-left">$2,772.70</div>
              </div>
              <div className="flex flex-row items-center justify-between">
                <label htmlFor="">Original Total</label>
                <div className="text-left">$2,772.70</div>
              </div>
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-[5px]">
                  <label className="" htmlFor="">
                    Original Total
                  </label>
                  <select name="" id="" className="border-b border-b-black outline-none">
                    <option value="">Per Line Item</option>
                    <option value="Total %">Total %</option>
                    <option value="Fixed Amount">Fixed Amount</option>
                  </select>
                </div>
                <div className="text-left">$2,772.70</div>
              </div>
              <div className="flex flex-row items-center justify-between">
                <label htmlFor="">Original Total</label>
                <div className="text-left">$2,772.70</div>
              </div> */}
              <div className="flex flex-row items-center justify-between">
                <label htmlFor="">Original Total</label>
                <div className="text-left">$2,772.70</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5 bg-white p-4">
          <div className="flex flex-row items-center gap-[20px]">
            <div className="text-[20px] font-bold">Additional Information</div>
            <button className="rounded-[5px] border border-gray-200 p-[3px_10px] text-[12px] uppercase hover:bg-gray-100">
              EDIT
            </button>
          </div>
          <div className="text-[16px]">Notes:</div>
          <div className="flex flex-col gap-1 text-[12px]">
            <div className="text-[16px]">Terms and Conditions:</div>
            <div className="flex flex-col">
              <div>All Orders are subject to credit approval at the time of order.</div>
              <div>
                Freight /*TDG/**Dry Ice/***Ice Pack - Charges are extra per shipment if applicable.
              </div>
              <div>Delivery will be confirmed at the time of order</div>
              <div>
                If the delivery time quoted does not meet your requirements, we may be able to offer
                an Expedited shipment at an additional cost. Please enquire.
              </div>
              <div>
                The pricing is based on the purchase of the specified quantity on one (1) Purchase
                Order.
              </div>
            </div>
          </div>
          <div className="text-[12px]">
            NOTE: If your quote contains product(s) without online pricing (Indicated by “Contact
            for Pricing” or a price of “$0.01”), your pricing will be confirmed within 1 business
            day.
          </div>
        </div>
        <div className="flex flex-col gap-5 bg-white p-4">
          <div>Message</div>
          <textarea
            name=""
            className="h-[100px] w-full resize-none rounded-[5px] border border-gray-200 p-3 outline-none"
            id=""
          ></textarea>
          <button className="w-fit self-end rounded-[5px] bg-[#ededed] p-[6px_16px] uppercase hover:bg-[#ededed]/90">
            Add Message
          </button>
        </div>
        <div className="flex flex-col gap-5 bg-white p-4">
          <div className="text-[20px] font-bold">Attachments</div>
          <div className="flex flex-row justify-start gap-[20px] text-[12px]">
            <div className="flex flex-1 flex-col justify-between gap-[20px]">
              <div className="relative">
                <input type="file" id="upload-file" className="z-10 h-full w-full cursor-pointer" />
                <label
                  htmlFor="upload-file"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-[5px] bg-[#3C64F4] p-[4px_16px] uppercase text-white hover:bg-[#3C64F4]/80"
                >
                  Upload File
                </label>
              </div>
              <div>No Attachments</div>
            </div>
            <div className="flex flex-1 flex-col justify-between gap-[20px]">
              <div className="text-[16px] font-medium">Uploaded By Customer</div>
              <div>No Attachments</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5 bg-white p-4">
          <div className="text-[20px] font-bold">Video URL</div>
          <div className="flex flex-row justify-start gap-[20px] text-[12px]">
            <div className="flex flex-1 flex-col justify-between gap-[20px]">
              <div className="relative mr-[30px] flex flex-row items-center gap-[20px]">
                <input
                  type="text"
                  id="upload-file"
                  className="flex-1 cursor-pointer border-b border-b-black p-[5px] outline-none"
                />
                <button className="cursor-pointer rounded-[5px] bg-[#3C64F4] p-[4px_16px] uppercase text-white hover:bg-[#3C64F4]/80">
                  Upload URL
                </button>
              </div>
              <div>No Attachments</div>
            </div>
            <div className="flex flex-1 flex-col justify-between gap-[20px]">
              <div className="text-[16px] font-medium">Uploaded By Customer</div>
              <div>No Attachments</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
