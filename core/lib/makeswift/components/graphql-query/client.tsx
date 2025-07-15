'use client';

import { useState, useEffect } from 'react';

interface Props {
  className?: string;
  storeHash?: string;
  token?: string;
  query?: string;
  variables?: string;
}



export function MakeswiftGraphQLQuery({ 
  className, 
  storeHash = '', 
  token = '', 
  query = '', 
  variables = '{}' 
}: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeHash || !token || !query) {
      setData(null);
      setError(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Parse variables JSON
        let parsedVariables = {};
        try {
          parsedVariables = JSON.parse(variables);
        } catch (e) {
          throw new Error('Invalid JSON in variables field');
        }

        // Create custom fetch function with actual storeHash
        const customFetch = async (token: string, query: string, variables = {}) => {
          const apiUrl = `https://store-${storeHash}.mybigcommerce.com/graphql`;

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              query: query,
              variables: variables,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
          }

          return response.json();
        };

        const result = await customFetch(token, query, parsedVariables);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeHash, token, query, variables]);

  return (
    <div className={className}>
      <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
          GraphQL Query Result
        </h3>
        
        {!storeHash || !token || !query ? (
          <div style={{ color: '#666', fontStyle: 'italic' }}>
            Please configure Store Hash, Token, and Query to see results.
          </div>
        ) : loading ? (
          <div style={{ color: '#666' }}>Loading...</div>
        ) : error ? (
          <div style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '8px', borderRadius: '4px' }}>
            <strong>Error:</strong> {error}
          </div>
        ) : data ? (
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '12px', 
            borderRadius: '4px', 
            overflow: 'auto',
            fontSize: '12px',
            margin: 0
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <div style={{ color: '#666', fontStyle: 'italic' }}>
            No data received.
          </div>
        )}
      </div>
    </div>
  );
}
