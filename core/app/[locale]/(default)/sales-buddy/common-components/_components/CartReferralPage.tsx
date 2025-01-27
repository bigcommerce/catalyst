import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
import SaveIcon from '~/app/[locale]/(default)/sales-buddy/assets/save.png';
import addIcon from '~/app/[locale]/(default)/sales-buddy/assets/add.png';
import deleteIcon from '~/app/[locale]/(default)/sales-buddy/assets/delete.png';
import { deleteCart } from "../../_actions/delete-cart";
import { useRouter } from "next/navigation";
import { Spinner } from "@/vibes/soul/primitives/spinner";
import { getCartIdCookie } from '../../_actions/cart';
import { useCompareDrawerContext } from "~/components/ui/compare-drawer";

interface Props{
  cartId:string;
}
export default function ReferalId() {
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remove, setRemove] = useState(false);
  const [referralId, setReferralId] = useState(localStorage.getItem('referrerId')); // Example referral ID
  const [isDisabled, setIsDisabled] = useState(false);
  const [session_id,setSession_id] = useState(localStorage.getItem('session_id'))
  const router = useRouter();
  const { cart_interface_session_id, setCart_interface_session_id, cart_interface_refferal_id, setCart_interface_Refferal_id } = useCompareDrawerContext();

  const handleSave = () => {
    setSaved(true);
    setShowReferralInput(false); // Hide input after saving
  };

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteCart(); // Pass the cartId dynamically
    console.log("Response:", res);

    if (res.status === 200) {
      setRemove(true);
      setLoading(false);
    } else {
      setRemove(false);
      setLoading(false);
      console.log("Error:", res.error);
    }
  };

  useEffect(() => {
    let reffralId = localStorage.getItem('referrerId')
    setCart_interface_session_id('')
    setCart_interface_Refferal_id('')
    setReferralId(reffralId)
    if (remove) {
      router.refresh(); // Refresh the page to update data
      setRemove(false);
    }
    setLoading(false);
    async function fetchMyCookie() {
      let cookieValue = await getCartIdCookie();
      if(cookieValue){
        setIsDisabled(false);
      }else{
        setIsDisabled(true);
      }
  }

  fetchMyCookie();
  }, [remove]);

  return (
    <div className="grid content-evenly gap-[10px] h-[81px] w-[460px] space-y-1 rounded-lg">
      <div className="flex flex-row items-center h-[32px] justify-between border-none">
        {/* Heading at the start */}
        <h2 className="text-2xl font-normal">Cart ID: {cart_interface_session_id}</h2>

        {/* Span at the end */}
        <span className="my-2 flex h-[32px] w-[110px] items-center justify-center bg-[#F2DEBE] text-base font-normal">
          Mark: #.#
        </span>
      </div>
      <div className="flex h-[36px] items-end justify-between">
         <div className="font-open-sans flex items-center gap-2 text-[16px] text-[#353535]">
          <span>{`Referrer ID: ${cart_interface_refferal_id}`}</span>
              </div>
        <div className="w-[110px] bg-[#1DB14B] py-[5px] px-[10px] h-[44px] rounded-[3px] items-center content-center ">
          <button
            className=""
            onClick={handleDelete}
            disabled={isDisabled}
          >
             {loading && (
                <div className="absolute flex items-center justify-center">
                  <Spinner />
                </div>
              )}
              <span className="text-white text-[14px] font-medium h-[32px] "> RESET CART</span>
          </button>
        </div>
      </div>
    </div>
  );
}
