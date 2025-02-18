'use client';
import React, { useEffect, useRef, useState } from 'react';
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
  Ellipsis,
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  Search,
  ListFilter,
  Settings,
} from 'lucide-react';
import DatePicker from './_components';
import NewQuote from './_components/newQuote';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SettingFlyout from './_components/SettingFlyout';
import PopOverClick from './_components/PopOverClick';
import { GetAllQuoteList } from './actions/GetAllQuoteList';
import { RequestQuoteFlyout } from './_components/RequestQuoteFlyout';



interface IFlyoutProps {
  onClose: (event: Event) => void;
}
const page = () => {
  const router = useRouter();
  const menuRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const [activeTab, setActiveTab] = useState('All');
  const [showEdit, setShowEdit] = useState<{ [key: string]: boolean }>({});
  const [data, setData] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    dateFrom: '',
    dateTo: '',
    phone: '',
    qouteId:''
  });
  const [isShippingOpen, setIsShippingOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsShippingOpen(open);
  };

  const tabs = [
    { name: 'All', icon: <Menu width={26} height={26} stroke="#000" /> },
    { name: 'Open', icon: <MailOpen width={26} height={26} /> },
    { name: 'Quote Not Sent', icon: <MailX width={26} height={26} /> },
    { name: 'Quoted', icon: <MailCheck width={26} height={26} /> },
    { name: 'Converted', icon: <ClipboardCheck width={26} height={26} /> },
    { name: 'Expired', icon: <Filter width={26} height={26} /> },
    { name: 'Cancelled', icon: <X width={26} height={26} /> },
  ];

  const settingDatas = [
    'Quote Number',
    'Name',
    'Company',
    'Sales Rep',
    'Date Updated',
    'Total',
    'Status',
    'Quote Title',
    'Date Created',
    'Expiration',
  ];

  const popOverContents = [
    { key: "edit", label: "Edit" },
    { key: "view", label: "View" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(menuRefs.current).forEach((rowId) => {
        if (menuRefs.current[rowId] && !menuRefs.current[rowId]!.contains(event.target as Node)) {
          setShowEdit((prev) => ({
            ...prev,
            [rowId]: false,
          }));
        }
      });
    };

    const formatDate = (dateString: string) => {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const GetAllQuoteData = async () => {
      var result = await GetAllQuoteList({});
      var data = result.output;
      const formattedData = data?.map((quote:any) => ({
        id: `QR-${quote.qr_id}`,  // Prefixing ID with 'QI-'
        name: `${quote.first_name} ${quote.last_name}`, // Combining first and last name
        company: quote.company_name || "N/A",  // Default if null
        email: quote.email_id || "N/A",  // Default if null
        date: formatDate(quote.requested_date), // Format the date
        quote_id: quote.quote_id,  // Quote ID
        status: quote.quote_status,  // Status
      }));
      setData(formattedData);
    }
    GetAllQuoteData()
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleEditMenu = (rowId: string) => {
    setShowEdit((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const handleEditClick = (rowId: string, mode: string) => {
    router.push(`/sales-buddy/quote/${rowId}?mode=${mode}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterValues((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = async() => {
    var result = await GetAllQuoteList(filterValues);
    var data = result.output;
    const formattedData = data?.map((quote: any) => ({
      id: `QR-${quote.qr_id}`,  // Prefixing ID with 'QI-'
      name: `${quote.first_name} ${quote.last_name}`, // Combining first and last name
      company: quote.company_name || "N/A",  // Default if null
      email: quote.email_id || "N/A",  // Default if null
      date: formatDate(quote.requested_date), // Format the date
      quote_id: quote.quote_id,  // Quote ID
    }));
    setData(formattedData);
    // Call your function with filterValues here
  };

  return (
    <div className="my-[2rem] flex justify-center text-[#353535]">
      <div className="flex w-[95%] flex-col gap-[30px]">
        <div className="flex flex-col gap-[30px]">
          <div className='flex flex-row justify-between gap-[30px] items-center'>
            <div className='text-[30px] font-semibold text-[rgb(79,82,92)]'>Quotes</div>
            <div className=''>
              <button  onClick={() => handleOpenChange(true)}
              className="bg-[rgb(60,100,244)] text-[14px] font-semibold text-white hover:bg-transparent hover:text-[rgb(60,100,244)] p-[6px_16px] rounded-[5px] mr-5"
            >
            <RequestQuoteFlyout />

            </button>

            </div>
          </div>
          <div className="flex flex-col gap-[30px] rounded-[10px] p-2 [box-shadow:0px_0px_20px_#ddd;]">
            {/* first div */}
            <div className="flex flex-row items-center gap-[20px] px-[20px] pt-[20px]">
              <div className="relative flex-1">
                <Search className="absolute left-[10px] top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  className="w-full rounded-[5px] border border-gray-200 p-2 pl-[30px] text-[14px] outline-none"
                  placeholder="Search quotes by quote number, quote title, company, sales staff, and creator"
                  type="text"
                />
              </div>
              <div className="h-full">
                <button
                  className="flex h-full min-w-[140px] flex-row items-center justify-center gap-2 rounded-[10px] text-[rgb(60,100,244)] hover:bg-[rgba(172,185,232,0.2)]"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <ListFilter />
                  <span>Add Filters</span>
                </button>
              </div>
            </div>
            {/* second div */}
            {showFilters && (
              <div className="-mt-[10px] px-[20px]">
                <div className="flex flex-col gap-[20px] bg-neutral-100 p-[20px] [&_input]:text-[14px] [&_label]:text-[12px] [&_select]:text-[14px]">
                  <div className="grid grid-cols-3 gap-[20px_10px] [&_input]:border [&_input]:border-gray-200 [&_select]:border [&_select]:border-gray-200">
                    <div className="flex flex-col items-start gap-1">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={filterValues.firstName}
                        onChange={handleFilterChange}
                        className="w-full rounded-[5px] border border-black p-2 outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={filterValues.lastName}
                        onChange={handleFilterChange}
                        className="w-full rounded-[5px] border border-black p-2 outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={filterValues.email}
                        onChange={handleFilterChange}
                        className="w-full rounded-[5px] border border-black p-2 outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <label htmlFor="company">Company</label>
                      <input
                        type="text"
                        name="company"
                        value={filterValues.company}
                        onChange={handleFilterChange}
                        className="w-full rounded-[5px] border border-black p-2 outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <label htmlFor="dateFrom">Date created</label>
                      <div className="flex w-full items-center justify-between gap-[20px]">
                        <DatePicker
                          placeholder="From"
                          name="dateFrom"
                          value={filterValues.dateFrom}
                          onChange={handleFilterChange}
                        />
                        to
                        <DatePicker
                          placeholder="To"
                          name="dateTo"
                          value={filterValues.dateTo}
                          onChange={handleFilterChange}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <label htmlFor="phone">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={filterValues.phone}
                        onChange={handleFilterChange}
                        className="w-full rounded-[5px] border border-black p-2 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-[15px] self-end [&_button]:h-[35px] [&_button]:min-w-[50px] [&_button]:rounded-[5px] [&_button]:border [&_button]:border-[rgb(60,100,244)] [&_button]:px-[20px]">
                    <button className="bg-transparent text-[14px] font-semibold text-[rgb(60,100,244)] hover:bg-[rgb(60,100,244)] hover:text-white">
                      Clear
                    </button>
                    <button
                      className="bg-[rgb(60,100,244)] text-[14px] font-semibold text-white hover:bg-transparent hover:text-[rgb(60,100,244)]"
                      onClick={applyFilters}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* <div className="box-border flex h-[35px] flex-row gap-0 px-[20px] text-[12px] uppercase">
              <button className="min-w-[150px] p-[0.5rem_1rem] text-[rgba(0,0,0,0.54)] hover:border-b-2 hover:border-b-[rgb(60,100,244)] hover:bg-[rgba(172,185,232,0.2)] hover:text-[rgb(60,100,244)]">
                QUOTES
              </button>
              <button className="min-w-[150px] p-[0.5rem_1rem] text-[rgba(0,0,0,0.54)] hover:border-b-2 hover:border-b-[rgb(60,100,244)] hover:bg-[rgba(172,185,232,0.2)] hover:text-[rgb(60,100,244)]">
                ARCHIEVED
              </button>
            </div> */}
            <div className="flex flex-row items-center justify-between px-[20px]">
              <div className="text-[16px] font-medium">19 Quotes</div>
              <div className="flex flex-row items-center gap-4">
                <div>
                  <SettingFlyout settingDatas={settingDatas}>
                    <Settings className="cursor-pointer" />
                  </SettingFlyout>
                </div>
                <div>
                  <select
                    name=""
                    id=""
                    className="cursor-pointer rounded-[5px] border p-2 outline-none"
                  >
                    <option value="">1 - 19 of 19</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                  </select>
                </div>
                <div className="flex flex-row items-center gap-2">
                  <ChevronLeft className="cursor-pointer" />
                  <ChevronRight className="cursor-pointer" />
                </div>
              </div>
            </div>

            {/* <div className="flex flex-col gap-5 px-[30px] pt-2">
              <div className="mt-[30px] text-[20px] font-bold leading-[32px]">Quotes</div>
              <div className="grid grid-cols-4 items-center gap-5">
                <div>
                  <input
                    className="w-full rounded-[5px] border p-2 outline-none"
                    type="text"
                    placeholder="Customer Name or Quote Id"
                  />
                </div>
                <div>
                  <input
                    className="w-full rounded-[5px] border p-2 outline-none"
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
                <button className="flex cursor-pointer items-center justify-center rounded-[5px] border border-[#8c57ff] bg-[#8c57ff] p-[5px_25px] text-[13px] text-white hover:border hover:border-[#1e1e1e] hover:bg-white hover:text-[#000]">
                  Search
                </button>
                <button className="flex cursor-pointer items-center justify-center rounded-[5px] border border-[#8c57ff] bg-[#8c57ff] p-[5px_25px] text-[13px] text-white hover:border hover:border-[#1e1e1e] hover:bg-white hover:text-[#000]">
                  Show All
                </button>
              </div>
            </div> */}
            {/* <div className="grid grid-cols-7 gap-5 border-b-[#c9c9cb] pb-3">
              {tabs.map((tab) => (
                <div
                  key={tab.name}
                  className={`flex cursor-pointer flex-col items-center gap-[5px] ${
                    activeTab === tab.name ? 'text-[#000]' : 'hover:text-brand-[#000]'
                  }`}
                  onClick={() => setActiveTab(tab.name)}
                >
                  <div className={`custom-svg ${activeTab === tab.name ? 'text-[#000]' : ''}`}>
                    {tab.icon}
                  </div>
                  <div
                    className={`pb-1 text-[14px] ${
                      activeTab === tab.name ? 'border-b-[3px] border-brand-500' : ''
                    }`}
                  >
                    {tab.name}
                  </div>
                </div>
              ))}
            </div> */}
            {/* <div className="flex items-center justify-end gap-5 px-[38px]">
              <button className="flex cursor-pointer items-center justify-center rounded-[5px] border border-[#8c57ff] bg-[#8c57ff] p-[5px_25px] text-[13px] text-white hover:border hover:border-[#1e1e1e] hover:bg-white hover:text-[#000]">
                Export
              </button>
              <NewQuote>
                <button className="flex cursor-pointer items-center justify-center rounded-[5px] border border-[#8c57ff] bg-[#8c57ff] p-[5px_25px] text-[13px] text-white hover:border hover:border-[#1e1e1e] hover:bg-white hover:text-[#000]">
                  <Plus width={15} height={15} /> Create a Quote
                </button>
              </NewQuote>
            </div> */}
            <div className="w-full overflow-x-auto">
              <table className="w-full table-auto border-collapse border">
                <thead className="bg-[#f6f7fb] [&_th]:p-[12px] [&_th]:text-[14px] [&_th]:font-bold">
                  <tr className="border-b-[#c9c9cb] uppercase hover:[&>th]:cursor-pointer">
                    <th className="">
                      <input type="checkbox" className="h-[20px] w-[20px]" name="" id="" />
                    </th>
                    <th className="">
                      <div className="flex items-center justify-center gap-1 text-[#5C5C5C]">
                        <div>Quote Number</div>
                      </div>
                    </th>
                    <th className="">
                      <div className="flex items-center justify-center gap-1 text-[#5C5C5C]">
                        <div>Name</div>
                      </div>
                    </th>
                    <th className="">
                      <div className="flex items-center justify-center gap-1 text-[#5C5C5C]">
                        <div>Company</div>
                      </div>
                    </th>
                    <th className="">
                      <div className="flex items-center justify-center gap-1 text-[#5C5C5C]">
                        <div>Customer Email</div>
                      </div>
                    </th>
                    <th className="">
                      <div className="flex items-center justify-center gap-1 text-[#5C5C5C]">
                        <div>Date Request</div>
                      </div>
                    </th>
                    <th className="">
                      <div className="flex items-center justify-center gap-1 text-[#5C5C5C]">
                        <div>Date Updated</div>
                      </div>
                    </th>
                    <th className="">
                      <div className="flex items-center justify-center gap-1 text-[#5C5C5C]">
                        <div>Status</div>
                      </div>
                    </th>
                    <th className="">
                      <div className="text-[#5C5C5C]"> </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_td]:p-[12px] [&_td]:text-center [&_td]:text-[13px] [&_td]:font-normal [&_tr:last-child]:[border-bottom:none;] [&_tr:last-child_td:last-child_.tooltip]:top-0 [&_tr:last-child_td:last-child_.tooltip]:translate-y-[-100%] [&_tr]:border-b [&_tr]:border-b-[#f6f7fb]">
                  { data?.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <input type="checkbox" className="h-[20px] w-[20px]" name="" id="" />
                      </td>
                      <td className="cursor-pointer text-[rgb(60,100,244)]">{row.id}</td>
                      <td className="text-[#000]">{row.name}</td>
                      <td className="text-[#000]">{row.company}</td>
                      <td className="text-[#000]">{row.email}</td>
                      <td className="text-[#000]">{row.date}</td>
                      <td className="text-[#000]">-</td>
                      <td>
                        <div className="text-[14px] font-bold uppercase text-[rgb(171,134,22)]">
                          {row.status}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1 text-[#555]">
                          <PopOverClick
                            hrefLink={`${row.quote_id}`}
                            popOverContents={popOverContents}
                            from='quote'
                            onClick={(key) => handleEditClick(row.quote_id, key)}
                          >
                            <Ellipsis className="cursor-pointer text-[#555]" />
                          </PopOverClick>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
