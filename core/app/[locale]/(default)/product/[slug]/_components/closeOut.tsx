'use client';
import { getMetaFieldValue } from "~/components/management-apis";
import React, { useState, useEffect } from "react";
import { Spinner } from "@/vibes/soul/primitives/spinner";

interface DeliveryMessageProps {
  entityId: number;
  variantId: number;
  isFromPDP: boolean;
  isFromCart: boolean;
}

export const CloseOut: React.FC<DeliveryMessageProps> = ({
  entityId,
  variantId,
  isFromPDP,
  isFromCart,
}) => {
  const [closeOut, setCloseOut] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCloseOut = async () => {
      try {
        setLoading(true);
        const closeOutValue = await getMetaFieldValue (entityId, variantId, "Details");
        console.log("closeOutValue", closeOutValue)
        setCloseOut(closeOutValue);
      } catch (err) {
        ('');
      } finally {
        setLoading(false);
      }
    };

    if (entityId && variantId) {
      fetchCloseOut();
    }
  }, [entityId, variantId]);

  if (loading) {
    return (
      <div className="flex justify-center xl:justify-start px-[50px] py-[10px]">
        <Spinner aria-hidden="true" />
      </div>
    )
  }

  return (
    <>
      <div className={`${isFromPDP ? 'flex' : 'hidden'} sm:justify-start`}>
        {closeOut && closeOut[0] === "True" ? (
          <div className="bg-[#B4B4B5] content-center px-[10px] max-w-fit text-[#ffffff] tracking-[1.25px] leading-[32px] text-[14px]">CLEARANCE</div>
        ) : null}
      </div>
      <div className={`${isFromCart ? 'flex' : 'hidden'} sm:justify-start`}>
        {closeOut && closeOut[0] === "True" ? (
          <div className="bg-[#FBF4E9] flex justify-center content-center px-[10px] mt-[5px] w-full text-[#6A4C1E] tracking-[0.25px] leading-[24px] text-[14px] sm:max-w-fit">Final Sale</div>
        ) : null}
      </div>
    </>
  );
};