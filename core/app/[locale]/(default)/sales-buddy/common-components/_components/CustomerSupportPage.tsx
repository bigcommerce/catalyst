import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Accordions } from '../Accordin';
import ShoppingCartIcon from '../../assets/shopping_cart_checkout.png';
import DataLossIcon from '../../assets/data_loss_prevention.png';
import PersonIcon from '../../assets/person_add.png';
import { Input } from '../Input';
import { createCustomerAccount } from '../../_actions/create-customer-account';
import { findCustomerDetails } from '../../_actions/find-customer';
import DynamicTable from '../table/CustomTable';
import { getCustomerCart } from '../../_actions/get-customer-cart';
import Loader from './Spinner';
import {  validateInput } from '../common-functions';
import { UpdateCartIdCookie } from '../../_actions/update-cart-id-cookies';
import { getShopperUrls } from '../../_actions/get-shopper-urls';
import Link from 'next/link';
function CustomerSupportPage() {
  const [customerDetails, setCustomerDetails] = useState({});
  const [cartErrorMessage, setCartErrorMessage] = useState<string | null>(null);
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string | null>(null);
  const [findCustomerErrorMessage, setFindCustomerErrorMessage] = useState<string | null>(null);
  const [findCustomerSuccessMessage, setFindCustomerSuccessMessage] = useState<string | null>(null);
  const [createAccountErrorMessage, setCreateAccountErrorMessage] = useState<string | null>(null);
  const [createAccountSuccessMessage, setCreateAccountSuccessMessage] = useState<string | null>(
    null,
  );
  const [tableData, setTableData] = useState<any[]>([]);
  const [cartId, setCartId] = useState('');

  const [sessionId, setSessionId] = useState('');
  const [shoppersUrl, setShoppersUrl] = useState([]);
  const [customerVisitedUrl,setCustomerVisitedUrl]=useState([])
  const [updatedCartId, setUpdatedCCartId] = useState('');
  const [findCustomerData, setFindCustomerData] = useState({
    email: '',
    phone: '',
    first_name: '',
    // last_name: '',
    company: '',
  });
  const [findCustomerDataError, setFindCustomerDataError] = useState({
    email: '',
    phone: '',
    first_name: '',
    // last_name: '',
    company: '',
  });
  const [createAccountData, setCreateAccountData] = useState({
    first_name: '',
    last_name: '',
    company: '',
    email: '',
    phone: '',
    referral_id: '',
  });
  const [createAccountData_errors, setCreateAccountData_errors] = useState({
    create_first_name: '',
    create_last_name: '',
    create_company: '',
    create_email: '',
    create_phone: '',
    create_referral_id: '',
  });
  const [loading, setLoading] = useState({
    show1: false,
    show2: false,
    show3: false,
  });

  const handleCartLookupSubmit = async (e: React.FormEvent) => {
    setLoading((prev) => ({ ...prev, show1: true }));
    e.preventDefault();

    try {
      const response = await getCustomerCart(cartId);
      setUpdatedCCartId(cartId)
      setLoading((prev) => ({ ...prev, show1: false }));
    } catch (error: any) {
      setLoading((prev) => ({ ...prev, show1: false }));
    }
  };
  const handleGetShoppersUrlsData = async (e: React.FormEvent) => {
    setLoading((prev) => ({ ...prev, show1: true }));
    e.preventDefault();
    try {
      console.log('session id  --- ',sessionId);
      
      const response = await getShopperUrls(sessionId);
      // setShoppersUrl(response.data.output)
      console.log("response.data.output----",response.output);
      setCustomerVisitedUrl(response.output.urls)
      setLoading((prev) => ({ ...prev, show1: false }));
    } catch (error: any) {
      setLoading((prev) => ({ ...prev, show1: false }));
    }
  };
  // 


  const handleFindCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, show2: true }));
    if (
      findCustomerData.email !== '' ||
      findCustomerData.company !== '' ||
      findCustomerData.phone !== '' ||
      findCustomerData.first_name !== '' 
      // findCustomerData.last_name !== ''
    ) {
      try {
        const response = await findCustomerDetails(findCustomerData);
        setCustomerDetails(findCustomerData);
        if (response.status === 200) {
          setLoading((prev) => ({ ...prev, show2: false }));
          let data = response.data.output.data;          
          const extractedData = data.map(
            (item: { first_name: any; last_name: any; email: any }) => ({
              first_name: item.first_name,
              last_name: item.last_name,
              email: item.email,
              // phone: item.phone,
              // company: item.company,
            }),
          );          
          if (extractedData.length > 0) {
            setTableData(extractedData);
            setFindCustomerSuccessMessage(`${extractedData.length} Account retrieved successfully!`);
            setFindCustomerErrorMessage(null);
          } else {
            setTableData([])
            setFindCustomerSuccessMessage(`No account found with the given details!`);
          }
        } else {
          setLoading((prev) => ({ ...prev, show2: false }));
          const errorMessage = response.error || 'An unknown error occurred';
          setFindCustomerErrorMessage(`Failed to retrieve account: ${errorMessage}`);
          setFindCustomerSuccessMessage(null);
        }
      } catch (error: any) {
        setLoading((prev) => ({ ...prev, show2: false }));
        setFindCustomerErrorMessage(`An error occurred: ${error.message || 'Unknown error'}`);
        setFindCustomerSuccessMessage(null);
      }
    } else {
      setLoading((prev) => ({ ...prev, show2: false }));
      setFindCustomerErrorMessage('Required at least one field');
    }
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading((prev) => ({ ...prev, show3: true }));
    if (
      !createAccountData.first_name ||
      !createAccountData.last_name ||
      !createAccountData.email ||
      !createAccountData.referral_id
    ) {
      console.error('First name, last name, email and refferal id are required fields.');
      setCreateAccountErrorMessage(
        'Please provide a first name, last name,  valid email address and Refferal ID.',
      );
      setCreateAccountSuccessMessage(null);
      setLoading((prev) => ({ ...prev, show3: false }));
      return 0;
    } else {
      try {
        const response = await createCustomerAccount(createAccountData);
        if (response.status == 200) {
          setLoading((prev) => ({ ...prev, show3: false }));
          setCreateAccountSuccessMessage('Account created successfully!');
          setCreateAccountErrorMessage(null);
        } else {
          setLoading((prev) => ({ ...prev, show3: false }));
          setCreateAccountErrorMessage('Error during account creation');
        }
      } catch (error: any) {
        setLoading((prev) => ({ ...prev, show3: false }));
        setCreateAccountErrorMessage(`An error occurred: ${error.message || 'Unknown error'}`);
        setCreateAccountSuccessMessage(null);
      }
    }
  };
  useEffect(() => {
    if (updatedCartId !== '') {
      UpdateCartIdCookie(cartId)
    }
  }, [updatedCartId,findCustomerSuccessMessage])
  
  const UrlList = ({ urls }) => {
    return (
        <div className='m-4'>
            <h2 className='text-lg font-bold mb-2'>URLs</h2>
            <ul className='list-disc pl-5'>
                {urls.map((item) => (
                    <li key={item.id} className='mb-2'>
                        <Link href={item.url} className='text-blue-600 hover:underline'>
                            {/* <a className='text-blue-600 hover:underline'> */}
                                {item.url}
                            {/* </a> */}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

  const renderInputFields = (fields: Array<{ id: string; label: string }>, refs: any) => {
    return fields.map((item) => (
      <div key={item.id} className="mt-[10px]">
        <label
          htmlFor={item.id}
          className="font-open-sans block h-[32px] content-center tracking-[0.5px] text-[#353535]"
        >
          {item.label}
        </label>
        <Input
          value={refs[item.id]}
          onChange={(e) => handleInputChange(item.id, e.target.value)}
          id={item.id}
          className="w-[225px]"
        />
        <p className="text-red-800">{findCustomerDataError[item.id]}</p>
        <p className="text-red-800">{createAccountData_errors[item.id]}</p>
      </div>
    ));
  };
  const handleInputChange = (id: string, value: string) => {
    switch (id) {
      case 'cart-id': {
        setCartId(value);
        break;
      }
        case 'session-id': {
        setSessionId(value);
        break;
      }

      case 'email': {
        setFindCustomerData({ ...findCustomerData, email: value });
        const emailError = validateInput('email', value, 'find');
        setFindCustomerDataError((prev) => ({
          ...prev,
          email: emailError,
        }));
        // setFindCustomerDataError({ email: emailError });
        break;
      }
      case 'phone': {
        setFindCustomerData({ ...findCustomerData, phone: value });
        const phoneError = validateInput('phone', value, 'find');
        setFindCustomerDataError((prev) => ({
          ...prev,
          phone: phoneError,
        }));
        // setFindCustomerDataError({ phone: phoneError });
        break;
      }
      case 'first_name': {
        setFindCustomerData({ ...findCustomerData, first_name: value });
        const firstNameError = validateInput('firstname', value, 'find');
        setFindCustomerDataError((prev) => ({
          ...prev,
          first_name: firstNameError,
        }));
        // setFindCustomerDataError({ first_name: firstNameError });

        break;
      }
      case 'last_name': {
        setFindCustomerData({ ...findCustomerData, last_name: value });
        const lastNameError = validateInput('lastname', value, 'find');
        setFindCustomerDataError((prev) => ({
          ...prev,
          last_name: lastNameError,
        }));
        // setFindCustomerDataError({ last_name: lastNameError });

        break;
      }
      case 'company': {
        setFindCustomerData({ ...findCustomerData, company: value });
        const companyError = validateInput('company', value, 'find');
        setFindCustomerDataError((prev) => ({
          ...prev,
          company: companyError,
        }));
        // setFindCustomerDataError({ company: companyError });

        break;
      }
      case 'create_first_name': {
        setCreateAccountData({ ...createAccountData, first_name: value });
        const createFirstNameError = validateInput('firstname', value, 'create');
        setCreateAccountData_errors((prev) => ({
          ...prev,
          create_first_name: createFirstNameError,
        }));
        break;
      }
      case 'create_last_name': {
        setCreateAccountData({ ...createAccountData, last_name: value });
        const createLastNameError = validateInput('lastname', value, 'create');
        setCreateAccountData_errors((prev) => ({
          ...prev,
          create_last_name: createLastNameError,
        }));
        break;
      }
      case 'create_company': {
        setCreateAccountData({ ...createAccountData, company: value });
        const createCompanyError = validateInput('company', value, 'create');
        setCreateAccountData_errors((prev) => ({
          ...prev,
          create_company: createCompanyError,
        }));
        break;
      }

      case 'create_email': {
        setCreateAccountData({ ...createAccountData, email: value });
        const createEmailError = validateInput('email', value, 'create');
        setCreateAccountData_errors((prev) => ({
          ...prev,
          create_email: createEmailError,
        }));
        break;
      }
      case 'create_phone': {
        const createPhoneError = validateInput('phone', value, 'create');
        if (createPhoneError === '') {
          setCreateAccountData({ ...createAccountData, phone: value });
        }
        // setCreateAccountData_errors((prev) => ({
        //   ...prev,
        //   create_phone: createPhoneError,
        // }));
        break;
      }
      case 'create_referralId': {
        setCreateAccountData({ ...createAccountData, referral_id: value });
        break;
      }
      default:
        break;
    }
  };
  const accordions = [
    {
      title: (
        <div className="flex items-center gap-[5px] text-base font-normal">
          <Image src={ShoppingCartIcon} alt="Cart Lookup Icon" />
          <span className="font-open-sans tracking-[0.15px] text-[#353535]">
            Customer Cart Lookup
          </span>
        </div>
      ),
      content: (
        <form onSubmit={(e) => handleCartLookupSubmit(e)}>
          <Input
            value={cartId}
            onChange={(e) => handleInputChange('cart-id', e.target.value)}
            id="cart-id"
            placeholder="Session ID"
            className="font-open-sans w-[225px]"
          />
          {cartErrorMessage && <p className="text-red-800">{cartErrorMessage}</p>}
          {cartSuccessMessage && <p className="text-green-600">{cartSuccessMessage}</p>}
          <button
            type="submit"
            className="relative mt-[10px] flex h-[42px] w-full items-center justify-center rounded bg-[#1DB14B] tracking-[1.25px] text-white hover:bg-[#178B3E]"
          >
            <p className="font-open-sans text-[14px] font-medium tracking-[1.25px]">FETCH CART </p>
            <div className="absolute inset-0 flex items-center justify-center">
              {loading.show1 && <Loader />}
            </div>
          </button>
        </form>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-[10px] bg-[#FFFFFF] text-base font-normal">
          <Image src={DataLossIcon} width={24} alt="Find Customer Icon" />
          <span className="font-open-sans tracking-[0.15px] text-[#353535]">Find Customer </span>
        </div>
      ),
      content: (
        <>
          <form
            onSubmit={(e) => handleFindCustomerSubmit(e)}
            className="mt-[10px] flex flex-col justify-center bg-white pb-[10px]"
          >
            {renderInputFields(
              [
                { id: 'email', label: 'Email' },
                { id: 'phone', label: 'Phone' },
                { id: 'first_name', label: 'Full Name' },
                // { id: 'last_name', label: 'Last Name' },
                { id: 'company', label: 'Company' },
              ],
              findCustomerData,
            )}
            {findCustomerErrorMessage && <p className="text-red-800">{findCustomerErrorMessage}</p>}
            {findCustomerSuccessMessage && (
              <p className="text-green-600">{findCustomerSuccessMessage}</p>
            )}
            <button
              type="submit"
              className="relative mt-[10px] flex h-[42px] w-full items-center justify-center rounded bg-[#1DB14B] tracking-[1.25px] text-white hover:bg-[#178B3E]"
            >
              <p className="font-open-sans text-[14px] font-medium tracking-[1.25px]">
                FIND CUSTOMER
              </p>
              <div className="absolute inset-0 flex items-center justify-center">
                {loading.show2 && <Loader />}
              </div>
            </button>
          </form>
          {tableData.length > 0 && <DynamicTable data={tableData} />}
          {/* <DynamicTable data={tableData}/> */}
        </>
      ),
    },
    {
      title: (
        <div className="flex items-center gap-[5px] text-base font-normal">
          <Image src={PersonIcon} alt="Create Account Icon" />
          <span className="font-open-sans tracking-[0.15px] text-[#353535]">
            Create a New Account
          </span>
        </div>
      ),
      content: (
        <form onSubmit={(e) => handleCreateAccountSubmit(e)} className="space-y-[10px]">
          {renderInputFields(
            [
              { id: 'create_first_name', label: 'First Name*' },
              { id: 'create_last_name', label: 'Last Name*' },
              { id: 'create_company', label: 'Company (Optional)' },
              { id: 'create_email', label: 'Email*' },
              { id: 'create_phone', label: 'Phone (Optional)' },
              { id: 'create_referralId', label: 'Referral ID*' },
            ],
            createAccountData,
          )}
          {createAccountErrorMessage && <p className="text-red-800">{createAccountErrorMessage}</p>}
          {createAccountSuccessMessage && (
            <p className="text-green-600">{createAccountSuccessMessage}</p>
          )}
          <button
            type="submit"
            className="relative mt-[10px] flex h-[42px] w-full items-center justify-center rounded bg-[#1DB14B] tracking-[1.25px] text-white hover:bg-[#178B3E]"
          >
            <p className="font-open-sans text-[14px] font-medium tracking-[1.25px]">CREATE</p>
            <div className="absolute inset-0 flex items-center justify-center">
              {loading.show3 && <Loader />}
            </div>
          </button>
        </form>
      ),
    },
     {
      title: (
        <div className="flex items-center gap-[5px] text-base font-normal">
          <Image src={PersonIcon} alt="Create Account Icon" />
          <span className="font-open-sans tracking-[0.15px] text-[#353535]">
            Shopper Visited URL's
          </span>
        </div>
      ),
      content: (
        <form
            onSubmit={(e) => handleGetShoppersUrlsData(e)}
            className="mt-[10px] flex flex-col justify-center bg-white pb-[10px]"
          >
             <Input
            value={sessionId}
            onChange={(e) => handleInputChange('session-id', e.target.value)}
            id="session-id"
            placeholder="Session ID"
            className="font-open-sans w-[225px]"
          />
           <button
            type="submit"
            className="relative mt-[10px] flex h-[42px] w-full items-center justify-center rounded bg-[#1DB14B] tracking-[1.25px] text-white hover:bg-[#178B3E]"
            
          >
            <p className="font-open-sans text-[14px] font-medium tracking-[1.25px]">FETCH URL's </p>
            <div className="absolute inset-0 flex items-center justify-center">
              {loading.show1 && <Loader />}
            </div>
          </button>
       <div className='m-2'>
        <UrlList urls={customerVisitedUrl}/>
       </div>

          </form>
        
        
      ),
    },
  ];

  return (
    <div className="w-[460px]">
      <h2 className="h-[52px] content-center text-2xl font-normal text-[#353535]">
        Customer Information
      </h2>
      <div className="mt-[20px]">
        <Accordions
          styles="border-y-[1px] border-x-0  border-[#CCCBCB] bg-white py-[10px] px-[20px] text-[16px]"
          accordions={accordions}
        />
      </div>
    </div>
  );
}

export default CustomerSupportPage;
