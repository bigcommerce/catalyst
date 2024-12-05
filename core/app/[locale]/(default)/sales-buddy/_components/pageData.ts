'use server'

import { cookies } from "next/headers";
import React, {useState} from "react";

const handleSave = async () => {
    const cookieStore = await cookies();
    const cartId = cookieStore.get('cartId')?.value;
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    setIsSaving(true);
    setError(null);
    setSuccess(false);
    const access_id = "belami-arizon-1234";
    const access_token = process.env.BIGCOMMERCE_ACCESS_TOKEN;
    const cart_id = "a442a1ac-025d-4e2d-a562-be17998b114d";
    const product_id = "7853";
    const list_price = {newCost}; // New price
    try {
        const response = await fetch(
            "http://localhost:300/v1/update-price",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    access_token,
                    list_price,
                    product_id,
                    cart_id,
                    access_id,
                }),
            });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            setCost(newCost); // Update displayed cost
            setIsEditing(false); // Exit editing mode
        } else {
            throw new Error(`Error: ${response.statusText}`);
        }
    } catch (err) {
        console.error("Error updating the API:", err);
    } finally {
        setIsSaving(false);
    }
};