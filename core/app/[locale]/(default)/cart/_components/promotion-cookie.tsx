'use client'

import { useEffect } from "react";

export default function PromotionCookie({ promoObj, isFloor }: {promoObj:any, isFloor: number}) {

  useEffect(() => {
    if (typeof window !== "undefined") {
      if(isFloor) {
        document.cookie = "pr_flr_data="+JSON.stringify(promoObj);
      } else {
        document.cookie = "ztcpn_data="+JSON.stringify(promoObj);
      }
    }
  }, [promoObj]);

  return(
    <></>
  )
};