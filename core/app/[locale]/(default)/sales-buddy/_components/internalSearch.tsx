// components/InternalSearch.tsx
"use client";
import { useState } from 'react';
 
export default function InternalSearch() {
    // State to control open/close status of accordions
    const [isOpenOurInventory, setIsOpenOurInventory] = useState<boolean>(true);
    const [isOpenSupplierInventory, setIsOpenSupplierInventory] = useState<boolean>(true);
 
    // Sample filter data
    const ourInventoryFilters = ["24", "1836", "18456", "3242", "3", "42"];
    const supplierInventoryFilters = ["1836", "18456", "3242", "3", "42"];
 
    return (
        <div className=" bg-gray-100 rounded-lg  mx-auto">
            <h2 className="text-lg font-semibold mb-4">Internal Search</h2>
           
            {/* Selected Filters */}
            <div className="bg-white p-3 rounded-lg shadow">
                <h3 className="text-sm font-semibold mb-2">Filters</h3>
                <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                        Filter Here <button className="ml-1">✕</button>
                    </span>
                    <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                        Filter Here <button className="ml-1">✕</button>
                    </span>
                </div>
            </div>
 
            {/* Our Inventory Accordion */}
            <div className="mt-4 bg-white p-3 rounded-lg shadow">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold">Our Inventory</h3>
                    <button onClick={() => setIsOpenOurInventory(!isOpenOurInventory)}>
                        {isOpenOurInventory ? "−" : "+"}
                    </button>
                </div>
                {isOpenOurInventory && (
                    <div className="mt-2">
                        {ourInventoryFilters.map((filter, index) => (
                            <div key={index} className="flex items-center gap-2 mb-1">
                                <input type="checkbox" id={`our-inventory-${index}`} className="form-checkbox" />
                                <label htmlFor={`our-inventory-${index}`} className="text-sm text-gray-700">
                                    Filter Value
                                </label>
                                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{filter}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
 
            {/* Supplier Inventory Accordion */}
            <div className="mt-4 bg-white p-3 rounded-lg shadow">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold">Supplier Inventory</h3>
                    <button onClick={() => setIsOpenSupplierInventory(!isOpenSupplierInventory)}>
                        {isOpenSupplierInventory ? "−" : "+"}
                    </button>
                </div>
                {isOpenSupplierInventory && (
                    <div className="mt-2">
                        {supplierInventoryFilters.map((filter, index) => (
                            <div key={index} className="flex items-center gap-2 mb-1">
                                <input type="checkbox" id={`supplier-inventory-${index}`} className="form-checkbox" />
                                <label htmlFor={`supplier-inventory-${index}`} className="text-sm text-gray-700">
                                    Filter Value
                                </label>
                                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{filter}</span>
                            </div>
                        ))}
                    </div>
                )}
                {/* Show More Link */}
                <div className="mt-2">
                    <a href="#" className="text-sm text-blue-600">(+)&nbsp;Show ## More</a>
                </div>
            </div>
        </div>
    );
}