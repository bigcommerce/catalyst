import React from 'react';
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
  CalendarDays,
} from 'lucide-react';
import DatePicker from './_components';
import NewQuote from './_components/newQuote';

const page = () => {
  return (
    <div className="my-[2rem] flex justify-center text-[#353535]">
      <div className="flex w-[90%] flex-col gap-[30px]">
        <div className="mt-[30px] text-center text-[20px] font-bold leading-[32px]">Quotes</div>
        <div className="flex flex-col gap-[30px]">
          <div className="flex flex-col gap-[30px] rounded-[10px] p-2 [box-shadow:0px_0px_20px_#ddd;]">
            <div className="flex flex-col gap-5 px-[30px] pt-2">
              <div className="grid grid-cols-4 items-center gap-5">
                <div>
                  <input
                    className="w-full border-b border-b-black outline-none"
                    type="text"
                    placeholder="Customer Name or Quote Id"
                  />
                </div>
                <div>
                  <input
                    className="w-full border-b border-b-black outline-none"
                    type="text"
                    placeholder="Company"
                  />
                </div>
                <div>
                  <DatePicker placeholder="Requested From Date" />
                </div>
                <div>
                  <DatePicker placeholder="Requested From Date" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-5">
                <button className="flex cursor-pointer items-center justify-center rounded-[20px] border border-brand-600 bg-brand-600 p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-brand-600">
                  Search
                </button>
                <button className="flex cursor-pointer items-center justify-center rounded-[20px] border border-brand-600 bg-brand-600 p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-brand-600">
                  Show All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-5 pb-2">
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
          </div>
          <div className="flex items-center justify-end gap-5 px-[38px]">
            <NewQuote>
            <button className="flex cursor-pointer items-center justify-center rounded-[20px] border border-brand-600 bg-brand-600 p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-brand-600">
              New Quote
            </button>
            </NewQuote>
            <button className="flex cursor-pointer items-center justify-center rounded-[20px] border border-brand-600 bg-brand-600 p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-brand-600">
              Edit View
            </button>
          </div>
          <table className="table-auto border-collapse border border-gray-400">
            <thead className="bg-[#f0f0f0] [&_th]:text-[13px] [&_th]:font-bold">
              <tr className="border border-gray-400 hover:[&>th]:cursor-pointer">
                <th className="p-3">
                  <div className="flex items-center justify-center gap-1">
                    <div>Quote ID</div>
                    <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div>
                  </div>
                </th>
                <th className="p-3">
                  <div className="flex items-center justify-center gap-1">
                    <div>Customer Name</div>
                    <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div>
                  </div>
                </th>
                <th className="p-3">
                  <div className="flex items-center justify-center gap-1">
                    <div>Company</div>
                    <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div>
                  </div>
                </th>
                <th className="p-3">
                  <div className="flex items-center justify-center gap-1">
                    <div>Customer Email</div>
                    <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div>
                  </div>
                </th>
                <th className="p-3">
                  <div className="flex items-center justify-center gap-1">
                    <div>Date Requested</div>
                    <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div>
                  </div>
                </th>
                <th className="p-3">
                  <div className="flex items-center justify-center gap-1">
                    <div>Date Quoted</div>
                    <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div>
                  </div>
                </th>
                <th className="p-3">
                  <div className="flex items-center justify-center gap-1">
                    <div>Quoted By</div>
                    <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div>
                  </div>
                </th>
                <th className="p-3">
                  <div className="flex items-center justify-center gap-1">
                    <div>Status</div>
                    <div>
                      <ArrowUpDown className="text-brand-500" width={16} height={16} />
                    </div>
                  </div>
                </th>
                <th className="p-3">
                  <div>Action</div>
                </th>
              </tr>
            </thead>
            <tbody className="[&_td]:p-[3px] [&_td]:text-center [&_td]:text-[12px] [&_td]:font-normal [&_tr:last-child]:[border-bottom:none;] [&_tr]:border-b [&_tr]:border-b-gray-400">
              <tr>
                <td className="cursor-pointer">QI-62</td>
                <td>Bala S</td>
                <td>Arizon Digital</td>
                <td>balashanmugam@arizon.digital</td>
                <td>02/07/2025</td>
                <td>-</td>
                <td>-</td>
                <td>
                  <button className="flex cursor-pointer items-center justify-center rounded-[20px] border border-brand-400 bg-brand-400 p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-brand-400">
                    Show All
                  </button>
                </td>
                <td>
                  <div className="flex items-center justify-center gap-1 hover:[&>*]:text-brand-400">
                    <NotebookPen className="cursor-pointer" width={20} height={20} />
                    <Eye className="cursor-pointer text-[#CCCBCB]" width={20} height={20} />
                    <Copy className="cursor-pointer text-[#CCCBCB]" width={20} height={20} />
                    <Download className="cursor-pointer" width={20} height={20} />
                  </div>
                </td>
              </tr>
              <tr>
                <td>QI-62</td>
                <td>Bala S</td>
                <td>Arizon Digital</td>
                <td>balashanmugam@arizon.digital balashanmugam@arizon.digital</td>
                <td>02/07/2025</td>
                <td>-</td>
                <td>-</td>
                <td>
                  <button className="flex cursor-pointer items-center justify-center rounded-[20px] border border-brand-400 bg-brand-400 p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-brand-400">
                    Show All
                  </button>
                </td>
                <td>
                  <div className="flex items-center justify-center gap-1 hover:[&>*]:text-brand-400">
                    <NotebookPen className="cursor-pointer" width={20} height={20} />
                    <Eye className="cursor-pointer text-[#CCCBCB]" width={20} height={20} />
                    <Copy className="cursor-pointer text-[#CCCBCB]" width={20} height={20} />
                    <Download className="cursor-pointer" width={20} height={20} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex items-center justify-center gap-[15px]">
            <button className="rounded-[50%] border border-brand-600 p-[5px_10px] text-[14px] hover:bg-brand-600 hover:text-white">
              «
            </button>
            <button className="flex items-center justify-center rounded-[50%] border border-brand-600 p-[5px_10px] text-[14px] hover:bg-brand-600 hover:text-white">
              1
            </button>
            <button className="flex items-center justify-center rounded-[50%] border border-brand-600 p-[5px_10px] text-[14px] hover:bg-brand-600 hover:text-white">
              2
            </button>
            <button className="flex items-center justify-center rounded-[50%] border border-brand-600 p-[5px_10px] text-[14px] hover:bg-brand-600 hover:text-white">
              3
            </button>
            <button className="rounded-[50%] border border-brand-600 p-[5px_10px] text-[14px] hover:bg-brand-600 hover:text-white">
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
