import React, { useState } from 'react';
import { Accordions } from '../Accordin/index'; // Assuming Accordions is in the same directory
import {Checkbox} from '../Input/checkbox'; // Replace with your actual Checkbox component
import {Input} from '../Input/index'; // Replace with your Input component
import {Button} from '../Button/index'; // Replace with your Button component

function PLPPageInterface({ toggleAccordion, openIndexes, setOpenIndexes }) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Filters data
  const filterProductName = ['Fiter value'];
  const filtersData = {
    'Our Inventory': ['24', '1836', '18456', '3242', '3', '42'],
    'Supplier Inventory': ['1836', '18456', '3242', '3', '42'],
  };
  ;

  // Handle filter toggle
  const handleFilterToggle = (filter: string) => {
    setSelectedFilters((prevSelectedFilters) =>
      prevSelectedFilters.includes(filter)
        ? prevSelectedFilters.filter((f) => f !== filter)
        : [...prevSelectedFilters, filter],
    );
  };

  // Remove filter
  const handleFilterRemove = (filter: string) => {
    setSelectedFilters((prevSelectedFilters) => prevSelectedFilters.filter((f) => f !== filter));
  };

  // Prepare accordion data dynamically
  const accordions = Object.entries(filtersData).map(([title, filters]) => ({
    title: (
      <h4 className="flex items-center gap-2 text-base font-normal text-[#353535]">
        <span className="flex items-center">{title}</span>
      </h4>
    ),
    content: (
      <div className="mt-2 space-y-2">
        {filters.map((filter) => (
          <div key={filter} className="flex items-center gap-2">
            <Checkbox
              id={`our-inventory-${filter}`}
              checked={selectedFilters.includes(filter)}
              onCheckedChange={() => handleFilterToggle(filter)}
              // nohover={true}
            />
            <label htmlFor={`our-inventory-${filter}`} className="flex text-sm text-gray-700">
              {filterProductName}
              <span className="flex items-center rounded-full mx-2 bg-gray-200 px-3 py-1 text-sm">
                {filter}
              </span>
            </label>
          </div>
        ))}
      </div>
    ),
  }));

  return (
    <div className="mt-5 w-[460px] bg-[#f3f4f5]">
      <h2 className="mb-4 text-[24px] font-normal text-[#353535]">Internal Search</h2>

      <div className="bg-white p-[20px]">
        <h3 className="mb-2 text-sm font-semibold">Filters</h3>
        <div className="flex flex-wrap gap-2">
          {selectedFilters.length === 0 ? (
            <span className="text-sm text-gray-500">No filters selected</span>
          ) : (
            selectedFilters.map((filter) => (
              <span
                key={filter}
                className="flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs"
              >
                {filter}
                <button
                  onClick={() => handleFilterRemove(filter)}
                  className="ml-1 text-gray-600 hover:text-gray-800"
                >
                  ✕
                </button>
              </span>
            ))
          )}
        </div>
      </div>
      <Accordions
        styles="border-x-0 border-y-[1px] -my-[1px] border-[#CCCBCB] py-[10px] px-[20px] text-[16px] bg-white"
        accordions={accordions}
        toggleAccordion={toggleAccordion}
        openIndexes={openIndexes}
        setOpenIndexes={setOpenIndexes}
      />
      <div className="w-[460px] space-y-[10px]">
        <div className="bg-white"></div>
      </div>

      {/* <Button className="mt-4 w-full bg-green-600 text-white hover:bg-green-700">Search</Button> */}
    </div>
  );
}

export default PLPPageInterface;
