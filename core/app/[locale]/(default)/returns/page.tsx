import React from 'react';
import Returns from './ReturnIframe';
  // Import the Returns component

const ReturnsPage: React.FC = () => {
  const returnUrl = `${process?.env?.NEXT_PUBLIC_RETURN_URL}` as string;

  return <Returns returnUrl={returnUrl || ''} />;
};

export default ReturnsPage;
