'use client';

import { useEffect, useState } from 'react';

interface Props {
  products: any[];
}

interface MetaField {
  key: string;
  value: string;
  namespace: string;
}

const attributes = [
  {
    name: 'Width',
    label: 'Width'
  }, 
  {
    name: 'Diameter',
    label: 'Diameter'
  }, 
  {
    name: 'Height',
    label: 'Height'
  }, 
  {
    name: 'Depth',
    label: 'Depth'
  }, 
  {
    name: 'Weight',
    label: 'Weight'
  }, 
]

function AmountUnitValue({ data }: any) {
  const value =
    typeof data === 'string' && (data.includes('{') || data.includes('[')) ? JSON.parse(data) : data;
  if (typeof value === 'object') {
    const amount: number | null = value && value.amount ? Number(value.amount) : null;
    const unit: string | null = value && value.unit ? value.unit.toLowerCase() : null;
    return <>{amount ? amount + (unit ? ' ' + unit : '') : null}</>;
  } else {
    return data;
  }
}

export function CompareProductDetails({ products }: Props) {

  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  const uniqueValues = (arr: any[]): any[] => {
    return arr.reduce((acc, value) => {
      if (!acc.includes(value)) {
        acc.push(value);
      }
      return acc;
    }, []);
  };

  return (<tbody>
    <tr>
      <td key={0} className="bg-brand-600 text-white" onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}>[] Show Only Differences {showOnlyDifferences ? 1 : 0}</td>
      {products.map((product) => (
      <td key={product.entityId}>&nbsp;</td>
      ))}
    </tr>

    {attributes.filter(attribute => {
      const allIncludes = products.every(product => product.metafields?.some((metafield: MetaField) => metafield.key === attribute.name));
      const someIncludes = products.some(product => product.metafields?.some((metafield: MetaField) => metafield.key === attribute.name));
      const attributeValues = products.filter(product => product.metafields?.some((metafield: MetaField) => metafield.key === attribute.name)).map(product => product.metafields.find((metafield: MetaField) => metafield.key === attribute.name)?.value);

      return someIncludes && (
        !showOnlyDifferences || 
        (
          showOnlyDifferences && 
          (
            !allIncludes || 
            (allIncludes && uniqueValues(attributeValues)?.length > 1)
          )
        )
      );
    })?.map((attribute) => (
      <tr key={attribute.name}>
        <td>{attribute.label}</td>
        {products.map((product) => {
          const metafield = product.metafields.find((metafield: MetaField) => metafield.key === attribute.name);
          return <td key={product.entityId}>{metafield ? <AmountUnitValue data = {metafield.value} /> : 'N/A'}</td>;
        })}
      </tr>
    ))}
    </tbody>);
}
