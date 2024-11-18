'use client';
import { useState } from 'react';
import { Accordions } from '~/components/ui/accordions';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/form';
// import { fetchCartData } from '../_actions/get-cart-data';

export default function AgentTools() {
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);
  const [quoteNumber, setQuoteNumber] = useState('');

  const toggleAccordion = (index: number) => {
    setOpenAccordions((prevOpenAccordions) =>
      prevOpenAccordions.includes(index)
        ? prevOpenAccordions.filter((i) => i !== index)
        : [...prevOpenAccordions, index],
    );
  };

  const accordions = [
    {
      title: 'Cost and Pricing - United States',
      content: (
        <div>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border-b p-1">SKU</th>
                <th className="border-b p-1">Cost</th>
                <th className="border-b p-1">IMAP</th>
                <th className="border-b p-1">Floor (%)</th>
                <th className="border-b p-1">Floor ($)</th>
              </tr>
            </thead>
            <tbody>
              {/* Add rows dynamically */}
              {[...Array(2)].map((_, i) => (
                <tr key={i}>
                  <td className="border-b p-1">ABCDE-123-FG</td>
                  <td className="border-b p-1">$0000.00</td>
                  <td className="border-b p-1">$0000.00</td>
                  <td className="border-b p-1">00%</td>
                  <td className="border-b p-1">$0000.00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      title: 'Inventory',
      content: (
        <div>
          {/* Inventory items */}
          <div className="border-b p-2">
            <p>ABCDE-123-FG - In Stock | Distribution Center Inventory</p>
            <span className="text-sm text-gray-500">Updated 5 Days Ago</span>
          </div>
          <div className="border-b p-2">
            <p>ABCDE-123-FG - Back Ordered | Expected MM/DD/YYYY</p>
            <span className="text-sm text-gray-500">Updated Today</span>
          </div>
          <div className="p-2">
            <p>ABCDE-123-FG - In Stock | Belami Warehouse Inventory</p>
            <span className="text-sm text-gray-500">Updated 2 Days Ago</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full rounded-lg bg-white shadow-lg">
      <div className="border-none p-1">
        <h2 className="text-l font-semibold">Product ID: #12345678</h2>
        <p className="text-sm text-gray-500">by Manufacturer Name</p>

        {/* Quote Section */}
        <div className="mt-4 rounded-md border p-3">
          <label htmlFor="quoteNumber" className="block text-sm font-medium text-gray-700">
            Add to Existing Quote
          </label>
          <Input
            id="quoteNumber"
            placeholder="Quote #"
            value={quoteNumber}
            onChange={(e) => setQuoteNumber(e.target.value)}
            className="mt-2"
          />
          <Button className="mt-2 w-full bg-green-600 text-white hover:bg-green-700">
            Add to Quote
          </Button>
        </div>

        {/* Accordions */}
        <Accordions accordions={accordions} type="multiple" />

        {/* Quick Links */}
        <div className="mt-4">
          <h3 className="text-l font-semibold">Quick Links</h3>
          <div className="mt-2 flex flex-col space-y-2">
            <Button variant="primary" className="justify-between bg-[#353535]">
              Product Details <span>Edit</span>
            </Button>
            <Button variant="primary" className="justify-between bg-[#353535]">
              Supplier Details <span>Edit</span>
            </Button>
            <Button variant="primary" className="justify-between bg-[#353535]">
              Go to Supplier TNC <span>View</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
