import React from 'react';

import { X } from 'lucide-react';
import AddDialog from '../_components/addDialog';

const page = () => {
  return (
    <div className="my-[2rem] flex justify-center text-[#353535]">
      <div className="flex w-[90%] flex-col gap-[30px]">
        <div className="mt-[30px] text-center text-[20px] font-bold leading-[32px]">Edit Quote</div>
        <div className="flex flex-col gap-[30px]">
          <div className="flex flex-row items-end gap-[30px]">
            <div className="flex flex-col gap-1 text-[14px]">
              <div>
                <span className="font-bold">Customer Name:</span> <span>Mithran Balaji</span>
              </div>
              <div>
                <span className="font-bold">Date:</span> <span>02/06/2025</span>
              </div>
              <div>
                <span className="font-bold">Quote Id:</span> <span>QI-54</span>
              </div>
            </div>
            <div className="flex flex-1 items-end justify-end gap-[20px]">
              <button className="flex cursor-pointer items-center justify-center rounded-[5px] border-[#8c57ff] border bg-[#8c57ff] p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-[#000] hover:border hover:border-[#1e1e1e]">
                Extend Quote
              </button>
              <button className="flex cursor-pointer items-center justify-center rounded-[5px] border-[#8c57ff] border bg-[#8c57ff] p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-[#000] hover:border hover:border-[#1e1e1e]">
                Cancel Quote
              </button>
              <AddDialog>
              <button className="flex cursor-pointer items-center justify-center rounded-[5px] border-[#8c57ff] border bg-[#8c57ff] p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-[#000] hover:border hover:border-[#1e1e1e] gap-[5px]">
                <span>+</span><span>Add Product</span>
              </button>
              </AddDialog>
            </div>
          </div>
          <table className="table-auto border-collapse border [&_td]:p-3 [&_td]:text-center [&_th]:p-3 [&_th]:text-center">
            <thead className="text-[15px] font-bold bg-[#f6f7fb]">
            <tr className="border border-b-[#c9c9cb] hover:[&>th]:cursor-pointer">
                <th>Sl No</th>
                <th>Items</th>
                <th>Options</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="text-[14px] [&>tr_td:last-child]:px-6 [&>tr_td:nth-child(2)]:!text-left [&_tr:last-child]:[border-bottom:none;] [&_tr]:border-b-[2px] [&_tr]:border-b-[#f6f7fb]">
              <tr className='border-b-[2px]'>
                <td>
                  <div>1</div>
                </td>
                <td>
                  <div className="flex flex-col gap-[10px]">
                    <div>
                      <div>[Sample] Dustpan & Brush</div>
                      <div>
                        <span>SKU:</span> <span className="font-bold">DPB</span>
                      </div>
                    </div>
                    <div>
                      <div>
                        <span>Varient Name:</span> <span className="font-bold"> N/A</span>
                      </div>
                      <div>
                        <span>Varient SKU:</span> <span className="font-bold">N/A</span>
                      </div>
                    </div>
                    
                  </div>
                </td>
                <td>
                  <div>-</div>
                </td>
                <td>
                  <div>
                    <input
                      type="number"
                      className="w-1/2 border border-[#e5e7eb] p-[5px] outline-none"
                    />
                  </div>
                </td>
                <td>
                  <div>
                    <span className="pr-1 text-[20px] font-bold">$</span>
                    <input
                      type="number"
                      className="w-1/2 border border-[#e5e7eb] p-[5px] outline-none"
                      placeholder='0.00'
                    />
                  </div>
                </td>
                <td>
                  <div>
                    <span className="pr-1 text-[20px] font-bold">$</span>
                    <input
                      type="number"
                      className="w-1/2 border border-[#e5e7eb] p-[5px] outline-none"
                      defaultValue={0.00}
                    />
                  </div>
                </td>
                <td>
                  <div className="flex justify-center">
                    <X strokeWidth={1} width={15} height={15} />
                  </div>
                </td>
              </tr>

              <tr className='border-b-[2px]'>
                <td>
                  <div>2</div>
                </td>
                <td>
                  <div className="flex flex-col gap-[10px]">
                    <div>
                      <div>[Sample] Dustpan & Brush</div>
                      <div>
                        <span>SKU:</span> <span className="font-bold">DPB</span>
                      </div>
                    </div>
                    <div>
                      <div>
                        <span>Varient Name:</span> <span className="font-bold"> N/A</span>
                      </div>
                      <div>
                        <span>Varient SKU:</span> <span className="font-bold">N/A</span>
                      </div>
                    </div>
                    
                  </div>
                </td>
                <td>
                  <div>-</div>
                </td>
                <td>
                  <div>
                    <input
                      type="number"
                      className="w-1/2 border border-[#e5e7eb] p-[5px] outline-none"
                    />
                  </div>
                </td>
                <td>
                  <div>
                    <span className="pr-1 text-[20px] font-bold">$</span>
                    <input
                      type="number"
                      className="w-1/2 border border-[#e5e7eb] p-[5px] outline-none"
                      placeholder='0.00'
                    />
                  </div>
                </td>
                <td>
                  <div>
                    <span className="pr-1 text-[20px] font-bold">$</span>
                    <input
                      type="number"
                      className="w-1/2 border border-[#e5e7eb] p-[5px] outline-none"
                      defaultValue={0.00}
                    />
                  </div>
                </td>
                <td>
                  <div className="flex justify-center">
                    <X strokeWidth={1} width={15} height={15} />
                  </div>
                </td>
              </tr>


            </tbody>
          </table>
          <div className="grid grid-cols-2 gap-[20px] text-[14px]">
            <div className="border-[2px] border-[#f6f7fb]">
              <div className="bg-[#f6f7fb] p-[5px_12px] text-[15px] text-[#000]">Shipping Address</div>
              <div className="flex flex-col gap-[10px] p-[10px]">
                <div>Mithran Balaji,</div>
                <div>4-15-16 Jinguumae</div>
                <div>Shibuya, Manipur77022</div>
                <div>India</div>
              </div>
            </div>
            <div className="flex flex-col justify-evenly border-[2px] border-[#f6f7fb] [&>div:last-child]:border-none [&>div]:border-b [&>div]:border-b-[#f6f7fb]">
              <div className="flex flex-row items-center justify-between p-[10px]">
                <div>Subtotal:</div>
                <div className="flex flex-row items-center gap-1">
                  <span className='text-[18px]'>$</span>
                  <input className="border border-[#e5e7eb] p-[5px] outline-none" type="number" defaultValue={0.00} />
                </div>
              </div>
              <div className="flex flex-row items-center justify-between p-[10px]">
                <div>Total:</div>
                <div className="flex flex-row items-center gap-1">
                  <span className='text-[18px]'>$</span>
                  <input className="border border-[#e5e7eb] p-[5px] outline-none" type="number" defaultValue={0.00}/>
                </div>
              </div>
              <div className="flex flex-row items-center justify-between p-[10px]">
                <div>Expires:</div>
                <div className="flex flex-row gap-[20px]">
                  <div className="flex flex-row items-center gap-[6px]">
                    <input type="radio" name="" id="" />
                    <label className="font-bold" htmlFor="">
                      10 Days
                    </label>
                  </div>
                  <div className="flex flex-row items-center gap-[6px]">
                    <input type="radio" name="" id="" />
                    <label className="font-bold" htmlFor="">
                      10 Days
                    </label>
                  </div>
                  <div className="flex flex-row items-center gap-[6px]">
                    <input type="radio" name="" id="" />
                    <label className="font-bold" htmlFor="">
                      10 Days
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-6 border border-[#e5e7eb] p-3 [grid-template-columns:20%_70%;] [&>div:nth-child(even)]:text-[14px]">
            {/* <div className="text-[16px] font-bold">Quote Condition1:</div>
            <div className="flex flex-col gap-[10px] text-[14px]">
              <div className="flex flex-row items-center gap-[6px]">
                <input type="radio" name="" id="" />
                <label htmlFor="">10 Days</label>
              </div>
              <div className="flex flex-row items-center gap-[6px]">
                <input type="radio" name="" id="" />
                <label htmlFor="">10 Days</label>
              </div>
              <div className="flex flex-row items-center gap-[6px]">
                <input type="radio" name="" id="" />
                <label htmlFor="">10 Days</label>
              </div>
              <div className="flex flex-row items-center gap-[6px]">
                <input type="radio" name="" id="" />
                <label htmlFor="">10 Days</label>
              </div>
            </div> */}

            <div className="text-[16px] font-bold">Notes:</div>
            <div>
              <textarea
                name=""
                className="h-[100px] w-full border border-[#e5e7eb] p-[5px] outline-none"
                id=""
              ></textarea>
            </div>

            <div className="text-[16px] font-bold">Quoted By:</div>
            <div>
              <input
                type="text"
                className="w-full border border-[#e5e7eb] p-[5px] text-[15px] font-normal outline-none"
              />
            </div>

            <div className="text-[16px] font-bold">Phone Number:</div>
            <div>
              <input
                type="text"
                className="w-full border border-[#e5e7eb] p-[5px] text-[15px] font-normal outline-none"
              />
            </div>

            <div className="text-[16px] font-bold">Video:</div>
            <div>
              <input
                type="text"
                className="w-full border border-[#e5e7eb] p-[5px] text-[15px] font-normal outline-none"
              />
            </div>

            <div className="text-[16px] font-bold">Attachement:</div>
            <div>
              <input
                type="file"
                className="w-full border border-[#e5e7eb] p-[5px] text-[15px] font-normal outline-none"
              />
              <span className="mt-[10px] block text-[14px] font-bold text-[#A71F23]">
                Note: The following formats are allowed: PDF, DOC, XLS, PPT, JPG, MP3, PNG
              </span>
            </div>
          </div>
          <div className="flex flex-row justify-end gap-[20px]">
            <button className="flex cursor-pointer items-center justify-center rounded-[5px] border-[#8c57ff] border bg-[#8c57ff] p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-[#000] hover:border hover:border-[#1e1e1e]">
              Send Quote
            </button>
            <button className="flex cursor-pointer items-center justify-center rounded-[5px] border-[#8c57ff] border bg-[#8c57ff] p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-[#000] hover:border hover:border-[#1e1e1e]">
              Save Quote
            </button>
            <button className="flex cursor-pointer items-center justify-center rounded-[5px] border-[#8c57ff] border bg-[#8c57ff] p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-[#000] hover:border hover:border-[#1e1e1e]">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
