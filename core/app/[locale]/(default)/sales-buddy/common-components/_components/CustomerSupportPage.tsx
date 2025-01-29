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
import { getCustomerCart, getCustomerUrlSession_id } from '../../_actions/get-customer-cart';
import Loader from './Spinner';
import { getEnhancedSystemInfo, validateInput } from '../common-functions';
import { UpdateCartIdCookie } from '../../_actions/update-cart-id-cookies';
import { getShopperUrls } from '../../_actions/get-shopper-urls';
import Link from 'next/link';
import SystemInfoComponent from './SystemInformationComponent';
import { useCompareDrawerContext } from '~/components/ui/compare-drawer';
import CompactUserCard from './SystemInformationComponent/CustomerDetailUsingSessionId';
import { setCustomerIdViaSessionId } from '../../_actions/update-customer-id';
function CustomerSupportPage({ toggleAccordion, openIndexes, setOpenIndexes }) {
  const [customerDetails, setCustomerDetails] = useState({});
  const [customerDetailsBasedOnSessionId, setCustomerDetailsBasedOnSessionId] = useState([]);
  const [cartErrorMessage, setCartErrorMessage] = useState<string | null>(null);
  const [urlinputErrorMessage, setUrlinputErrorMessage] = useState<string | null>(null);
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
  const [customerVisitedUrl, setCustomerVisitedUrl] = useState<any[]>([])
  const [updatedCartId, setUpdatedCCartId] = useState('');
  const [shopperSystemInfo, setShopperSystemInfo] = useState({});
  const [getUserStoredSessionInfoFromLS, setGetUserStoredSessionInfoFromLS] = useState([])
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
    show4: false
  });
  const { cart_interface_session_id, setCart_interface_session_id, cart_interface_refferal_id, setCart_interface_Refferal_id } = useCompareDrawerContext();


  const handleCartLookupSubmit = async (e: React.FormEvent) => {
    setLoading((prev) => ({ ...prev, show1: true }));
    e.preventDefault();

    if (cartId === '') {
      const cartError = validateInput('cart-id', cartId, "");
      setCartErrorMessage('Session Id cannot be empty');
      setLoading((prev) => ({ ...prev, show1: false }));
      return
    }
    localStorage.setItem('cart_lookup_sessionID_agent', "")
    try {
      const response = await getCustomerUrlSession_id(cartId);
      if (response.output.count > 0) {
        setCart_interface_session_id(response.output.data[0]['session_id'])
        setCart_interface_Refferal_id(response.output.data[0]['referral_id'])
        setCustomerDetailsBasedOnSessionId(response.output.data[0])
        UpdateCartIdCookie(response?.output?.data?.[0]?.['cart_id'])
        setUpdatedCCartId(cartId)
        setCustomerIdViaSessionId(response?.output?.data?.[0]?.customer_id)
        localStorage.setItem(
          'cart_lookup_sessionID_agent',
          JSON.stringify({
            SessionId: cartId,
            SessionIDUserDetails: response?.output?.data[0]
          })
        );
      } else {
        setCartErrorMessage('No cart found with the given session id');
      }

      setLoading((prev) => ({ ...prev, show1: false }));
    } catch (error: any) {
      setLoading((prev) => ({ ...prev, show1: false }));
    }
  };
  const handleGetShoppersUrlsData1 = async (e: React.FormEvent) => {
    setLoading((prev) => ({ ...prev, show4: true }));
    e.preventDefault();
    try {
      let getShopperDetailFromLS = localStorage.getItem('session_id');
      const response = await getShopperUrls(sessionId);
      let storeShopperInformationInLS = {
        machineInfo: response?.output?.data?.length ? response.output.data[0]['shopper_information'] : {},
        shopperUrls: response?.output?.urls == '' ? [] : response?.output?.urls
      }
      const shopperInfoString = JSON.stringify(storeShopperInformationInLS);
      localStorage.setItem('ShopperInformations', shopperInfoString)
      let getShopperMachineInformation = response?.output?.data[0]['shopper_information']
      const ShopperMachineInformationJsonToObj = JSON.parse(getShopperMachineInformation);
      ShopperMachineInformationJsonToObj.session_id = getShopperDetailFromLS
      setShopperSystemInfo(ShopperMachineInformationJsonToObj)
      UpdateCartIdCookie(response.output.data[0]['cart_id'])
      setCustomerVisitedUrl(response.output.urls)
      setLoading((prev) => ({ ...prev, show4: false }));
      // }


    } catch (error: any) {
      setLoading((prev) => ({ ...prev, show4: false }));
    }
  };
  const handleGetShoppersUrlsData = async (e: React.FormEvent) => {
    setLoading((prev) => ({ ...prev, show4: true }));
    e.preventDefault();
    if (sessionId === '') {
      const cartError = validateInput('session-id', sessionId, "");
      setUrlinputErrorMessage('Session Id cannot be empty');
      setLoading((prev) => ({ ...prev, show4: false }));
      return
    }
    try {
      // const sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        console.warn('No session ID found in localStorage');
        setLoading((prev) => ({ ...prev, show4: false }));
        return;
      }

      const response = await getShopperUrls(sessionId);
      if (!response?.output?.data) {
        console.log('No shopper data received from API');
        setLoading((prev) => ({ ...prev, show4: false }));
        return;
      }

      if (response?.output?.count > 0) {
        const shopperData = response?.output?.data[0] || {};
        setCart_interface_session_id(shopperData.session_id)
        setCart_interface_Refferal_id(shopperData.referral_id)


        const shopperUrls = response?.output?.urls || [];
        const storeShopperInformationInLS = {
          machineInfo: shopperData?.shopper_information || {},
          shopperUrls: Array?.isArray(shopperUrls) ? shopperUrls : []
        };
        localStorage.setItem(
          'ShopperInformations',
          JSON?.stringify(storeShopperInformationInLS)
        );
        if (shopperData?.shopper_information) {
          try {
            const ShopperMachineInformationJsonToObj = JSON?.parse(
              shopperData?.shopper_information
            );
            ShopperMachineInformationJsonToObj.session_id = sessionId;
            setShopperSystemInfo(ShopperMachineInformationJsonToObj);
          } catch (parseError) {
            console.error('Error parsing shopper information:', parseError);
            setShopperSystemInfo([]);
          }
          setCustomerVisitedUrl(Array?.isArray(shopperUrls) ? shopperUrls : []);
        }

      }
      else {
        setUrlinputErrorMessage('No shopper data found with the given session id');
        setShopperSystemInfo({})
        setCustomerVisitedUrl([]);
        const storeShopperInformationInLS = {
          machineInfo: {},
          shopperUrls: []
        };
        localStorage.setItem(
          'ShopperInformations',
          JSON?.stringify(storeShopperInformationInLS)
        );
      }


    } catch (error) {
      console.error('Error fetching shopper data:', error);
    } finally {
      setLoading((prev) => ({ ...prev, show4: false }));
    }
  };
  const handleFindCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFindCustomerSuccessMessage("")
    setLoading((prev) => ({ ...prev, show2: true }));
    if (
      (findCustomerData.email !== '' ||
        findCustomerData.phone !== '' ||
        findCustomerData.first_name !== '')
    ) {
      if (findCustomerData.email.length == 0 && findCustomerDataError.email == "" || findCustomerData.email.length > 0 && findCustomerDataError.email == "") {
        try {
          const response = await findCustomerDetails(findCustomerData);
          console.log(response);
          
          setCustomerDetails(findCustomerData);
          if (response.data.status == 200) {
            setLoading((prev) => ({ ...prev, show2: false }));
            let data = response.data.output;
            const extractedData = data.map(
              (item: { first_name: any; last_name: any; email: any }) => ({
                first_name: item.first_name,
                last_name: item.last_name,
                email: item.email,
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
            setTableData([])
            const errorMessage = response.error || 'An unknown error occurred';
            setFindCustomerErrorMessage(` Failed to retrieve account`);
            setFindCustomerSuccessMessage(null);
          }
        } catch (error: any) {
          setLoading((prev) => ({ ...prev, show2: false }));
          setTableData([])
          setFindCustomerErrorMessage(`Failed to retrieve account`);
          // setFindCustomerErrorMessage(`An error occurred: ${error.message || 'Unknown error'}`);
          setFindCustomerSuccessMessage(null);
        }
      } else { setLoading((prev) => ({ ...prev, show2: false })); }
    } else {
      setLoading((prev) => ({ ...prev, show2: false }));
      setFindCustomerErrorMessage('Required at least one field');
    }
  };



  const handleValidationMsgForCreateAccount = () => {
    const missingFields = [];

    if (!createAccountData.first_name) {
      missingFields.push("First Name");
    }
    if (!createAccountData.last_name) {
      missingFields.push("Last Name");
    }
    if (!createAccountData.email) {
      missingFields.push("Valid Email Address");
    }
    if (!createAccountData.referral_id) {
      missingFields.push("Referral ID");
    }
    const errorMessage = `Please provide the following: ${missingFields.join(" ")}.`;
    return errorMessage;
  }

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    setCreateAccountSuccessMessage('')
    setCreateAccountErrorMessage('')
    e.preventDefault();
    setLoading((prev) => ({ ...prev, show3: true }));
    const hasInitialErrors = Object.values(createAccountData_errors).some(error => error !== '');
    if (hasInitialErrors) {
      setLoading((prev) => ({ ...prev, show3: false }));
      return;
    }
    const requiredFields = ['first_name', 'last_name', 'email', 'referral_id'];
    const missingFields = requiredFields.filter(field => !createAccountData[field]);
    if (missingFields.length > 0) {
      setCreateAccountErrorMessage(handleValidationMsgForCreateAccount());
      setCreateAccountSuccessMessage(null);
      setLoading((prev) => ({ ...prev, show3: false }));
      return;
    }
    try {
      const response = await createCustomerAccount(createAccountData);
      setLoading((prev) => ({ ...prev, show3: false }));
      if (response.status === 200) {
        setCreateAccountSuccessMessage('Account created successfully!');
        setCreateAccountErrorMessage(null);
      } else {
        setCreateAccountErrorMessage('Email id already exist');
      }
    } catch (error) {
      setLoading((prev) => ({ ...prev, show3: false }));
      setCreateAccountErrorMessage('Error during account creation');
      setCreateAccountSuccessMessage(null);
    }
  };
  useEffect(() => {
    const getCartLookUpValueFromLS = () => {
      const getCart_lookup_sessionID_agent = JSON?.parse(localStorage?.getItem('cart_lookup_sessionID_agent') || '{}')
      const isNotEmpty = Object.keys(getCart_lookup_sessionID_agent).length > 0;
      setCustomerIdViaSessionId(isNotEmpty && getCart_lookup_sessionID_agent?.SessionIDUserDetails.customer_id)

      setGetUserStoredSessionInfoFromLS(getCart_lookup_sessionID_agent)
      setCartId(getCart_lookup_sessionID_agent?.SessionId)
      setCustomerDetailsBasedOnSessionId(getCart_lookup_sessionID_agent?.SessionIDUserDetails)

    }
    const getShopperInfoAndLoad = () => {
      try {
        const getCart_lookup_sessionID_agent = JSON?.parse(localStorage?.getItem('cart_lookup_sessionID_agent') || '{}')
        setGetUserStoredSessionInfoFromLS(getCart_lookup_sessionID_agent)
        const sessionFromLS = getCart_lookup_sessionID_agent?.SessionId
        const overAllValue = localStorage.getItem('ShopperInformations');
        // Check if data exists in localStorage
        setSessionId(sessionFromLS)
        if (!overAllValue) {
          setShopperSystemInfo([]);
          setCustomerVisitedUrl([]);
          return;
        }
        const parsedOverallValue = JSON?.parse(overAllValue);
        if (parsedOverallValue?.machineInfo) {
          try {
            const machineInfo = JSON?.parse(parsedOverallValue?.machineInfo);
            machineInfo.session_id = sessionFromLS;
            setShopperSystemInfo(machineInfo);
          } catch (error) {
            console.error('Error parsing machine info:', error);
            setShopperSystemInfo([]);
          }
        } else {
          setShopperSystemInfo([]);
        }
        setCustomerVisitedUrl(parsedOverallValue?.shopperUrls || []);
      } catch (error) {
        console.error('Error loading shopper info:', error);
        setShopperSystemInfo([]);
        setCustomerVisitedUrl([]);
      }
    };

    getCartLookUpValueFromLS()
    getShopperInfoAndLoad()

  }, [])

  const UrlList = ({ urls }: { urls: { id: string; url: string }[] }) => {
    return (
      <div className='m-4 max-w-md'>
        <h2 className='text-lg font-bold mb-2'>URLs</h2>
        <ul className='list-disc pl-5'>
          {urls.map((item) => (
            <li key={item.id} className='mb-2'>
              <Link href={item.url} className='text-blue-600 hover:underline break-words block'>
                {item.url}
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
    setFindCustomerErrorMessage('')
    setCreateAccountSuccessMessage('')
    setCreateAccountErrorMessage('')
    switch (id) {
      case 'cart-id': {
        setCartId(value);
        const cartError = validateInput('cart-id', value, "");
        if (value.length !== 17) {
          setCustomerDetailsBasedOnSessionId([])
        }
        setCartErrorMessage(cartError);
        break;
      }
      case 'session-id': {
        setSessionId(value);
        const cartError = validateInput('session-id', value, "");
        setUrlinputErrorMessage(cartError);
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
        // const companyError = validateInput('company', value, 'find');
        // setFindCustomerDataError((prev) => ({
        //   ...prev,
        //   company: companyError,
        // }));
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
          {
            getUserStoredSessionInfoFromLS &&
            customerDetailsBasedOnSessionId &&
            Object.keys(customerDetailsBasedOnSessionId).length > 0 &&
            (cartErrorMessage === '' || cartErrorMessage === null) &&
            cartId !== '' && <div className='m-2'>
              <CompactUserCard data={customerDetailsBasedOnSessionId} />
            </div>}
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
              <p className={` ${tableData.length > 0 ? "text-green-600" : "text-red-800"}`}>{findCustomerSuccessMessage}</p>
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
              { id: 'create_referralId', label: 'Referrer ID*' },
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
          {urlinputErrorMessage && <p className="text-red-800">{urlinputErrorMessage}</p>}
          {cartSuccessMessage && <p className="text-green-600">{cartSuccessMessage}</p>}
          <button
            type="submit"
            className="relative mt-[10px] flex h-[42px] w-full items-center justify-center rounded bg-[#1DB14B] tracking-[1.25px] text-white hover:bg-[#178B3E]"

          >
            <p className="font-open-sans text-[14px] font-medium tracking-[1.25px]">FETCH URL's </p>
            <div className="absolute inset-0 flex items-center justify-center">
              {loading.show4 && <Loader />}
            </div>
          </button>
          <div>
            <div>
              {shopperSystemInfo && Object?.keys(shopperSystemInfo || {})?.length > 0 ? (
                sessionId !== '' && shopperSystemInfo && <SystemInfoComponent data={shopperSystemInfo} />
              ) : (
                sessionId !== '' && shopperSystemInfo?.length > 0 && <p className="text-gray-500 text-center py-4">No System Information Found</p>
              )}
            </div>
            <div className="m-2">
              {customerVisitedUrl && Array?.isArray(customerVisitedUrl) && customerVisitedUrl?.length > 0 ? (
                sessionId !== '' && loading.show4 == false && <UrlList urls={customerVisitedUrl} />
              ) : (
                sessionId !== '' && shopperSystemInfo?.length > 0 && <p className="text-gray-500 text-center py-4">No URL Data Found</p>
              )}
            </div>
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
          toggleAccordion={toggleAccordion}
          openIndexes={openIndexes}
          setOpenIndexes={setOpenIndexes}
        />
      </div>
    </div>
  );
}

export default CustomerSupportPage;
