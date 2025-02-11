import React, { useState, useEffect } from 'react';

interface DynamicListProps {
  data: Array<{ first_name: string; last_name: string; email: string }>;
  setFindCustomerData: (data: any) => void;
}

export default function DynamicList({ data, setFindCustomerData }: DynamicListProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  console.log(data);

  useEffect(() => {
    if (data.length === 1) {
      const customer = data[0];
      setSelectedCustomer(customer.email);
      setFindCustomerData({
        email: customer.email,
        phone: customer?.phone || "",
        first_name: customer.first_name + " " + customer.last_name,
        company: customer?.company || "",
      });
    }
  }, [data, setFindCustomerData]);

  if (!data || !data.length) {
    return <p>No data available to display.</p>;
  }

  const handleSelectCustomer = (customer: { first_name: string; last_name: string; email: string }) => {
    setSelectedCustomer(customer.email);
    setFindCustomerData({
      email: customer.email,
      phone: customer?.phone || "",
      first_name: customer.first_name + " " + customer.last_name,
      company: customer?.company || "",
    
    });
  };

  return (
    <div style={{ padding: '10px', margin: 'auto' }}>
      {data.map((item, index) => (
        <div
          key={index}
          style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '10px',
            backgroundColor: selectedCustomer === item.email ? '#d1e7fd' : '#f9f9f9', // Change color when selected
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onClick={() => handleSelectCustomer(item)}
        >
          <div style={{ marginBottom: '8px' }}>
            <strong>Name :</strong>{' '}
            <span style={{ textDecoration: 'none', color: 'inherit' }}>
              {item.first_name + " " + item.last_name || 'N/A'}
            </span>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <div className='flex justify-between'>
              <span style={{ textDecoration: 'none', color: 'inherit' }}>
                <strong>Email ID : </strong>{item.email || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
