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
    fullname: '',
    company: '',
  });
  const [createAccountData, setCreateAccountData] = useState({
    fullname: '',
    company: '',
    email: '',
    phone: '',
    referrerId: '',
  });

  const handleCartLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Cart ID:', cartId);
  };

  const handleFindCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      findCustomerData.email !== '' ||
      findCustomerData.company !== '' ||
      findCustomerData.phone !== '' ||
      findCustomerData.fullname !== ''
    ) {
      try {
        const response = await findCustomerDetails(findCustomerData);
        setCustomerDetails(findCustomerData);
        console.log('|||||||||||||||', response);
        if (response.status === 200) {
          console.log('Account created successfully:', response.data);
          let data = response.data.output;
          const extractedData = data.map((item) => ({
            first_name: item.first_name,
            last_name: item.last_name,
            email: item.email,
            phone: item.phone,
            company: item.company,
          }));
          console.log('extractedData=======', extractedData);

          setTableData(extractedData);
          setFindCustomerSuccessMessage('Account Retrived successfully!');
          setFindCustomerErrorMessage(null);
        } else {
          const errorMessage = response.error || 'An unknown error occurred';
          console.error('Error creating account:', errorMessage);
          setFindCustomerErrorMessage(`Failed to create account: ${errorMessage}`);
          setFindCustomerSuccessMessage(null);
        }
      } catch (error: any) {
        console.error('Error during account creation:', error);
        setFindCustomerErrorMessage(`An error occurred: ${error.message || 'Unknown error'}`);
        setFindCustomerSuccessMessage(null);
      }
    } else {
      setFindCustomerErrorMessage('Required any one feild');
    }
  };

  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !createAccountData.fullname &&
      !createAccountData.email &&
      !createAccountData.phone &&
      !createAccountData.company
    ) {
      console.error('Full name and email are required fields.');
      setCreateAccountErrorMessage('Please provide a full name and a valid email address.');
      setCreateAccountSuccessMessage(null);
      return;
    } else {
      try {
        const response = await createCustomerAccount(createAccountData);
        console.log(response);
        setCreateAccountSuccessMessage('Account created successfully!');
        setCreateAccountErrorMessage(null);
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
      case 'name':
        setFindCustomerData({ ...findCustomerData, fullname: value });
        break;
      case 'company':
        setFindCustomerData({ ...findCustomerData, company: value });
        break;
      case 'create_fullname':
        setCreateAccountData({ ...createAccountData, fullname: value });
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
          <Image src={DataLossIcon} width={'24px'} alt="Find Customer Icon" />
          <span className="font-open-sans tracking-[0.15px] text-[#353535]">Find Customer</span>
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
                { id: 'name', label: 'Full Name' },
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
              { id: 'create_fullname', label: 'Full Name*' },
              { id: 'create_company', label: 'Company (Optional)' },
              { id: 'create_email', label: 'Email*' },
              { id: 'create_phone', label: 'Phone (Optional)' },
              { id: 'create_referrerId', label: 'Referrer ID*' },
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
      <h2 className="h-[32px] content-center text-2xl font-normal text-[#353535]">
        Customer Information
      </h2>
      <div className="mt-[20px]">
        <Accordions
          styles="border-y-[1px] border-x-0  border-[#CCCBCB] bg-white py-[10px] px-[20px] text-[16px]"
          accordions={accordions}
          type="multiple"
        />
      </div>
    </div>
  );
}

export default CustomerSupportPage;
