import React, { useState } from 'react';
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
  const [findCustomerData, setFindCustomerData] = useState({
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    company: '',
  });
  const [createAccountData, setCreateAccountData] = useState({
    first_name: '',
    last_name: '',
    company: '',
    email: '',
    phone: '',
    referrerId: '',
  });

  const handleCartLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await getCustomerCart(cartId);
      console.log(response);
    } catch (error: any) {
      console.log(error);
    }
    console.log('Cart ID:', cartId);
  };

  const handleFindCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      findCustomerData.email !== '' ||
      findCustomerData.company !== '' ||
      findCustomerData.phone !== '' ||
      findCustomerData.first_name !== '' ||
      findCustomerData.last_name !== ''
    ) {
      try {
        const response = await findCustomerDetails(findCustomerData);
        setCustomerDetails(findCustomerData);
        console.log('|||||||||||||||', response);
        if (response.status === 200) {
          console.log('Account retrieved successfully:', response.data);
          let data = response.data.output;
          const extractedData = data.map((item: { first_name: any; last_name: any; email: any; }) => ({
            first_name: item.first_name,
            last_name: item.last_name,
            email: item.email,
            // phone: item.phone,
            // company: item.company,
          }));
          console.log('extractedData=======', extractedData);

          setTableData(extractedData);
          setFindCustomerSuccessMessage('Account retrieved successfully!');
          setFindCustomerErrorMessage(null);
        } else {
          const errorMessage = response.error || 'An unknown error occurred';
          console.error('Error retrieving account:', errorMessage);
          setFindCustomerErrorMessage(`Failed to retrieve account: ${errorMessage}`);
          setFindCustomerSuccessMessage(null);
        }
      } catch (error: any) {
        console.error('Error during account retrieval:', error);
        setFindCustomerErrorMessage(`An error occurred: ${error.message || 'Unknown error'}`);
        setFindCustomerSuccessMessage(null);
      }
    } else {
      setFindCustomerErrorMessage('Required at least one field');
    }
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!createAccountData.first_name || !createAccountData.last_name || !createAccountData.email) {
      console.error('First name, last name, and email are required fields.');
      setCreateAccountErrorMessage(
        'Please provide a first name, last name, and a valid email address.',
      );
      setCreateAccountSuccessMessage(null);
      return;
    } else {
      try {
        console.log('|||||||||||||',createAccountData);
        
        const response = await createCustomerAccount(createAccountData);
        console.log(response.status);
        if (response.status==200) {
          setCreateAccountSuccessMessage('Account created successfully!');
          setCreateAccountErrorMessage(null);
        }else{
          setCreateAccountErrorMessage('Error during account creation');
        }
      } catch (error: any) {
        console.error('Error during account creation:', error);
        setCreateAccountErrorMessage(`An error occurred: ${error.message || 'Unknown error'}`);
        setCreateAccountSuccessMessage(null);
      }
    }
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
      </div>
    ));
  };

  const handleInputChange = (id: string, value: string) => {
    switch (id) {
      case 'cart-id':
        setCartId(value);
        break;
      case 'email':
        setFindCustomerData({ ...findCustomerData, email: value });
        break;
      case 'phone':
        setFindCustomerData({ ...findCustomerData, phone: value });
        break;
      case 'first_name':
        setFindCustomerData({ ...findCustomerData, first_name: value });
        break;
      case 'last_name':
        setFindCustomerData({ ...findCustomerData, last_name: value });
        break;
      case 'company':
        setFindCustomerData({ ...findCustomerData, company: value });
        break;
      case 'create_first_name':
        setCreateAccountData({ ...createAccountData, first_name: value });
        break;
      case 'create_last_name':
        setCreateAccountData({ ...createAccountData, last_name: value });
        break;
      case 'create_company':
        setCreateAccountData({ ...createAccountData, company: value });
        break;
      case 'create_email':
        setCreateAccountData({ ...createAccountData, email: value });
        break;
      case 'create_phone':
        setCreateAccountData({ ...createAccountData, phone: value });
        break;
      case 'create_referrerId':
        setCreateAccountData({ ...createAccountData, referrerId: value });
        break;
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
            placeholder="Cart ID"
            className="font-open-sans w-[225px]"
          />
          {cartErrorMessage && <p className="text-red-800">{cartErrorMessage}</p>}
          {cartSuccessMessage && <p className="text-green-600">{cartSuccessMessage}</p>}
          <button
            type="submit"
            className="mt-[10px] flex h-[42px] w-full items-center justify-center rounded bg-[#1DB14B] tracking-[1.25px] text-white hover:bg-[#178B3E]"
          >
            <p className="font-open-sans text-[14px] font-medium tracking-[1.25px]">FETCH CART</p>
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
                { id: 'first_name', label: 'First Name' },
                { id: 'last_name', label: 'Last Name' },
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
              className="mt-[10px] flex h-[42px] w-full items-center justify-center rounded bg-[#1DB14B] tracking-[1.25px] text-white hover:bg-[#178B3E]"
            >
              <p className="font-open-sans text-[14px] font-medium tracking-[1.25px]">
                FIND CUSTOMER
              </p>
            </button>
          </form>
          {tableData.length > 0 && <DynamicTable data={tableData} />}
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
            className="mt-[10px] flex h-[42px] w-full items-center justify-center rounded bg-[#1DB14B] tracking-[1.25px] text-white hover:bg-[#178B3E]"
          >
            <p className="font-open-sans text-[14px] font-medium tracking-[1.25px]">CREATE</p>
          </button>
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
