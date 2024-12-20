'use client';

import { PrinterIcon } from "lucide-react";

export const PrintInvoice = () => {
return(
  <>
    <PrinterIcon className='stroke-[#008bb7]' />
    <span className="text-[#008BB7]" onClick={() => window.print()}>Print Invoice</span>
  </>
);
};