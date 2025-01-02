
import React from 'react';
import Link from 'next/link';

export default function DynamicList({ data }) {
  if (!data || !data.length) {
    return <p>No data available to display.</p>;
  }

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
            backgroundColor: '#f9f9f9',
          }}
        >
          <div style={{ marginBottom: '8px' }}>
            <strong>Name:</strong>{' '}
            {/* <Link href={`/cart`}> */}
              <span style={{ textDecoration: 'none', color: 'inherit' }}>
                {item.first_name +" " +item.last_name  || 'N/A'}
              </span>
            {/* </Link> */}
          </div>
          <div style={{ marginBottom: '8px' }}>
            
            {/* <Link href={`/cart`}> */}
             <div className='flex justify-between'>
               <span style={{ textDecoration: 'none', color: 'inherit' }}>
                <strong>Email ID:</strong>{item.email || 'N/A'}
              </span>
              <Link href={`/`}>
              <span className=''>Login</span>
              </Link>
              </div>
            {/* </Link> */}
          </div>
        </div>
      ))}
    </div>
  );
}

// Example usage with dummy data
const dummyData = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
  },
];