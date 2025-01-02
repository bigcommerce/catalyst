'use client';

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ProductFlyout } from "~/components/product-card/product-flyout";
import { useCommonContext } from "~/components/common-context/common-provider";

interface Props {
  closeIcon: any;
  blankAddImg: any;
  fanPopup: any;
  product: any;
}
export const AccessoriesButton = ({ product, closeIcon, blankAddImg, fanPopup }: Props) => {
  const [showFlyout, setShowFlyout] = useState(false);
  const productFlyout = useCommonContext();

  const loadAccessories = async() => {
    setShowFlyout(true);
    productFlyout.handlePopup(true);
  }

  let lineItemId = product?.entityId;

  return (
    <div>
      <Button onClick={()=>loadAccessories()} className="font-500 mx-5 mb-5 flex w-[-webkit-fill-available] items-center justify-center rounded-[3px] border border-[#B4DDE9] bg-white p-[5px_10px] text-[16px] uppercase leading-[32px] tracking-[1.25px] text-[#002A37] xl:w-fit">+ ADD ACCESSORIES</Button>
      <ProductFlyout
        closeIcon={closeIcon}
        blankAddImg={blankAddImg}
        fanPopup={fanPopup}
        from="cart"
        showFlyout={showFlyout}
        showFlyoutFn={setShowFlyout}
        data={product} />
    </div>
  );
}