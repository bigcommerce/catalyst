'use client'

import { useEffect } from "react";

export default function PromotionCookie({ promoObj }: {promoObj:any}) {

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.cookie = "ztcpn_data="+JSON.stringify(promoObj);
    }
  }, [promoObj]);

  return(
    <></>
  )
};