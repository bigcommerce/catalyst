"use client";
import React, { useState } from "react";
import Image from "next/image";
import { cookies } from "next/headers";


interface ProductPriceAdjusterProps {
    // parentSku: string;
    sku: string;
    extendedSalePrice: any;
    initialCost: number;
    initialFloor: number;
    initialMarkup: number;
}
const url = process.env.SERVER_URL;
const EditIcon = () => {
    return (
        <svg
            width="19"
            height="14"
            viewBox="0 0 19 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M1.7028 17.9723C1.3528 18.0556 1.04864 17.9681 0.790302 17.7098C0.531969 17.4515 0.444469 17.1473 0.527802 16.7973L1.5278 12.0223L6.4778 16.9723L1.7028 17.9723ZM6.4778 16.9723L1.5278 12.0223L12.9778 0.572314C13.3611 0.188981 13.8361 -0.00268555 14.4028 -0.00268555C14.9695 -0.00268555 15.4445 0.188981 15.8278 0.572314L17.9278 2.67231C18.3111 3.05565 18.5028 3.53065 18.5028 4.09731C18.5028 4.66398 18.3111 5.13898 17.9278 5.52231L6.4778 16.9723ZM14.4028 1.97231L4.0528 12.3223L6.1778 14.4473L16.5278 4.09731L14.4028 1.97231Z"
                fill="white"
            />
        </svg>
    );
};
export const ProductPriceAdjuster = ({
    // parentSku,
    sku,
    extendedSalePrice,
    initialCost,
    initialFloor,
    initialMarkup, }: ProductPriceAdjusterProps) => {
    const [cost, setCost] = useState<number>(initialCost);
    const [floor] = useState<number>(initialFloor);
    const [markup] = useState<number>(initialMarkup);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [newCost, setNewCost] = useState<number>(cost);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // Input change handler
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setNewCost(value >= 0 ? value : 0); // Ensure no negative values
    };

    // Save handler
    const handleSave = async () => {
        setIsSaving(true);
        const access_id = "belami-arizon-1234";
        const cart_id = "a442a1ac-025d-4e2d-a562-be17998b114d";
        const product_id =  "7853";
        const list_price = newCost; // New price
        try {
            const response = await fetch(
                "${url}/v1/update-price",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        list_price,
                        product_id,
                        cart_id ,
                        access_id,
                    }),
                });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            setCost(newCost); // Update displayed cost
            setIsEditing(false); // Exit editing mode
        } catch (err) {
            console.error("Error updating the API:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full bg-[#353535] p-[10px] text-white">
            <div className="my-0 mx-auto h-[24px] flex items-center justify-between border-b border-[#cccbcb]">
                <p className="text-[14px] leading-[24px] tracking-[0.25px] font-bold">PARENT SKU</p>
                <p className="text-[14px] font-normal tracking-[0.25px]">{sku}</p>
            </div>
            {/* <hr className="border-white-600 m-2" /> */}
            <div className="my-0 mx-auto h-[24px] flex items-center justify-between border-b border-[#cccbcb]">
                <p className="text-[14px] leading-[24px] tracking-[0.25px] font-bold">SKU</p>
                <p className="text-[14px] font-normal tracking-[0.25px]">{sku}</p>
            </div>
            {/* <hr className="border-white-600 m-2" /> */}
            <div className="my-0 mx-auto h-[24px] flex items-center justify-between border-b border-[#cccbcb]">
                <p className="text-[14px] leading-[24px] tracking-[0.25px] font-bold">Cost</p>
                <p className="text-[14px] font-normal tracking-[0.25px]">{extendedSalePrice}</p>
            </div>
            {/* <hr className="border-white-600 m-2" /> */}
            <div className="my-0 mx-auto h-[24px] flex items-center justify-between border-b border-[#cccbcb]">
                <p className="text-[14px] leading-[24px] tracking-[0.25px] font-bold">Floor ($)</p>
                <p className="text-[14px] font-normal tracking-[0.25px]">{floor?.toFixed(2)}</p>
            </div>
            {/* <hr className="border-white-600 m-2" /> */}
            <div className="my-0 mx-auto h-[24px] flex items-center justify-between ">
                <p className="text-[14px] leading-[24px] tracking-[0.25px] font-bold">Markup</p>
                <p className="text-[14px] font-normal tracking-[0.25px]">{markup?.toFixed(1)}</p>
            </div>
            {/* <hr className="border-white-600 m-2" /> */}
            {!isEditing && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="w-full rounded-sm bg-[#1DB14B] px-[10px] py-[5px] h-[42px] hover:bg-green-700"
                >
                    <div className="flex items-center justify-center">
                        <EditIcon />
                        <span className="text-[14px] font-medium tracking-[1.25px] leading-[32px] items-center">ADJUST PRICE</span>
                    </div>
                </button>
            )}
            {isEditing && (
                <>
                    <input
                        type="number"
                        value={newCost}
                        onChange={handleInputChange}
                        className="mb-4 w-full rounded border-none bg-white p-2 text-black"
                        placeholder="$0.00"
                        disabled={isSaving}
                    />
                    <div className="mt-[10px] flex items-center justify-center">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="mb-2 mr-2 w-full rounded bg-white px-4 py-2 text-black"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="mb-2 w-full rounded bg-[#1DB14B] px-4 py-2 text-white"
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// export default ProductPriceAdjuster;
