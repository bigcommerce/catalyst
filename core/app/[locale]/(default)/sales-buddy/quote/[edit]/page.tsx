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
const popOverContents = [
  { key: 'refresh-product', label: 'Refresh Product' },
  { key: 'delete', label: 'Delete' },
];
const QuotePage = ({ formData, handleAddCustomProduct, handleProductChange }) => {
  return (
    <div className="flex flex-row w-full gap-6">
      <div className="flex-1">
        <div className="bg-[#ededed] mb-6">
          <div className="flex ">
            <button className="px-6 py-3 text-xs uppercase hover:text-[#3C64F4] hover:border-b-2 hover:border-[#3C64F4] min-w-[150px]">
              SEARCH
            </button>
            <button className="px-6 py-3 text-xs uppercase hover:text-[#3C64F4] hover:border-b-2 hover:border-[#3C64F4] min-w-[150px]">
              SEARCH BY SKU
            </button>
            <button className="px-6 py-3 text-xs uppercase hover:text-[#3C64F4] hover:border-b-2 hover:border-[#3C64F4] min-w-[150px]">
              CUSTOM PRODUCT
            </button>
            <NewProductQuote onAddProduct={handleAddCustomProduct}>
              <button
                type="button"
                className="rounded-[5px] bg-[#3C64F4] p-[6px_16px] text-[12px] uppercase text-white hover:bg-[#3C64F4]/90 my-auto"
              >
                New +
              </button>
            </NewProductQuote>
          </div>
        </div>
        <div className="border rounded-lg">
          {formData.qr_product.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center">
              <p className="text-gray-400 text-sm mb-2">No Products Added</p>
              <p className="text-[#3C64F4] text-base">Use search to add products</p>
            </div>
          ) : (
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
                        <div>Qty</div>
                      </div>
                    </th>
                    <th className="">
                      <div className="flex items-center justify-center gap-1">
                        <div>Unit Price</div>
                      </div>
                    </th>
                    <th className="">
                      <div className="flex items-center justify-center gap-1">
                        <div>Extended Price</div>
                      </div>
                    </th>
                    <th className="">
                      <div className="flex items-center justify-center gap-1">
                        <div>Total Price</div>
                      </div>
                    </th>
                    <th className="">
                      <div className="text-[#5C5C5C]">Action</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_td]:p-[12px] [&_td]:text-center [&_td]:text-[12px] [&_td]:font-normal [&_tr:last-child]:[border-bottom:none;] [&_tr:last-child_td:last-child_.tooltip]:top-0 [&_tr:last-child_td:last-child_.tooltip]:translate-y-[-100%] [&_tr]:border-b [&_tr]:border-b-[#f6f7fb]">
                  {formData.qr_product.map((product, index) => (
                    <tr key={index}>
                      <td className="min-w-[200px] max-w-[300px] [word-break:break-word]">
                        <div className="flex flex-row items-start gap-1">
                          <div className="min-h-[60px] min-w-[60px]">
                            <BcImage
                              width={60}
                              height={60}
                              unoptimized={true}
                              alt="product image"
                              src={CartIcon}
                            />
                          </div>
                          <div className="flex flex-col gap-[2px] text-left text-[12px]">
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
                      <td className="cursor-pointer">
                        <div>
                          <input
                            type="number"
                            name="qty"
                            value={product.qty}
                            onChange={(e) => handleProductChange(index, e)}
                            className="w-full border-b border-b-black outline-none text-center"
                          />
                        </div>
                      </td>
                      <td className="">
                        <div>
                          <input
                            type="number"
                            name="unitPrice"
                            value={product.unitPrice}
                            onChange={(e) => handleProductChange(index, e)}
                            className="w-full border-b border-b-black outline-none text-center"
                          />
                        </div>
                      </td>
                      <td className="">
                        <div>
                          <input
                            type="number"
                            name="extendedPrice"
                            value={product.extendedPrice}
                            onChange={(e) => handleProductChange(index, e)}
                            className="w-full border-b border-b-black outline-none text-center"
                          />
                        </div>
                      </td>
                      <td className="">
                        <div>
                          ${(product.unitPrice * product.qty).toFixed(2)}
                        </div>
                      </td>
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
          )}
        </div>
      </div>
    </div>
  );
};

const page = () => {
  const router = useRouter();
  const { edit } = useParams(); // Extracting the dynamic ID
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
      agent_id: '',
      agent_approval: '',
      agent_approval_date: '',
      agent_manager_id: '',
      agent_manager_approval: '',
      agent_manager_approval_date: '',
      quote_status: ''
    },
    qr_product: []
  });

  const [quoteId, setQuoteId] = useState(edit);
  const [errors, setErrors] = useState({});
  const [mode, setMode] = useState('edit'); // Default to 'edit' mode

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.qr_customer) {
      setFormData({ ...formData, qr_customer: { ...formData.qr_customer, [name]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...formData.qr_product];
    updatedProducts[index] = { ...updatedProducts[index], [name]: value };
    updatedProducts[index].extendedPrice = updatedProducts[index].unitPrice * updatedProducts[index].qty;
    setFormData({ ...formData, qr_product: updatedProducts });
  };

  const handleAddProduct = () => {
    setFormData({ ...formData, qr_product: [...formData.qr_product, { bc_product_id: '', bc_sku: '', bc_product_name: '', bc_variant_id: '', bc_variant_sku: '', bc_variant_name: '', bc_modifier_id: '', bc_modifier_option: '', options: '', qty: '', extendedPrice: '' }] });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachments: [...e.target.files] });
  };

  const handleAddCustomProduct = (product) => {
    setFormData({
      ...formData,
      qr_product: [
        ...formData.qr_product,
        {
          type: 'custom',
          agent_name: 'Agent Name',
          bc_product_name: product.name,
          bc_sku: product.sku,
          qty: product.quantity,
          unitPrice: product.price,
          extendedPrice: product.price * product.quantity
        }
      ]
    });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.qr_customer.first_name) tempErrors.first_name = "First Name is required";
    if (!formData.qr_customer.last_name) tempErrors.last_name = "Last Name is required";
    if (!formData.qr_customer.email_id) tempErrors.email_id = "Email is required";
    if (!formData.qr_customer.company_name) tempErrors.company_name = "Company Name is required";
    if (!formData.qr_customer.phone_number) tempErrors.phone_number = "Phone Number is required";
    if (!formData.qr_customer.quote_remarks) tempErrors.quote_remarks = "Quote Remarks are required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log(formData);
      // Submit form data
    }
  };

  const handleUpdate = async () => {
    const payload = {
      quote_id: formData.quote_id,
      qr_customer: {
        sub_total: formData.qr_customer.sub_total,
        total: formData.qr_customer.total,
        expires: formData.qr_customer.expires,
        notes: formData.qr_customer.notes,
        video: formData.qr_customer.video,
        attachment: formData.qr_customer.attachment,
        agent_id: formData.qr_customer.agent_id,
        agent_approval: formData.qr_customer.agent_approval,
        agent_approval_date: formData.qr_customer.agent_approval_date,
        agent_manager_id: formData.qr_customer.agent_manager_id,
        agent_manager_approval: formData.qr_customer.agent_manager_approval,
        agent_manager_approval_date: formData.qr_customer.agent_manager_approval_date,
        quote_status: formData.qr_customer.quote_status
      },
      qr_product: formData.qr_product.map(product => ({
        qr_item_id: product.qr_item_id,
        qty: product.qty,
        unit_price: product.unitPrice,
        total_price: product.extendedPrice
      }))
    };
    var updateQuoteData = await UpdateQuote(payload);
    console.log("Update Quote Data:", updateQuoteData);
    console.log("Update Payload:", payload);
  };

  const callToGetQuoteDataBasedOnQuoteId = async () => {
    if (!quoteId) return; // Ensure quoteId is available

    console.log("Fetching data for quoteId:", quoteId);
    let result = await GetQuoteBasedOnID(quoteId);

    console.log("API Response:", result);

    // Ensure result.output is an array
    if (Array.isArray(result.output) && result.output.length > 0) {
      const firstItem = result.output[0]; // Use the first object as the main quote details
      console.log("First Item:", firstItem);
      result.output.map((item) => {
        console.log("Item:", item);
      });

      setFormData({
        quote_id: firstItem.quote_id || '',
        bc_channel_id: firstItem.bc_channel_id || '',
        bc_customer_id: firstItem.bc_customer_id || '',
        quote_type: firstItem.quote_type || '',
        qr_customer: {
          first_name: firstItem.first_name || '',
          last_name: firstItem.last_name || '',
          email_id: firstItem.email_id || '',
          company_name: firstItem.company_name || '',
          phone_number: firstItem.phone_number || '',
          quote_remarks: firstItem.quote_remarks || '',
          sub_total: firstItem.sub_total || 0,
          total: firstItem.total || 0,
          expires: firstItem.expires || '',
          notes: firstItem.notes || '',
          video: firstItem.video || '',
          attachment: firstItem.attachment || '',
          agent_id: firstItem.agent_id || '',
          agent_approval: firstItem.agent_approval || '',
          agent_approval_date: firstItem.agent_approval_date || '',
          agent_manager_id: firstItem.agent_manager_id || '',
          agent_manager_approval: firstItem.agent_manager_approval || '',
          agent_manager_approval_date: firstItem.agent_manager_approval_date || '',
          quote_status: firstItem.quote_status || ''
        },
        qr_product: result.output.map((item) => ({
          qr_id: item.qr_id,
          qr_item_id: item.qr_item_id,
          qty: item.qty,
          bc_product_name: item.bc_product_name,
          bc_sku: item.bc_sku,
          bc_variant_name: item.bc_variant_name,
          bc_product_id: item.bc_product_id,
          unitPrice: item.unit_price,
          extendedPrice: item.total_price
        }))
      });
    }
  };

  useEffect(() => {
    callToGetQuoteDataBasedOnQuoteId();
  }, [quoteId]);

  useEffect(() => {
    console.log("Updated formData:", formData);
  }, [formData]);

  const calculateTotalPrice = () => {
    return formData.qr_product.reduce((total, product) => total + (product.unitPrice * product.qty), 0);
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const modeParam = query.get('mode');
    if (modeParam) {
      setMode(modeParam);
    }
  }, []);

  return (
    <div className="flex justify-center bg-[#f7f8fc] py-[2rem] text-[#353535]">
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
              />
              {errors.phone_number && <span className="text-red-500">{errors.phone_number}</span>}
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="rounded-[5px] bg-[#3C64F4] p-[6px_16px] text-[12px] uppercase text-white hover:bg-[#3C64F4]/90"
            >
              continue
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-5 bg-white p-4">
          <div className="flex flex-row items-center justify-between gap-[20px]">
            <div className="text-[20px] font-bold">Add product to quote</div>
            <div className="mr-5 flex flex-row items-center gap-5 text-[14px]">
              <div>Currency: CAD</div>
              <hr className="h-auto w-[1px] self-stretch bg-[rgba(0,0,0,0.12)]" />
              <div>
                <RotateCw className="cursor-pointer text-gray-400" />
              </div>
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
                      <div>Qty</div>
                    </div>
                  </th>
                  <th className="">
                    <div className="flex items-center justify-center gap-1">
                      <div>Unit Price</div>
                    </div>
                  </th>
                  <th className="">
                    <div className="flex items-center justify-center gap-1">
                      <div>Extended Price</div>
                    </div>
                  </th>
                  <th className="">
                    <div className="flex items-center justify-center gap-1">
                      <div>Total Price</div>
                    </div>
                  </th>
                  <th className="">
                    <div className="text-[#5C5C5C]">Action</div>
                  </th>
                </tr>
              </thead>
              <tbody className="[&_td]:p-[12px] [&_td]:text-center [&_td]:text-[12px] [&_td]:font-normal [&_tr:last-child]:[border-bottom:none;] [&_tr:last-child_td:last-child_.tooltip]:top-0 [&_tr:last-child_td:last-child_.tooltip]:translate-y-[-100%] [&_tr]:border-b [&_tr]:border-b-[#f6f7fb]">
                {formData.qr_product.map((product, index) => (
                  <tr key={index}>
                    <td className="min-w-[200px] max-w-[300px] [word-break:break-word]">
                    {console.log()}
                      <div className="flex flex-row items-start gap-1">
                        <div className="min-h-[60px] min-w-[60px]">
                          <BcImage
                            width={60}
                            height={60}
                            unoptimized={true}
                            alt="product image"
                            src={CartIcon}
                          />
                        </div>
                        <div className="flex flex-col gap-[2px] text-left text-[12px]">
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
                    <td className="cursor-pointer">
                      <div>
                        <input
                          type="number"
                          name="qty"
                          value={product.qty}
                          onChange={(e) => handleProductChange(index, e)}
                          className="w-full border-b border-b-black outline-none text-center"
                        />
                      </div>
                    </td>
                    <td className="">
                      <div>
                        <input
                          type="number"
                          name="unitPrice"
                          value={product.unitPrice}
                          onChange={(e) => handleProductChange(index, e)}
                          className="w-full border-b border-b-black outline-none text-center"
                        />
                      </div>
                      </td>
                    <td className="">
                      <div>
                        <input
                          type="number"
                          name="extendedPrice"
                          value={product.extendedPrice}
                          onChange={(e) => handleProductChange(index, e)}
                          className="w-full border-b border-b-black outline-none text-center"
                        />
                      </div>
                    </td>
                    <td className="">
                      <div>
                        ${(product.unitPrice * product.qty).toFixed(2)}
                      </div>
                    </td>
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
          <div className="flex flex-row">
            <div className="flex flex-1 flex-col gap-[20px]">
              {/* <div className="box-border flex flex-row justify-start bg-[#ededed] text-[12px] [&>button]:min-w-[150px] [&>button]:p-[12px] [&>button]:uppercase">
                <button className="hover:border-b-2 hover:border-b-[#3C64F4] hover:text-[#3C64F4]">Search</button>
                <button className="hover:border-b-2 hover:border-b-[#3C64F4] hover:text-[#3C64F4]">
                  Search By SKU
                </button>
                <button className="hover:border-b-2 hover:border-b-[#3C64F4] hover:text-[#3C64F4]">
                  Custom Product
                </button>
              </div> */}
              {/* <div className="flex flex-row items-center justify-start gap-[30px]">
                <div className="flex w-fit min-w-[300px] flex-row items-center justify-between gap-[10px] rounded-[5px] border border-gray-200 p-[5px] text-[12px]">
                  <div className="relative w-full">
                    <input
                      type="text"
                      className="w-full pr-5 outline-none"
                      placeholder="Search for products with keywords"
                    />
                    <X
                      width={16}
                      height={16}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-row items-center gap-[10px]">
                    <hr className="h-auto w-[1px] self-stretch bg-[rgba(0,0,0,0.12)]" />
                    <Search className="cursor-pointer" />
                  </div>
                </div>
                <div>
                  <NewProductQuote onAddProduct={handleAddCustomProduct}>
                    <button
                      type="button"
                      className="rounded-[5px] bg-[#3C64F4] p-[6px_16px] text-[12px] uppercase text-white hover:bg-[#3C64F4]/90"
                    >
                      New +
                    </button>
                  </NewProductQuote>
                </div>
              </div> */}
                <QuotePage formData={formData} handleAddCustomProduct={handleAddCustomProduct} handleProductChange={handleProductChange} />
              
            </div>
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
                <label
                  htmlFor="upload-file"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-[5px] bg-[#3C64F4] p-[4px_16px] uppercase text-white hover:bg-[#3C64F4]/80"
                >
                  Upload File
                </label>
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
        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleUpdate}
            className="w-fit self-end rounded-[5px] bg-[#3C64F4] p-[6px_16px] text-[12px] uppercase text-white hover:bg-[#3C64F4]/90"
          >
            Update
          </button>
        )}
      </form>
    </div>
  );
};

export default page;
