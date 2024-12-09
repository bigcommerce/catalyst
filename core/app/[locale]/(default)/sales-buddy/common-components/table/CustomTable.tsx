import React from 'react';

export default function DynamicTable({ data }) {
  if (!data || !data.length) {
    return <p>No data available to display.</p>;
  }

  // Calculate the width for each column based on the number of columns
  const columnCount = Object.keys(data[0]).length;
  const columnWidth = `${100 / columnCount}%`; // Each column will take an equal percentage of the table width

  return (
    <div style={{ padding: '1px', margin: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'center',
          border: '1px solid #ccc',
          tableLayout: 'fixed', // Ensures fixed layout for equal column widths
        }}
      >
        <thead>
          <tr>
            {Object.keys(data[0]).map((key) => (
              <th
                key={key}
                style={{
                  padding: '10px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f4f4f4',
                  width: columnWidth, // Set the width for each column
                }}
              >
                {key.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.entries(row).map(([key, value], cellIndex) => (
                <td
                  key={cellIndex}
                  style={{
                    padding: '10px',
                    border: '1px solid #ccc',
                    width: columnWidth, // Set the width for each cell
                    wordWrap: 'break-word', // Allow text to wrap
                    overflowWrap: 'break-word', // Ensure long words break
                    whiteSpace: 'normal', // Allow normal wrapping
                  }}
                >
                  {typeof value === 'object' && value !== null
                    ? JSON.stringify(value) // Converts objects to string
                    : value?.toString() || 'N/A'}{' '}
                  {/* Handles null or empty values */}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
