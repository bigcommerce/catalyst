'use client';
import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Input } from '~/components/ui/form';
import { Label } from '~/components/ui/form';
import { Button } from '~/components/ui/button';
import { BcImage } from '~/components/bc-image';
import closeIcon from '~/public/add-to-cart/flyoutCloseIcon.svg';
import { customerInfo } from '../actions/handleRequestQuote';

interface FlyoutFormProps {
    isOpen?: boolean; 
    onOpenChange: (open: boolean) => void; 
}

interface FormData {
    firstName: string;
    lastName: string;
    contact: string;
    email: string;
    companyName: string;
}

interface CustomerData {
    first_name?: string;
    last_name?: string;
    contact?: string;
    email?: string;
    company_name?: string;
}

const FlyoutForm = ({ isOpen, onOpenChange }: FlyoutFormProps) => {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        contact: '',
        email: '',
        companyName: ''
    });
    const [customerData, setCustomerData] = useState<CustomerData | null>(null);
    const [qReqPdata, setQReqPdata] = useState(null);
    const [errors, setErrors] = useState<Partial<FormData>>({});


    useEffect(() => {
    let storedQuote = localStorage.getItem("Q_R_data");
        if (storedQuote){
            const parsedQuote = JSON.parse(storedQuote);
            const dataSize = new Blob([parsedQuote]).size;
// console.log(`Size of stringified object: ${dataSize} bytes`);
            setQReqPdata(parsedQuote);
        }
        const loginCustomer = async () => {
            const cData = await customerInfo();
            if (cData) {
                setCustomerData(cData as any);
                console.log(cData,"DataTest");
            }
        };

        loginCustomer();

    },[]);


useEffect(() => {

    if (customerData) {
        setFormData({
            firstName: customerData.first_name || '',
            lastName: customerData.last_name || '',
            contact: customerData.contact || '',
            email: customerData.email || '',
            companyName: customerData.company_name || '',
        });
    }
}, [customerData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };
    
    const validateForm = () => {

        const newErrors: Partial<FormData> = {};

        // First Name Validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First Name is required';
        } else if (formData.firstName.length < 2) {
            newErrors.firstName = 'Must be at least 2 characters';
        }

        // Last Name Validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last Name is required';
        } else if (formData.lastName.length < 2) {
            newErrors.lastName = 'Must be at least 2 characters';
        }

        // Email Validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        // Contact Validation (if entered, must be valid)
        if (formData.contact.trim() && !/^\d{10,}$/.test(formData.contact)) {
            newErrors.contact = 'Must be at least 10 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        console.log('Form submitted:', formData);
        onOpenChange(false); 
    };
    
    return (
        <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
                <Dialog.Content className="popup-container-parent data-[state=open]:animate-contentShow left-[50%] sm:left-[unset] fixed right-[unset] sm:right-[0] top-[50%] z-[100] flex h-[100vh] w-[90vw] max-w-[610px] [transform:translate(-50%,-50%)] sm:translate-y-[-50%] animate-mobSlideInFromLeft sm:animate-slideInFromLeft flex-col gap-[20px] overflow-auto rounded-[6px] bg-white px-[40px] py-[20px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
                    <div className="flex flex-col">
                        <div className="flex flex-col items-center justify-center gap-[20px]">
                            <Dialog.Close asChild>
                                <button
                                    aria-modal
                                    className="text-violet11 inline-flex h-full w-full appearance-none items-center justify-center rounded-full"
                                    aria-label="Close"
                                >
                                    <BcImage
                                        alt="Close Icon"
                                        width={14}
                                        height={14}
                                        unoptimized={true}
                                        className=""
                                        src={closeIcon}
                                    />
                                </button>
                            </Dialog.Close>
                        </div>
                        
                        <Dialog.Content className="!pointer-events-auto">
                        <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Enter your first name"
                                        className="w-full border rounded"
                                        required
                                    />
                                     {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Enter your last name"
                                        className="w-full border rounded"
                                        required
                                    />
                                     {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        className="w-full border rounded"
                                        required
                                    />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input
                                        id="companyName"
                                        name="companyName"
                                        type="text"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder="Enter your Company Name"
                                        className="w-full border rounded"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact">Contact Number</Label>
                                    <Input
                                        id="contact"
                                        name="contact"
                                        type="tel"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        placeholder="Enter your contact number"
                                        className="w-full border rounded"
                                    />
                                    {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
                                </div>


                                <div className="flex justify-end space-x-2 pt-4">
                                    <Dialog.Close asChild>
                                        <Button variant="primary" className="bg-gray-100">
                                            Cancel
                                        </Button>
                                    </Dialog.Close>
                                    <Button type="submit" className="bg-blue-600 text-white">
                                        Submit
                                    </Button>
                                </div>
                            </form>
                        </Dialog.Content>

                        <Dialog.Close asChild>
                            <button
                                aria-modal
                                className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute right-[10px] top-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full"
                                aria-label="Close"
                            ></button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default FlyoutForm;