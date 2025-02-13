import React, { useState, useEffect } from 'react';
import { Accordions } from '../Accordin/index';
import { Input } from '../Input/index';

interface PLPPageInterfaceProps {
  toggleAccordion: (index: number) => void;
  openIndexes: number[];
  setOpenIndexes: (indexes: number[]) => void;
}

function PLPPageInterface({ toggleAccordion, openIndexes, setOpenIndexes }: PLPPageInterfaceProps) {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Filters data
  const filterProductName = [
    'Not available',
    'No Stock',
    'Low Stock 1 - 10',
    'Medium Stock 10 - 30',
    'High Stock 30 +',
  ];

  // Handle radio button change
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  // Update the URL when filter changes
  useEffect(() => {
    if (selectedFilter) {
      const value = {
        "Not available": "Not%20available",
        "No Stock": "No%20Stock",
        "Low Stock 1 - 10": "Low%20Stock%201-10",
        "Medium Stock 10 - 30": "Medium%20Stock%2010-30",
        "High Stock 30 +": "High%20Stock%2030+",
      };
      const encodedFilter = encodeURIComponent(selectedFilter).replace(/\+/g,'%20'); // Encode spaces correctly
      // const newUrl = `https://www.graciousgarage.com/search?inventory_range[0]=${encodedFilter}`;
      // window.history.replaceState(null, '', newUrl);

      // const encodedFilter = encodeURIComponent(selectedFilter).replace(/\+/g, '%20');; // Encode spaces correctly
      // const decodedFilter = decodeURIComponent(selectedFilter); // Decode first to prevent double encoding
      // const encodedFilter = encodeURIComponent(decodedFilter).replace(/\+/g, '%20');
      // console.log(encodedFilter);
      
      // const url = new URL(`${window.location.href}${'search'}`);
      // url.searchParams.set('inventory_range[0]', encodedFilter);
      // window.history.replaceState({}, '', url.toString());
    }
  }, [selectedFilter]);

  return (
    <div className="mt-5 w-[460px] bg-[#f3f4f5]">
      <h2 className="mb-4 text-[24px] font-normal text-[#353535]">Internal Search</h2>

      <div className="bg-white p-[20px]">
        <h3 className="mb-2 text-sm font-semibold">Filters</h3>
        <div className="flex flex-wrap gap-2">
          {selectedFilter ? (
            <span className="flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs">
              {selectedFilter}
              <button onClick={() => setSelectedFilter(null)} className="ml-1 text-gray-600 hover:text-gray-800">
                ✕
              </button>
            </span>
          ) : (
            <span className="text-sm text-gray-500">No filters selected</span>
          )}
        </div>
      </div>

      <Accordions
        styles="border-x-0 border-y-[1px] -my-[1px] border-[#CCCBCB] py-[10px] px-[20px] text-[16px] bg-white"
        accordions={[
          {
            title: (
              <h4 className="flex items-center gap-2 text-base font-normal text-[#353535]">
                <span className="flex items-center">Our Inventory</span>
              </h4>
            ),
            content: (
              <div className="mt-2 space-y-2">
                {filterProductName.map((filter) => (
                  <div key={filter} className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={`inventory-${filter}`}
                      name="inventory-filter"
                      value={filter}
                      checked={selectedFilter === filter}
                      onChange={() => handleFilterChange(filter)}
                    />
                    <label htmlFor={`inventory-${filter}`} className="flex text-sm text-gray-700">
                      <span className="flex items-center rounded-full mx-2 bg-gray-200 px-3 py-1 text-sm">
                        {filter}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            ),
          },
        ]}
        toggleAccordion={toggleAccordion}
        openIndexes={openIndexes}
        setOpenIndexes={setOpenIndexes}
      />
    </div>
  );
}

export default PLPPageInterface;
