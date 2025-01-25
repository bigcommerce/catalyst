'use client';

import Image from 'next/image';
import { useState, useRef, MouseEvent, useEffect } from 'react';
import { Accordions } from '../Accordin/index';
import { Button } from '../Button';
import { Input } from '~/components/ui/form';
import ShopIcon from '../../assets/badge.png';
import ChatIcon from '../../assets/chat.png';
import CategoryIcon from '../../assets/category.png';
import editIcon from '~/app/[locale]/(default)/sales-buddy/assets/edit_square.png';
import deleteIcon from '~/app/[locale]/(default)/sales-buddy/assets/delete.png';
import { addCustomProduct } from '../../_actions/add-custom-product';
import { addComment, GetComment } from '../../_actions/add-comment';
import { ChevronDown } from 'lucide-react';
import { getBrand } from '../../_actions/brand';
import Loader from './Spinner';
import { useRouter } from 'next/navigation';
export default function CartInterface() {
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);
  const [comment, setComment] = useState<string>(''); // Comment state
  const [action, setAction] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCommentVisible, setIsCommentVisible] = useState(false); // Toggle visibility of comment form
  const [isCommentSaved, setIsCommentSaved] = useState(false);
  const [prevComments, setPrevComments] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [accountId, setAccountId] = useState<string>('');
  const [accountIdError, setAccountIdError] = useState<string | null>(null);
  type FormData = {
    // accountId: string;
    supplier: string;
    sku: string;
    cost: string;
    retailPrice: string;
    productName: string;
    quantity: string;
    // comment: string;
  };

  const [formData, setFormData] = useState<FormData>({
    // accountId: '',
    supplier: '',
    sku: '',
    cost: '',
    retailPrice: '',
    productName: '',
    quantity: '',
    // comment: '',
  });
  const [loading, setLoading] = useState({
    accountId: false,
    customItem: false,
    comments: false,
  });
  const customProductRefs = {
    supplier: useRef<HTMLSelectElement>(null),
    sku: useRef<HTMLInputElement>(null),
    cost: useRef<HTMLInputElement>(null),
    retailPrice: useRef<HTMLInputElement>(null),
    productName: useRef<HTMLInputElement>(null),
    quantity: useRef<HTMLInputElement>(null),
  };

  const router = useRouter()

  useEffect(() => {
    //  GetComment
    const getComment = async () => {
      try {
        const response = await GetComment();
        setPrevComments(response?.data?.output)
      } catch (error: any) {
        setErrorMessage(`An error occurred: ${error.message || 'Unknown error'}`);
      }
    }
    getComment()

  }, [])


  const validate = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Simple validation rules
    for (const key in formData) {
      const value = formData[key as keyof FormData];

      // Check for required fields
      if (!value) {
        newErrors[key as keyof FormData] = `Field is required`;
      }

      // Check for number fields
      if (['cost', 'retailPrice', 'quantity'].includes(key) && value !== '' && isNaN(Number(value))) {
        newErrors[key as keyof FormData] = `Field must be a valid number`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };
  
  
  const handleCustomProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, customItem: true }));
    const createCustomProductData = formData
    if (validate()){
      try {
        const response = await addCustomProduct(createCustomProductData);
        // var response={status:200}
        if (response.status === 200) {
          setLoading((prev) => ({ ...prev, customItem: false }));
          setSuccessMessage('Product added successfully!');
          setFormData({
            supplier: '',
            sku: '',
            cost: '',
            retailPrice: '',
            productName: '',
            quantity: '',
          })
          router.refresh()
        } else {
          setLoading((prev) => ({ ...prev, customItem: false }));
          setErrorMessage(`Failed to add product: ${response.error || 'Unknown error'}`);
        }
      } catch (error: any) {
        setLoading((prev) => ({ ...prev, customItem: false }));
        console.error('Error during add product:', error);
        setErrorMessage(`An error occurred: ${error.message || 'Unknown error'}`);
      }
    }else{
      setLoading((prev) => ({ ...prev, customItem: false }));
    }
  };
  // Handle edit comment functionality
  const handleEditComment = () => {
    setIsCommentVisible(true); // Show the form again to edit comment
    setIsCommentSaved(false); // Reset saved status when editing
  };

  // Handle delete comment functionality
  const handleDeleteComment = async () => {
    setPrevComments('')
    setComment(''); // Clear the comment
    setAction('delete');
    setIsCommentSaved(false); // Set saved status to false
    const createCommentData = {
      comment: '',
      action: 'delete',
    };
    try {
      const response = await addComment(createCommentData);
      if (response.status === 200) {
        setSuccessMessage(`delete Sucessfully`);
      } else {
        setErrorMessage(`Failed to comment: ${response.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error during comment:', error);
      setErrorMessage(`An error occurred: ${error.message || 'Unknown error'}`);
    }
  };
  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
    setErrorMessage('');

  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, comments: true }));
    
    if (comment === '') {
    setErrorMessage('Please enter a comment before submitting');
    setLoading((prev) => ({ ...prev, comments: false }));
    return;
   }else{
     const createCommentData = {
       comment: comment.trim() || '',
       action: '',
     };
     try {
       const response = await addComment(createCommentData);
       if (response.status === 200) {

         setLoading((prev) => ({ ...prev, comments: false }));
         setPrevComments(comment)
         // setIsCommentVisible(false);
         setIsCommentSaved(true);
         setSuccessMessage('commented successfully!');
         // setIsCommentSaved(true);// Mark the comment as saved
         // setIsCommentVisible(true);
       } else {
         setLoading((prev) => ({ ...prev, comments: false }));
         setErrorMessage(`Failed to comment: ${response.error || 'Unknown error'}`);
       }
     } catch (error: any) {
       setLoading((prev) => ({ ...prev, comments: false }));
       console.error('Error during comment:', error);
       setErrorMessage(`An error occurred: ${error.message || 'Unknown error'}`);
     }
   }
  };
  const toggleAccordion = (index: number) => {
    setOpenAccordions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const renderInputFields = (
    fields: Array<{ id: string; label: string; component?: JSX.Element }>,
    refs: any,
  ) => {
    const handleOnchangeInput=(e:React.ChangeEvent<HTMLInputElement>)=>{
      const { id, value } = e.target;
      // console.log(id,"-",value);
      setErrors((prev) => ({ ...prev, [id]: '' }));
      setFormData((prev) => ({
        ...prev,
        [id]: id === 'cost' || id === 'retailPrice' || id === 'quantity' ? Number(value) : value,
      }));
    }

    return fields.map((item, component) => (
      <div key={item.id} className="space-y-[10px]">
        <div className="flex flex-col">
          <label
            htmlFor={item.id}
            className="font-open-sans font-base block content-center text-[16px] leading-[32px] tracking-[0.5px] text-gray-700"
          >
            {item.label}
          </label>
          {component ? (
            <Input id={item.id} onChange={(e) => handleOnchangeInput(e) }  className="w-full" />
          ) : (
            <SelectDropdown
              id="supplier"
              value={formData.supplier}
              onChange={(e) => 
                // setFormData({ ...formData, supplier: e.target.value })
                handleOnchangeInput(e)
              }
              options={[]}
            />
          )}
        <p className="text-red-800">{errors?.[item.id]}</p>
        </div>

      </div>
    ));
  };

  
  const handleAddAccountSubmit = (e: any) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, accountId: true }));
    if(accountId === ''){
      setAccountIdError('Please enter a Account ID before submitting');
    }else{
      setInterval(() => {
        setLoading((prev) => ({ ...prev, accountId: false }));
      }, 3000);
    }
  };

  const accordions = [
    {
      title: (
        <AccordionTitle
          icon={ShopIcon}
          text="Add an Account ID"
          onClick={() => toggleAccordion(0)}
        />
      ),
      content: (
        <div>
          <Input
            id="accountId"
            placeholder="Account ID"
            value={accountId}
            onChange={(e) => {
              setAccountId(e.target.value);
              setAccountIdError('');
            }}
            className="mb-[10px]"
          />
          <p className="text-red-800">{accountIdError}</p>
          <Button

            className="mt-2 font-open-sans w-full bg-[#1DB14B] font-normal tracking-[1.25px] text-white"
            onClick={(e) => {
              handleAddAccountSubmit(e);
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {loading.accountId && <Loader />}
            </div>
            ASSIGN ID
          </Button>
        </div>
      ),
    },
    {
      title: (
        <AccordionTitle
          icon={CategoryIcon}
          text="Add Custom Item"
          onClick={() => toggleAccordion(1)}
        />
      ),
      content: (
        <form onSubmit={handleCustomProductSubmit}>
          {renderInputFields(
            [
              { id: 'supplier', label: 'Supplier*' },
              { id: 'sku', label: 'Full SKU*' },
              { id: 'cost', label: 'Our Cost*' },
              { id: 'retailPrice', label: 'Retail Price*' },
              { id: 'productName', label: 'Product Name*' },
              { id: 'quantity', label: 'Quantity*' },
            ],
            formData,
          )}
          <Button className="font-open-sans mt-[10px] w-full bg-[#1DB14B] font-normal tracking-[1.25px] text-white">
            <div className="absolute inset-0 flex items-center justify-center">
              {loading.customItem && <Loader />}
            </div>
            ADD TO CART
          </Button>
        </form>
      ),
    },
  ];

  return (
    <>
      <div className="mt-[15px] bg-white">
        <Accordions
          styles="border-y-[1px] border-x-0  border-[#CCCBCB] bg-white py-[10px] px-[20px] text-[16px]"
          accordions={accordions}
        />

        <div>
          <div className="items-center border-x-0 border-y-[1px] border-[#CCCBCB] bg-white px-[20px] py-[10px]">

            <button
              onClick={() => setIsCommentVisible(!isCommentVisible)} // Toggle visibility of comment form
              className="font-open-sans flex h-[32px] w-full flex-1 items-center justify-between gap-[5px] font-normal tracking-[1.25px] text-[#353535]"
            >
              <div className="flex gap-[5px]">
                <Image src={ChatIcon} alt="chat-icon" />
                <span className="text-base font-normal"> Add Order Comments (Internal)</span>
              </div>
              {/* <ChevronDown

                className={`h-6 w-6 shrink-0 transition-transform duration-200 ${isCommentVisible ? 'rotate-180' : ''}`}
              /> */}
              <svg
                className={`h-4 w-3 shrink-0 transition-transform duration-200 ${isCommentVisible ? 'rotate-0' : 'rotate-180'}`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="#1C1B1F"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5 5 1 1 5"
                />
              </svg>
            </button>
            <div className="space-y-3">
              {/* Comment container with better styling */}
              <div className="bg-white shadow-sm rounded-lg p-3">
                <p className="text-gray-800 leading-relaxed">
                  {prevComments}
                </p>
                {prevComments && <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500 mr-2">
                    {/* Optional: Add timestamp or user info */}
                    Posted on: 2025-01-03 {/* Date */}
                  </span>
                </div>}
              </div>
            </div>
            {/* If the form is visible, show the comment input field */}
            {isCommentVisible && !isCommentSaved && (
              <div className="mt-4 space-y-[10px]">
                <textarea
                  className="font-open sans block h-[282px] w-full resize-none rounded bg-[#E8E7E7] p-[10px] text-sm text-gray-900 focus:outline-none"
                  placeholder="Write your thoughts here..."
                  value={comment}
                  onChange={handleCommentChange} // Update comment state on change
                />
                {errorMessage && <div className="text-red-500">{errorMessage}</div>}

                <Button
                  onClick={handleCommentSubmit} // Save the comment
                  className="font-open-sans mt-[10px] w-full bg-[#1DB14B] font-normal tracking-[1.25px] text-white"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {loading.comments && <Loader />}
                  </div>
                  SAVE COMMENT
                </Button>
              </div>
            )}


            {/* If the comment is saved, show Edit and Delete buttons */}
            {isCommentSaved && (
              <div className="mt-4 space-y-[10px]">
                {/* <p>{comment}</p> */}
                <div className="flex justify-between">
                  <button
                    onClick={handleEditComment} // Edit the comment
                    className="item-center flex justify-center p-1"
                  >
                    <Image src={editIcon} alt="editIcon" layout="intrinsic" />
                    <span className="font-open-sans mx-1 text-[#1DB14B]">Edit</span>
                  </button>
                  <button
                    onClick={handleDeleteComment} // Delete the comment
                    className="item-center flex justify-center p-1"
                  >
                    <Image src={deleteIcon} alt="deleteIcon" layout="intrinsic" />
                    <span className="font-open-sans mx-1 text-[#A71F23]">Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Button className="font-open-sans w-full bg-[#1DB14B] font-normal tracking-[1.25px] text-white">
        CREATE QUOTE
      </Button>
    </>
  );
}

function AccordionTitle({
  icon,
  text,
  onClick,
}: {
  icon: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <h4 className="flex items-center gap-1 text-base font-normal" onClick={onClick}>
      <Image src={icon} alt="App-icon" />
      <span className="text-[#353535]">{text}</span>
    </h4>
  );
}

function SelectDropdown({
  id,
  value,
  onChange, // Passed down from parent component
  options, // Array of options passed down
}: {
  id: string;
  value: string;
  options: { id: string; name: string }[]; // Supplier options
  onChange: React.ChangeEventHandler<HTMLSelectElement>; // Handler passed from parent
}) {
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Optional error handling
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]); // Brand data for options

  // Handle the select focus (click) to trigger API call
  const handleFocus = async () => {
    if (brands.length > 0) return; // If brands are already loaded, do nothing

    setLoading(true); // Start loading
    setError(null); // Reset errors

    try {
      const res = await getBrand(); // Call the API to get brand data
      if (res.status === 200) {
        setBrands(res.output); // Set the brand data into the state
      } else {
        setError('Failed to fetch brand data');
      }
    } catch (error) {
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex items-center justify-center">
      <select
        id={id}
        value={value}
        onChange={onChange} // Handle the change when a brand is selected
        onFocus={handleFocus} // Trigger API call when dropdown is clicked
        className="font-open-sans block w-full rounded border-2 border-gray-200 px-[10px] py-[10px] text-sm text-[#7F7F7F] focus:outline-none"
      >
        <option value="" disabled>
          Choose Supplier
        </option>
        {brands.length > 0 && (
          <>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </>
        )}
      </select>
      {loading && (
        <div className="absolute flex items-center justify-center">
          <Loader />
        </div>
      )}{' '}
      {/* Show loading indicator */}
      {error && <div className="text-red-500">{error}</div>} {/* Display error if it exists */}
    </div>
  );
}
