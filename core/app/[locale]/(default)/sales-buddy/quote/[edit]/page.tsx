"use client"
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { Ellipsis, RotateCw, Search, X } from 'lucide-react';
import AddDialog from '../_components/addDialog';
import DatePicker from '../_components';
import { BcImage } from '~/components/bc-image';
import CartIcon from '~/public/add-to-cart/addToCart.svg';
import PopOverClick from '../_components/PopOverClick';
import NewProductQuote from '../_components/newProductQuote';
import { GetQuoteBasedOnID } from '../actions/get-quote-basedon-id';
import { UpdateQuote } from '../actions/update-quote';
import { CreateQuote } from '../actions/CreateQuote';
import ProductPriceAdjuster from '../../common-components/_components/ProductPriceAdjuster';
import { CreateCartForQouteItems } from '../actions/create-cart-for-quote';
import { sendEmailToCustomer } from '../actions/SendEmailToCustomer';
import { storeFileInS3Bucket } from '../actions/upload-file-s3-bucket';
import Loader from '../_components/Spinner';
import toast from 'react-hot-toast';
import { SquareArrowUpRight } from 'lucide-react';
import Link from 'next/link';
const popOverContents = [
  { key: 'refresh-product', label: 'Refresh Product' },
  { key: 'delete', label: 'Delete' },
];



