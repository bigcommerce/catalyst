'use client';
import React, { useState } from 'react';
import {
  ArrowUpDown,
  Download,
  Eye,
  Copy,
  NotebookPen,
  Menu,
  MailOpen,
  ClipboardCheck,
  Filter,
  X,
  MailX,
  MailCheck,
  Plus,
  EllipsisVertical,
  CalendarDays,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import DatePicker from './_components';
import NewQuote from './_components/newQuote';

const page = () => {
  const [activeTab, setActiveTab] = useState("All");

  const tabs = [
    { name: "All", icon: <Menu width={26} height={26} stroke='#000' /> },
    { name: "Open", icon: <MailOpen width={26} height={26} /> },
    { name: "Quote Not Sent", icon: <MailX width={26} height={26} /> },
    { name: "Quoted", icon: <MailCheck width={26} height={26} /> },
    { name: "Converted", icon: <ClipboardCheck width={26} height={26} /> },
    { name: "Expired", icon: <Filter width={26} height={26} /> },
    { name: "Cancelled", icon: <X width={26} height={26} /> },
  ];



  return (
    <div className="my-[2rem] flex justify-center text-[#353535]">
      <div className="flex w-[90%] flex-col gap-[30px]">
        <div className="flex flex-col gap-[30px]">
          <div className="flex flex-col gap-[30px] rounded-[10px] p-2 [box-shadow:0px_0px_20px_#ddd;]">
            <div className="flex flex-col gap-5 px-[30px] pt-2">
             <div className="mt-[30px] text-[20px] font-bold leading-[32px]">Quotes</div>
              <div className="grid grid-cols-4 items-center gap-5">
                <div >
                  <input
                    className="w-full border border outline-none p-2 rounded-[5px]"
                    type="text"
                    placeholder="Customer Name or Quote Id"
                  />
                </div>
                <div>
                  <input
                    className="w-full border border outline-none p-2 rounded-[5px]"
                    type="text"
                    placeholder="Company"
                  />
                </div>
                <div>
                  <DatePicker placeholder="Requested From Date"  />
                </div>
                <div>
                  <DatePicker placeholder="Requested From Date" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-5">
                <button className="flex cursor-pointer items-center justify-center rounded-[5px] border-[#8c57ff] border-brand-600 bg-[#8c57ff] p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-brand-600">
                  Search
                </button>
                <button className="flex cursor-pointer items-center justify-center rounded-[5px] border-[#8c57ff] border-brand-600 bg-[#8c57ff] p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-brand-600">
                  Show All
                </button>
              </div>
            </div>
          <div className="grid grid-cols-7 gap-5 pb-3 border-b-[#c9c9cb]">
              {
              tabs.map((tab) => (
                <div
                  key={tab.name}
                  className={`flex flex-col items-center gap-[5px] cursor-pointer ${
                    activeTab === tab.name
                      ? "text-[#000]" 
                      : "hover:text-brand-[#000]"
                  }`}
                  onClick={() => setActiveTab(tab.name)}
                >
                  <div  className={`custom-svg ${activeTab === tab.name ? "text-[#000]":""}`}>{tab.icon}</div>
                  <div
                    className={`pb-1 text-[14px] ${
                      activeTab === tab.name ? "border-b-[3px] border-brand-500" : ""
                    }`}
                  >
                    {tab.name}
                  </div>
                </div>
              ))
              }
            </div>
            {/* <div className="grid grid-cols-7 gap-5 pb-2">
              <div className="flex flex-col items-center gap-[5px] hover:cursor-pointer hover:text-brand-400">
                <div>
                  <Menu width={26} height={26} />
                </div>
                <div className="border-b-[3px] border-brand-500 pb-1 text-[14px]">All</div>
              </div>
              <div className="flex flex-col items-center gap-[5px] hover:cursor-pointer hover:text-brand-400">
                <div>
                  <MailOpen width={26} height={26} />
                </div>
                <div className="border-b-[3px] border-brand-500 pb-1 text-[14px]">Open</div>
              </div>
              <div className="flex flex-col items-center gap-[5px] hover:cursor-pointer hover:text-brand-400">
                <div>
                  <MailX width={26} height={26} />
                </div>
                <div className="border-b-[3px] border-brand-500 pb-1 text-[14px]">
                  Quote Not Sent
                </div>
              </div>
              <div className="flex flex-col items-center gap-[5px] hover:cursor-pointer hover:text-brand-400">
                <div>
                  <MailCheck width={26} height={26} />
                </div>
                <div className="border-b-[3px] border-brand-500 pb-1 text-[14px]">Quoted</div>
              </div>
              <div className="flex flex-col items-center gap-[5px] hover:cursor-pointer hover:text-brand-400">
                <div>
                  <ClipboardCheck width={26} height={26} />
                </div>
                <div className="border-b-[3px] border-brand-500 pb-1 text-[14px]">Converted</div>
              </div>
              <div className="flex flex-col items-center gap-[5px] hover:cursor-pointer hover:text-brand-400">
                <div>
                  <Filter width={26} height={26} />
                </div>
                <div className="border-b-[3px] border-brand-500 pb-1 text-[14px]">Expired</div>
              </div>
              <div className="flex flex-col items-center gap-[5px] hover:cursor-pointer hover:text-brand-400">
                <div>
                  <X width={26} height={26} />
                </div>
                <div className="border-b-[3px] border-brand-500 pb-1 text-[14px]">Cancelled</div>
              </div>
            </div>
          </div> */}

          <div className="flex items-center justify-end gap-5 px-[38px]">
            <button className="flex cursor-pointer items-center justify-center rounded-[5px] border-[#8c57ff] border-brand-600 bg-[#8c57ff] p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-brand-600">
              Export
            </button>
            <NewQuote>
            <button className="flex cursor-pointer items-center justify-center rounded-[5px] border-[#8c57ff] border-brand-600 bg-[#8c57ff] p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-brand-600">
             <Plus width={15} height={15}/> Create a Quote
            </button>
            </NewQuote>
          </div>

          <table className="table-auto border-collapse border">
            <thead className="bg-[#f6f7fb] [&_th]:text-[13px] [&_th]:font-bold">
              <tr className="hover:[&>th]:cursor-pointer uppercase border-b-[#c9c9cb]">
                <th className="p-3">
                  <div className="flex items-center justify-center gap-1 text-[#5C5C5C]">
                    <div>Quote ID</div>
                    {/* <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div> */}
                  </div>
                </th>
                <th className="p-3">
                  <div className="flex items-center justify-center gap-1 text-[#5C5C5C]">
                    <div>Customer Name</div>
                    {/* <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div> */}
                  </div>
                </th>
                <th className="p-3">
                  <div className="flex items-center justify-center gap-1 text-[#5C5C5C]">
                    <div>Company</div>
                    {/* <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div> */}
                  </div>
                </th>
                <th className="p-3">
                  <div className="flex items-center justify-center gap-1 text-[#5C5C5C]">
                    <div>Customer Email</div>
                    {/* <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div> */}
                  </div>
                </th>
                <th className="p-3">
                  <div className="flex items-center justify-center gap-1 text-[#5C5C5C]">
                    <div>Date Requested</div>
                    {/* <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div> */}
                  </div>
                </th>
                <th className="p-3">
                  <div className="flex items-center justify-center gap-1 text-[#5C5C5C]">
                    <div>Date Quoted</div>
                    {/* <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div> */}
                  </div>
                </th>
                <th className="p-3">
                  <div className="flex items-center justify-center gap-1 text-[#5C5C5C]">
                    <div>Quoted By</div>
                    {/* <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div> */}
                  </div>
                </th>
                <th className="p-3">
                  <div className="flex items-center justify-center gap-1 text-[#5C5C5C]">
                    <div>Status</div>
                    {/* <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div> */}
                  </div>
                </th>
                <th className="p-3">
                  <div className='text-[#5C5C5C]'>Action</div>
                </th>
              </tr>
            </thead>
            <tbody className="[&_td]:p-[3px] [&_td]:text-center [&_td]:text-[12px] [&_td]:font-normal [&_tr:last-child]:[border-bottom:none;] [&_tr]:border-b [&_tr]:border-b-[#f6f7fb]">
              <tr>
                <td className="cursor-pointer text-[#8c57ff]">QI-62</td>
                <td className='text-[#000]'>Bala S</td>
                <td className='text-[#000]'>Arizon Digital</td>
                <td className='text-[#555]'>balashanmugam@arizon.digital</td>
                <td className='text-[#555]'>02/07/2025</td>
                <td className='text-[#555]'>-</td>
                <td className='text-[#555]'>-</td>
                <td>
                <button className="px-4 py-2 rounded-full bg-blue-100 text-blue-500 font-bold">
                  Open
                </button>
                  {/* <button className="flex cursor-pointer items-center justify-center rounded-[5px] border border-brand-400 bg-brand-400 p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-brand-400">
                    Show All
                  </button> */}
                </td>
                <td>
                  <div className="flex items-center justify-center gap-1 text-[#555] hover:[&>*]:text-brand-400">
                    <EllipsisVertical className='text-[#555]'/>
                    {/* <NotebookPen className="cursor-pointer" width={20} height={20} />
                    <Eye className="cursor-pointer text-[#CCCBCB]" width={20} height={20} />
                    <Copy className="cursor-pointer text-[#CCCBCB]" width={20} height={20} />
                    <Download className="cursor-pointer" width={20} height={20} /> */}
                  </div>
                </td>
              </tr>
              <tr>
                <td className='cusrsor-pointer text-[#8c57ff]'>QI-62</td>
                <td className='text-[#000]'>Bala S</td>
                <td className='text-[#000]'>Arizon Digital</td>
                <td className='text-[#555]'>balashanmugam@arizon.digital balashanmugam@arizon.digital</td>
                <td className='text-[#555]'>02/07/2025</td>
                <td className='text-[#555]'>-</td>
                <td className='text-[#555]'>-</td>
                <td>
                <button className="px-4 py-2 rounded-full bg-blue-100 text-blue-500 font-bold">
                  Open
                </button>
                </td>
                <td>
                  <div className="flex items-center justify-center text-[#555] gap-1 hover:[&>*]:text-brand-400">
                    <EllipsisVertical className='text-[#555]'/>
                    {/* <NotebookPen className="cursor-pointer" width={20} height={20} />
                    <Eye className="cursor-pointer text-[#CCCBCB]" width={20} height={20} />
                    <Copy className="cursor-pointer text-[#CCCBCB]" width={20} height={20} />
                    <Download className="cursor-pointer" width={20} height={20} /> */}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex items-center justify-end gap-[15px]">
           <div className="flex items-end">
                <span className='text-[13px]'>Rows per page:</span>
                <select className="bg-transparent border-none rounded-md px-0 text-[13px]">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
            </div>
            <div className='relative pr-1'>
            <button className="p-[3px] text-[13px]">
              <ChevronLeft width={15} height={15}/>
            </button>
            <button className="p-[3px] text-[13px]">
            <ChevronRight width={15} height={15}/>
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default page;
