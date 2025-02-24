'use client';
import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '~/components/ui/form';
import { Label } from '~/components/ui/form';
import { Button } from '~/components/ui/button';
import { BcImage } from '~/components/bc-image';
import closeIcon from '~/public/add-to-cart/flyoutCloseIcon.svg';
import { customerInfo } from '../actions/handleRequestQuote';
import { CreateQuote } from '../actions/CreateQuote';
import { usePathname } from 'next/navigation';
import { GetCartDetials } from '../actions/GetCartDetials';
import toast from 'react-hot-toast';
import { sendEmailToCustomer } from '../actions/SendEmailToCustomer';
import { log } from 'console';

interface FlyoutFormProps {
  isOpen?: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email_id: string;
  company_name: string;
}

interface CustomerData {
  id?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  email?: string;
  company_name?: string;
}

interface ProductOption {
  type: string;
  label: string;
  modifierId?: string;
  modifierOptionId?: string;
}
export interface CartData {
  bc_product_id: string | number;
  bc_sku: string;
  bc_product_name: string;
  bc_variant_id: string | number;
  bc_variant_sku: string;
  bc_variant_name: string;
  bc_modifier_id: string | number;
  bc_modifier_option: string | number;
  options: string;
}
const FlyoutForm = ({ isOpen, onOpenChange }: FlyoutFormProps) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '', 
    phone_number: '',
    email_id: '', 
    company_name: '',
  });

  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [existingSessionId, setExistingSessionId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingToExisting, setIsAddingToExisting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [quoteCartData, setquoteCartData] = useState<CartData[]>();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pageName = usePathname();
  
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const storedSessionId = localStorage.getItem('session_id$');
        if (storedSessionId) {
          setExistingSessionId(storedSessionId);
        }

        const cData = await customerInfo();
        if (cData && pageName !== '/sales-buddy/quote') {
          setCustomerData(cData as CustomerData);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }

    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (isOpen) {
      const fetchCartData = async () => {
        try {
          const CartItemsData: any = await GetCartDetials();
          console.log(CartItemsData);
          const cartLineItems = CartItemsData?.lineItems?.physicalItems || [];
          const customItmes = CartItemsData?.lineItems?.customItems || [];
          const formattedCutomItemData = customItmes?.map(item => ({
            bc_sku: item.sku,
            bc_product_name: item.name,
            bc_product_id: 0,
            bc_variant_id: "custom",
            bc_variant_sku: item.entityId,
            bc_variant_name: "custom",
            options: "custom",
            type: "custom",
          }));
          if (cartLineItems.length > 0) {
            const lineItemsData = cartLineItems.map((item: any) => {
              const selectedOptions = item?.selectedOptions || [];
              const productSelectedOpt = selectedOptions
                ?.map((option: any) => {
                  if (Array.isArray(item?.baseCatalogProduct?.productOptions?.edges)) {
                    const optionFromProduct = item?.baseCatalogProduct?.productOptions?.edges.find(
                      (prodOption: any) => prodOption.node.entityId === option.entityId
                    );

                    if (optionFromProduct) {
                      const selectedValue = optionFromProduct?.node?.values?.edges.find(
                        (valueItem: any) => valueItem.node.entityId === option.valueEntityId
                      );

                      if (selectedValue) {
                        const isVariant = optionFromProduct.node.isVariantOption ?? false;

                        if (isVariant) {
                          return { type: "variant", label: selectedValue.node.label };
                        } else {
                          return {
                            type: "modifier",
                            label: selectedValue.node.label,
                            modifierId: optionFromProduct.node.entityId,
                            modifierOptionId: selectedValue.node.entityId,
                          };
                        }
                      }
                    }
                  }
                  return undefined;
                })
                .filter(Boolean);

                const selectedVariantsVal = selectedOptions?.map((field:any)=>(
                  {
                    option_id: field.entityId,
                    option_value: field.value,
                    name:field?.name,
                    value: field.optionLabelName,
                  }
                ));

              const variantLabels = productSelectedOpt
                ?.filter((item: any) => item?.type === "variant")
                .map((item: any) => item?.label)
                .join(", ");

              return {
                bc_product_price: item?.catalogProductWithOptionSelections?.prices?.retailPrice?.value ?? item?.originalPrice?.value,
                bc_product_sale_price:item?.extendedSalePrice?.value ?? item?.listPrice?.value,
                bc_product_id: item.productEntityId,
                bc_sku: item.sku,
                bc_product_url:item?.url ?? "#",
                bc_product_qty:item?.quantity ?? 1,
                bc_product_image:item?.imageUrl,
                bc_product_name: item.name,
                bc_variant_id: item.variantEntityId,
                bc_variant_sku: item?.sku,
                bc_variant_name: variantLabels || "",
                option_selections: JSON.stringify(selectedVariantsVal),
                options: productSelectedOpt.map((opt: any) => opt.label).join(", "),
                type: "product",
              };
            });
            const finalLineItems = customItmes.length > 0 ? [...lineItemsData, ...formattedCutomItemData] : [...lineItemsData];
            setquoteCartData(finalLineItems);
          } else {
            setquoteCartData([]);
          }

        } catch (error) {
          console.error("Error fetching updated cart data:", error);
        }
      };

      fetchCartData();
    }
  }, [isOpen]);


  useEffect(() => {
    if (customerData) {
      setFormData({
        first_name: customerData.first_name || '',
        last_name: customerData.last_name || '',
        phone_number: customerData.phone_number || '',
        email_id: customerData.email || '',
        company_name: customerData.company_name || '',
      });
    }
  }, [customerData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Last Name Validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First Name is required';
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'Must be at least 2 characters';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last Name is required';
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'Must be at least 2 characters';
    }

    if (!formData.email_id.trim()) {
      newErrors.email_id = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email_id)) {
      newErrors.email_id = 'Invalid email format';
    }

    if (formData.phone_number.trim() && !/^\d{10,}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateSessionId = (): string => {
    return `QR_${new Date().getTime()}`;
  };




  const createQuoteRequest = async (sessionId: string, isNewQuote: boolean = true, cartData: CartData[],latestQuoteData: any) => {
console.log("createQuoteRequest",cartData);
console.log(quoteCartData,"lineItemsData>>>")

    const quoteType = isNewQuote ? 'New' : 'old';
    let dataToSend;
    if (pageName === '/sales-buddy/quote') {
      dataToSend = {
        quote_id: sessionId,
        qr_customer: formData,
        bc_customer_id: customerData?.id ?? 0,
        qr_product: [],
        cart_url: ""
      };
    } else {
      dataToSend = {
        quote_id: sessionId,
        bc_customer_id: customerData?.id ?? 0,
        quote_type: quoteType,
        qr_customer: formData,
        qr_product: pageName === '/cart/' ? cartData : [latestQuoteData],
        page_type: pageName === '/cart/' ? 'cart' : 'pdp',
        cart_url: ""
      };
    }

    try {
      console.log(dataToSend,"data......")
      const result = await CreateQuote(dataToSend);
      if (result) {
        setSubmitStatus('success');
        setSuccessMessage('Quote Added successfully!');
        if (isNewQuote) {
          setIsSubmitting(true);
          setSuccessMessage('Quote requested successfully!');
          localStorage.setItem('session_id$', sessionId);
          setExistingSessionId(sessionId);
        }
        if (pageName !== '/sales-buddy/quote') {

          const emailResult = await sendEmailToCustomer(dataToSend);
          console.log(emailResult)
        }

        setTimeout(() => {
          setSuccessMessage(null);
          onOpenChange(false);
        }, 400);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error creating quote:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    const storedQuote = localStorage.getItem("Q_R_data");
    let latestQuoteData = storedQuote ? JSON.parse(storedQuote) : [];

    const newSessionId = generateSessionId();
    await createQuoteRequest(newSessionId, true, quoteCartData as CartData[],latestQuoteData);
  };

  const handleAddToExistingQuote = async () => {
    if (!existingSessionId || !validateForm()) return;
    setIsAddingToExisting(true); 
    const storedQuote = localStorage.getItem("Q_R_data");
    let latestQuoteData = storedQuote ? JSON.parse(storedQuote) : [];
    await createQuoteRequest(existingSessionId, false, quoteCartData as CartData[],latestQuoteData);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
        <Dialog.Content className="popup-container-parent data-[state=open]:animate-contentShow fixed left-[50%] right-[unset] top-[50%] z-[100] flex h-[100vh] w-[90vw] max-w-[610px] animate-mobSlideInFromLeft flex-col gap-[20px] overflow-auto rounded-[6px] bg-white px-[40px] py-[20px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] [transform:translate(-50%,-50%)] focus:outline-none sm:left-[unset] sm:right-[0] sm:translate-y-[-50%] sm:animate-slideInFromLeft">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{pageName === '/sales-buddy/quote' ? "Create A Quote" : "Request Quote"}</h2>
            <Dialog.Close asChild>
              <button className="rounded-full p-2 hover:bg-gray-100" onClick={() => onOpenChange(false)}>
                <BcImage alt="Close" src={closeIcon} width={14} height={14} unoptimized={true} />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {Object.entries({
                firstName: { label: 'First Name', name: 'first_name', type: 'text' },
                lastName: { label: 'Last Name', name: 'last_name', type: 'text' },
                email: { label: 'Email', name: 'email_id', type: 'email' },
                companyName: { label: 'Company Name', name: 'company_name', type: 'text' },
                contact: { label: 'Contact Number', name: 'phone_number', type: 'tel' },
              }).map(([key, field]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{field.label}</Label>
                  <Input
                    id={key}
                    name={field.name}
                    type={field.type}
                    value={formData[field.name as keyof FormData]}
                    onChange={handleChange}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    className="w-full rounded border"
                    required={field.name !== 'company_name' && field.name !== 'phone_number'}
                  />
                  {errors[field.name as keyof FormData] && (
                    <p className="text-sm text-red-500">{errors[field.name as keyof FormData]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
  <Dialog.Close asChild>
    <Button
      type="button"
      variant="primary"
      className="bg-black text-white hover:bg-red-600 px-3 py-3 text-sm"
    >
      Cancel
    </Button>
  </Dialog.Close>

  {existingSessionId && pageName !== "/sales-buddy/quote" && (
    <Button
      type="button"
      variant="secondary"
      className="bg-yellow-500 text-white hover:bg-yellow-600 px-3 py-3 text-sm"
      onClick={handleAddToExistingQuote}
      disabled={isAddingToExisting}
    >
      {isAddingToExisting ? "Adding..." : "Add to Existing Quote"}
    </Button>
  )}

  <Button
    type="submit"
    className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-3 text-sm"
    disabled={isSubmitting}
  >
    {isSubmitting ? "Submitting..." : "Submit"}
  </Button>
</div>
          </form>

          {submitStatus === 'success' &&
                <p className="mt-2 text-center text-sm text-green-600">{successMessage}</p>
          }
          {submitStatus === 'error' && (
            <p className="mt-2 text-sm text-red-500">
              There was an error submitting your quote. Please try again.
            </p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FlyoutForm;