const page = () => {
  const router = useRouter();
  const { edit } = useParams(); // Extracting the dynamic ID
  const [storeFile,setStoreFile] = useState(null);
  const [loader,setLoader]=useState({
    uploadFile:false,
    updateAndExit:false,
    updateAndSendEmail:false
  })
  const [formData, setFormData] = useState({
    quote_id: '',
    bc_channel_id: '',
    bc_customer_id: '',
    quote_type: '',
    qr_customer: {
      first_name: '',
      last_name: '',
      email_id: '',
      company_name: '',
      phone_number: '',
      quote_remarks: '',
      sub_total: 0,
      total: 0,
      expires: '',
      notes: '',
      video: '',
      attachment: '',
      agent_id: 0,
      agent_approval: '',
      agent_approval_date: '',
      agent_manager_id: 0,
      agent_manager_approval: '',
      agent_manager_approval_date: '',
      quote_status: ''
    },
    qr_product: []
  });

  const [quoteId, setQuoteId] = useState(edit);
  const [errors, setErrors] = useState({});
  const [mode, setMode] = useState('edit'); // Default to 'edit' mode
  const [showSendEmailButton, setShowSendEmailButton] = useState(false); // New state for showing the Send Email button

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.qr_customer) {
      setFormData({ ...formData, qr_customer: { ...formData.qr_customer, [name]: value } });
      if (name === 'quote_status' && (value === 'approved' || value === 'rejected')) {
        setShowSendEmailButton(true);
      } else {
        setShowSendEmailButton(false);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...formData.qr_product];
    updatedProducts[index] = { ...updatedProducts[index], [name]: parseInt(value, 10) };
    setFormData({ ...formData, qr_product: updatedProducts });
  };
  const handleAddProduct = () => {
    setFormData({ ...formData, qr_product: [...formData.qr_product, { bc_product_id: '', bc_sku: '', bc_product_name: '', bc_variant_id: '', bc_variant_sku: '', bc_variant_name: '', bc_modifier_id: '', bc_modifier_option: '', options: '', qty: 0, unitPrice: 0 }] });
  };

  const handleFileChange = (e) => {
    setStoreFile(e.target.files[0]);
    setFormData({ ...formData, attachments: [...e.target.files] });
    

  };

  const handleAddCustomProduct = async (product) => {
    const dataToSend = {
      quote_id: formData.quote_id,
      bc_customer_id: formData.bc_customer_id,
      quote_type: "old",
      qr_customer: formData.qr_customer,
      qr_product: [{
        bc_product_id: 0, // Default or dynamic value
        bc_product_name: product.name,
        bc_sku: product.sku,
        bc_variant_id: product.bc_variant_id || 0,
        bc_variant_name: product.bc_variant_name || "custom",
        bc_variant_sku: "custom",
        bc_modifier_id: "custom",
        bc_modifier_option: "custom",
        options: "custom",
        qty: product.quantity,
        unitPrice: product.price,
        brand: product.brand,
      }],
      page_type: 'agent_app',
    };
    try {
      const result = await CreateQuote(dataToSend);
      callToGetQuoteDataBasedOnQuoteId();
    } catch (error) {
      console.error("Error submitting quote:", error);
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.qr_customer.first_name) tempErrors.first_name = "First Name is required";
    if (!formData.qr_customer.last_name) tempErrors.last_name = "Last Name is required";
    if (!formData.qr_customer.email_id) tempErrors.email_id = "Email is required";
    // if (!formData.qr_customer.company_name) tempErrors.company_name = "Company Name is required";
    // if (!formData.qr_customer.phone_number) tempErrors.phone_number = "Phone Number is required";
    // if (!formData.qr_customer.quote_remarks) tempErrors.
    // quote_remarks = "Quote Remarks are required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Submit form data
    }
  };

  const handleUpdate = async () => {
    setLoader((prev) => ({ ...prev, updateAndSendEmail: true }));
    try {

      const payload = {
        quote_id: formData.quote_id,
        qr_customer: {
          sub_total: formData.qr_customer.sub_total ?? 0,
          total: formData.qr_customer.total ?? 0,
          expires: formData.qr_customer.expires,
          notes: formData.qr_customer.notes,
          video: formData.qr_customer.video,
          attachment: formData.qr_customer.attachment,
          agent_id: formData.qr_customer.agent_id ?? 0,
          agent_approval: formData.qr_customer.agent_approval,
          agent_approval_date: formData.qr_customer.agent_approval_date,
          agent_manager_id: formData.qr_customer.agent_manager_id ?? 0,
          agent_manager_approval: formData.qr_customer.agent_manager_approval,
          agent_manager_approval_date: formData.qr_customer.agent_manager_approval_date,
          quote_status: formData.qr_customer.quote_status
        },
        qr_product: formData?.qr_product?.map(product => ({
          qr_item_id: product.qr_item_id,
          qty: product.qty,
          unit_price: product.unitPrice,
          total_price: product.unitPrice * product.qty
        }))
      };

      const updateQuoteData = await UpdateQuote(payload);
      toast.success('Quote updated successfully');
      setLoader((prev) => ({ ...prev, updateAndSendEmail: false }));
      if (updateQuoteData) {
        callToGetQuoteDataBasedOnQuoteId();
      } else {
        console.error("Error updating quote:", updateQuoteData);

      }
    } catch (error) {
      console.error("An error occurred while updating the quote:", error);
    } finally {
      setLoader((prev) => ({ ...prev, updateAndSendEmail: false }));
    }
  };


  const callToGetQuoteDataBasedOnQuoteId = async () => {
    if (!quoteId || quoteId.trim() === "") return; // Ensure quoteId is valid

    try {
      let result = await GetQuoteBasedOnID(quoteId);
      
      // if (!result?.output || !Array.isArray(result.output) || result.output.length === 0) {
      //   console.error("Invalid API response:", result);
      //   return;
      // }
      const firstItem = result.output[0]; // Get first item

      setFormData({
        quote_id: firstItem.quote_id || '',
        bc_channel_id: firstItem.bc_channel_id || 0,
        bc_customer_id: firstItem.bc_customer_id || '',
        quote_type: firstItem.quote_type || '',
        qr_customer: {
          first_name: firstItem.first_name || '',
          last_name: firstItem.last_name || '',
          email_id: firstItem.email_id || '',
          company_name: firstItem.company_name || '',
          phone_number: firstItem.phone_number || '',
          quote_remarks: firstItem.quote_remarks || '',
          sub_total: calculateTotalPrice() || 0,
          total: calculateTotalPrice() || 0,
          expires: firstItem.expires || '',
          notes: firstItem.notes || '',
          video: firstItem.video || '',
          attachment: firstItem.attachment || '',
          agent_id: firstItem.agent_id || 0,
          agent_approval: firstItem.agent_approval || '',
          agent_approval_date: firstItem.agent_approval_date || new Date(),
          agent_manager_id: firstItem.agent_manager_id || 0,
          agent_manager_approval: firstItem.agent_manager_approval || '',
          agent_manager_approval_date: firstItem.agent_manager_approval_date || new Date(),
          quote_status: firstItem.quote_status || "Open"
        },
        qr_product: result.output.map((item) => ({
          qr_id: item.qr_id,
          qr_item_id: item.qr_item_id,
          qty: item.qty,
          bc_product_qty:item.bc_product_qty,
          bc_product_name: item.bc_product_name,
          bc_product_price: item?.bc_product_price,
          bc_product_sale_price:item?.bc_product_sale_price,
          bc_product_url: item?.bc_product_url != null ? item?.bc_product_url : '#',
          bc_product_image:item.bc_product_image,
          bc_sku: item.bc_sku,
          bc_variant_name: item.bc_variant_name,
          bc_product_id: item.bc_product_id,
          unitPrice: item.unit_price
        }))
      });
      

    } catch (error) {
      console.error("Error fetching quote data:", error);
    }
  };

  const sendEmail = async () => {
    setLoader((prev) => ({ ...prev, updateAndSendEmail: true }));
    try {
      const result = await CreateCartForQouteItems(formData.quote_id);
      // var storeCreatedCartId = result.output.data.id
      // console.log("storeCreatedCartId---", storeCreatedCartId);
      
      // if (!result || !result.output.data || !result.output.data.id) {
      //   setLoader((prev) => ({ ...prev, updateAndSendEmail: false }));
      //   throw new Error("Failed to create cart for quote items.");
      // }
      var updateQuoteCall=await handleUpdate()
      
      const getCartItemID = result.output.data.id;
      const dataToSend = {
        quote_id: quoteId,
        bc_channel_id: formData.bc_channel_id,
        email_template_type: "agent_approval_template",
        store: 1,
        qr_customer: formData.qr_customer,
        qr_product: formData.qr_product,
        quote_type: formData.quote_type,
        cart_url: `http://localhost:3000/cart?${getCartItemID}`,
      };
      
      const emailResult = await sendEmailToCustomer(dataToSend);
      
      setLoader((prev) => ({ ...prev, updateAndSendEmail: false }));
    } catch (error) {
      setLoader((prev) => ({ ...prev, updateAndSendEmail: false }));
      console.error("Error occurred while sending email:", error.message || error);
    }
  };

  // Log updated formData
  useEffect(() => {
  }, [formData]);

  // Fetch data when quoteId changes
  useEffect(() => {
    callToGetQuoteDataBasedOnQuoteId();
  }, [quoteId]);
  // setFormData((prev) => ({
  //   ...prev,
  //   qr_customer: {
  //     ...prev.qr_customer,
  //     sub_total: formData.qr_product.reduce((total, product) => total + (product.unitPrice * product.qty), 0),
  //     total: formData.qr_product.reduce((total, product) => total + (product.unitPrice * product.qty), 0)
  //   }
  // }));
  const calculateTotalPrice = () => {
    
    return formData.qr_product.reduce((total, product) => total + (product.unitPrice * product.qty), 0);
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    var getMode = localStorage.getItem('QoutepageType');
    setMode(getMode);
  }, []);

  const isViewMode = mode === 'view';

  
  async function handleUploadFileToBucket (){    
    var uploadFileToBucked =await storeFileInS3Bucket(storeFile)
    if (uploadFileToBucked.success){
      setFormData({ ...formData, qr_customer: { ...formData.qr_customer, attachment: uploadFileToBucked.fileUrl } });
    }    
  }
  
  return (
    <div className={`flex justify-center ${isViewMode ? "pointer-events-none" : ""} bg-[#f7f8fc] py-[2rem] text-[#353535]`}>
      <form onSubmit={handleSubmit} className="relative flex w-[90%] flex-col gap-[10px]">
        <div className="flex flex-col gap-5 bg-white p-4">
          <div className="text-[20px] font-bold text-[#313440]">Quote Information</div>
          <div className="grid grid-cols-2 gap-[16px]">
            <div className="col-span-2 flex flex-row items-center justify-start gap-[20px]">
              <div className="text-[0.8rem]">Company</div>
              <div>
                <select
                  className="text-[0.8rem]"
                  name="company_name"
                  value={formData.qr_customer.company_name}
                  onChange={handleChange}
                  disabled={isViewMode}
                >
                  <option value="">No Account</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col">
              <label htmlFor="first_name" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.qr_customer.first_name}
                onChange={handleChange}
                className="w-full border-b border-b-gray-400 p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
                disabled={isViewMode}
              />
              {errors.first_name && <span className="text-red-500">{errors.first_name}</span>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="last_name" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.qr_customer.last_name}
                onChange={handleChange}
                className="w-full border-b border-b-gray-400 p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
                disabled={isViewMode}
              />
              {errors.last_name && <span className="text-red-500">{errors.last_name}</span>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="email_id" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                Email
              </label>
              <input
                type="email"
                name="email_id"
                value={formData.qr_customer.email_id}
                onChange={handleChange}
                className="w-full border-b border-b-gray-400 p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
                disabled={isViewMode}
              />
              {errors.email_id && <span className="text-red-500">{errors.email_id}</span>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="company_name" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                Company
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.qr_customer.company_name}
                onChange={handleChange}
                className="w-full border-b border-b-gray-400 p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
                disabled={isViewMode}
              />
              {errors.company_name && <span className="text-red-500">{errors.company_name}</span>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="expirationDate" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                Expiration Date
              </label>
              <input
                type="date"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
                className="w-full border-b border-b-gray-400 p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
                disabled={isViewMode}
              />
              {errors.expirationDate && <span className="text-red-500">{errors.expirationDate}</span>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="phone_number" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                Phone No
              </label>
              <input
                type="text"
                name="phone_number"
                value={formData.qr_customer.phone_number}
                onChange={handleChange}
                className="w-full border-b border-b-gray-400 p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
                disabled={isViewMode}
              />
              {errors.phone_number && <span className="text-red-500">{errors.phone_number}</span>}
            </div>
            
          </div>
          {
            !isViewMode &&
            <div>
            <button
              type="submit"
              className="rounded-[5px] bg-[#3C64F4] p-[6px_16px] text-[12px] uppercase text-white hover:bg-[#3C64F4]/90"
            >
              continue
            </button>
          </div>
          }

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
              <div className="flex flex-col">
                <label htmlFor="quote_status" className="text-[12px] text-[rgba(0,0,0,0.54)]">
                  Quote Status
                </label>
                <select
                  name="quote_status"
                  value={formData.qr_customer.quote_status == "" || formData.qr_customer.quote_status == "null" ? "Open" : formData.qr_customer.quote_status}
                  onChange={handleChange}
                  className="w-full border-b border-b-gray-400 p-[5px] text-[14px] outline-none hover:border-b-[#3C64F4]"
                  disabled={isViewMode}
                >
                  {/* <option value="">{formData.qr_customer.quote_status == "" || formData.qr_customer.quote_status == "null" ? "Open" : formData.qr_customer.quote_status }</option> */}
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                {errors.quote_status && <span className="text-red-500">{errors.quote_status}</span>}
              </div>
              {!isViewMode && (
                <NewProductQuote onAddProduct={handleAddCustomProduct}>
                  <button
                    type="button"
                    className="rounded-[5px] bg-[#3C64F4] p-[6px_16px] text-[12px] uppercase text-white hover:bg-[#3C64F4]/90 my-auto"
                  >
                    Add Custom Product +
                  </button>
                </NewProductQuote>
              )}
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full table-auto border-collapse border">
              <thead className="bg-[#ededed] [&_th]:p-[12px] [&_th]:text-[12px]">
                <tr className="border-b-[#c9c9cb] uppercase hover:[&>th]:cursor-pointer">
                  <th className="">
                    <div className="flex items-center justify-center gap-1">
                      <div>Line Items</div>
                    </div>
                  </th>
                  <th className="">
                    <div className="flex items-center justify-center gap-1">
                      <div>Original Price</div>
                    </div>
                  </th>
                  <th className="">
                    <div className="flex items-center justify-center gap-1">
                      <div>Sale Price</div>
                    </div>
                  </th>
                  <th className="">
                    <div className="flex items-center justify-center gap-1">
                      <div>Selected Qty</div>
                    </div>
                  </th>
                  <th className="">
                    <div className="flex items-center justify-center gap-1">
                      <div>Qty</div>
                    </div>
                  </th>
                 { !isViewMode &&
                   (       
                    <>
                    <th className="">
                    <div className="flex items-center justify-center gap-1">
                    <div>Unit Price</div>
                    </div>
                    </th>

                    <th className="">
                    <div className="flex items-center justify-center gap-1">
                    <div>Total Price</div>
                    </div>
                    </th>
                    </>            
                    )
                 }
                 
                  <th className="">
                    <div className="text-[#5C5C5C]">Action</div>
                  </th>
                </tr>
              </thead>
              <tbody className="[&_td]:p-[12px] [&_td]:text-center [&_td]:text-[12px] [&_td]:font-normal [&_tr:last-child]:[border-bottom:none;] [&_tr:last-child_td:last-child_.tooltip]:top-0 [&_tr:last-child_td:last-child_.tooltip]:translate-y-[-100%] [&_tr]:border-b [&_tr]:border-b-[#f6f7fb]">
                {formData?.qr_product?.map((product, index) => (
                  <tr key={index}>
                    <td className="min-w-[200px] max-w-[300px] [word-break:break-word]">
                      <div className="flex flex-row items-start gap-1">
                        <div className="min-h-[60px] min-w-[60px]">
                          <BcImage
                            width={60}
                            height={60}
                            unoptimized={true}
                            alt="product image"
                            src={product?.bc_product_image}
                          />
                        </div>
                        <div className="flex flex-col gap-[2px] text-left text-[12px] relative">
                          {
                            product.bc_product_url &&
                          <Link href={product?.bc_product_url} passHref target="_blank" rel="noopener noreferrer">
                            <SquareArrowUpRight size={12} className="cursor-pointer text-[#555] absolute right-[0px] hover:text-[#5b5fc7]" />
                          </Link>
                          }
                        
                          <div>
                            {product.bc_product_name}
                          </div>
                          <div className="font-bold">
                            <span>SKU: </span>
                            <span>{product.bc_sku}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-gray-500 line-through">
                        ${product?.bc_product_price}
                      </div>
                    </td>
                    <td>
                      <div className="text-green-600 font-bold">
                        ${product?.bc_product_sale_price}
                      </div>
                    </td>
                    <td className="">
                      <div className='font-bold'>
                        {product?.bc_product_qty}
                      </div>
                    </td>
                    <td className="cursor-pointer">
                      <div>
                        <input
                          type="number"
                          name="qty"
                          value={product.qty}
                          onChange={(e) => handleProductChange(index, e)}
                          className="w-full border-b border-b-black outline-none text-center"
                          disabled={isViewMode}
                        />
                      </div>
                    </td>
                    {!isViewMode && (
                    <td className="">
                      <div>
                        <input
                          type="number"
                          name="unitPrice"
                          value={product.unitPrice}
                          onChange={(e) => handleProductChange(index, e)}
                          className="w-full border-b border-b-black outline-none text-center"
                          disabled={isViewMode}
                        />
                      </div>
                      </td>
                       )}
                     {!isViewMode && (
                    <td className="">
                      <div>
                        ${(product.unitPrice * product.qty).toFixed(2)}
                      </div>
                    </td>
                     )}
                    {/* <td className="">
                      <div>
                        <ProductPriceAdjuster
                          parentSku={product?.bc_sku}
                          sku={product?.bc_sku}
                          oem_sku={product?.bc_sku}
                          productPrice={product?.unitPrice}
                          quantity={product?.qty}
                          onPriceChange={(newPrice) => handleProductChange(index, { target: { name: 'unitPrice', value: newPrice } })}
                          onQuantityChange={(newQty) => handleProductChange(index, { target: { name: 'qty', value: newQty } })}
                        />
                      </div>
                    </td> */}
                    <td>
                      <div className="flex items-center justify-center gap-1 text-[#555]">
                        <PopOverClick popOverContents={popOverContents} from="edit">
                          <Ellipsis className="cursor-pointer text-[#555]" />
                        </PopOverClick>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
          
          </div>
          { !isViewMode &&
          <div className="flex flex-row justify-end ">
           
          <div className="flex min-w-[340px] flex-col justify-end gap-[16px] p-[16px] text-[12px]">
            <div className="flex flex-row items-center justify-between">
              <label htmlFor="">Original Total</label>
              <div className="text-left">${calculateTotalPrice().toFixed(2)}</div>
            </div>
            <div className="flex flex-row items-center justify-between">
              <label htmlFor="">Original Total</label>
              <div className="text-left">${calculateTotalPrice().toFixed(2)}</div>
            </div>
          </div>
        </div>
          }

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
            name="quote_remarks"
            value={formData.qr_customer.quote_remarks}
            onChange={handleChange}
            className="h-[100px] w-full resize-none rounded-[5px] border border-gray-200 p-3 outline-none"
            disabled={isViewMode}
          ></textarea>
          {errors.quote_remarks && <span className="text-red-500">{errors.quote_remarks}</span>}
          <button
            type="submit"
            className="w-fit self-end rounded-[5px] bg-[#ededed] p-[6px_16px] uppercase hover:bg-[#ededed]/90"
          >
            Add Message
          </button>
        </div>
        <div className="flex flex-col gap-5 bg-white p-4">
          <div className="text-[20px] font-bold">Attachments</div>
          <div className="flex flex-row justify-start gap-[20px] text-[12px]">
            <div className="flex flex-1 flex-col justify-between gap-[20px]">
              <div className="relative">
                <input type="file" id="upload-file" className="z-10 h-full w-full cursor-pointer" onChange={handleFileChange} />
                <button
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-[5px] bg-[#3C64F4] p-[4px_16px] uppercase text-white hover:bg-[#3C64F4]/80"
                  onClick={()=>{handleUploadFileToBucket()}}
                >
                  <p className="font-open-sans text-[14px] font-medium tracking-[1.25px]">Upload File</p>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {loader.uploadFile && <Loader />}
                    </div>
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
        <div className="flex flex-col gap-5 bg-white p-4">
          <div className="text-[20px] font-bold">Video URL</div>
          <div className="flex flex-row justify-start gap-[20px] text-[12px]">
            <div className="flex flex-1 flex-col justify-between gap-[20px]">
              <div className="relative mr-[30px] flex flex-row items-center gap-[20px]">
                <input
                  type="text"
                  id="upload-file"
                  name="video"
                  value={formData.qr_customer.video}
                  onChange={handleChange}
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
        <div className='flex justify-end space-x-2'>
          {mode === 'edit' && (
            <button
              type="button"
              onClick={handleUpdate}
              className="relative w-fit self-end rounded-[5px] bg-[#3C64F4] p-[6px_16px] text-[12px] uppercase text-white hover:bg-[#3C64F4]/90"
            >
              <p className="font-open-sans text-[14px] font-medium tracking-[1.25px]">Update and Exit</p>
              <div className="absolute inset-0 flex items-center justify-center">
                {loader.updateAndExit && <Loader />}
              </div>
            </button>
          )}
          {showSendEmailButton && (
            <button
              type="button"
              onClick={sendEmail}
              className="relative w-fit self-end rounded-[5px] bg-[#3C64F4] p-[6px_16px] text-[12px] uppercase text-white hover:bg-[#3C64F4]/90"
            >
              <p className="font-open-sans text-[14px] font-medium tracking-[1.25px]">Update and Send Email</p>
              <div className="absolute inset-0 flex items-center justify-center">
                {loader.updateAndSendEmail && <Loader />}
              </div>
              
            </button>


          )}
        </div>
      </form>
    </div>
  );
};

export default page;
