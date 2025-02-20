import React from 'react';
import Script from 'next/script';

type Props = {
    code?: any;
}

const StructuredData = ({ data }) => {
    return (
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} 
        strategy='beforeInteractive'
      />
    );
  };

export function MetaDataGenerator({code}: Props){
    return (
        <>
            {code && <StructuredData data={code} />} 
       </>
    )
}
