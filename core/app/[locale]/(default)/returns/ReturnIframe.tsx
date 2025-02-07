import React from 'react';

interface ReturnsProps {
  returnUrl: string;
}

const Returns: React.FC<ReturnsProps> = ({ returnUrl }) => {
  if (!returnUrl) {
    return <p>Return URL is not available</p>;
  }

  return (
    <iframe
    id="returnscenter"
    src={returnUrl}
    title="shopper"
    width="100%"
    height="800px"
>
</iframe>
  );
};

export default Returns;
