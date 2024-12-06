// import Image from "next/image";
// import React, { useState, useEffect } from "react";
// import { Button } from "../Button";
// import { Input } from "../Input";
// import SaveIcon from '~/app/[locale]/(default)/sales-buddy/assets/save.png';
// import addIcon from '~/app/[locale]/(default)/sales-buddy/assets/add.png';
// import deleteIcon from '~/app/[locale]/(default)/sales-buddy/assets/delete.png';
// import { deleteCart } from "../../_actions/delete-cart";
// import { useRouter } from 'next/navigation';

// export default function ReferalId() {
//   const [showReferralInput, setShowReferralInput] = useState(false);
//   const [saved, setSaved] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [remove, setRemove] = useState(false);
//   const referralId = '12345678'; // Example referral ID

//   const handleSave = () => {
//     setSaved(true);
//     setShowReferralInput(false); // Hide input after saving
//   };

//   // const handleDelete = () => {
//   //   setSaved(false); // Show input again when deleting
//   // };

//   const handleDelete = async () => {
//     console.log("clicked")
//     setLoading(true);
//     let res = await deleteCart(cart_id);
//     console.log('res');
//     console.log(res)
//     if (res.status == 200) {
//       setRemove(true);
//     } else {
//       console.log('show error message' + res.error);
//     }
//   };
//   const router = useRouter();
//   useEffect(()=>{
//     if(remove){
//       router.refresh();
//       setRemove(false);
//       setLoading(false);
//     }
//   },[remove]);

//   return (
//     <div className="grid content-evenly gap-[10px] h-[81px] w-[460px] space-y-1 rounded-lg">
//       <div className="flex flex-row items-center h-[32px] justify-between border-none">
//         {/* Heading at the start */}
//         <h2 className="text-2xl font-normal">Cart ID: #123456789</h2>

//         {/* Span at the end */}
//         <span className="my-2 flex h-[32px] w-[110px] items-center justify-center bg-[#F2DEBE] text-base font-normal">
//           Mark: #.#
//         </span>
//       </div>
//       <div className="flex h-[36px] items-end justify-between">
//         {!showReferralInput ? (
//           <>
//             {!saved && (
//               <div
//                 className="flex cursor-pointer items-center gap-2 text-[16px] text-green-600"
//                 onClick={() => setShowReferralInput(true)}
//               >
//                 Add Referral ID
//                 <span>
//                   <Image src={addIcon} alt="addIcon" />
//                 </span>
//               </div>
//             )}
//             {saved && (
//               <div className="font-open-sans flex items-center gap-2 text-[16px] text-[#353535]">
//                 <span>{`Referral ID: ${referralId}`}</span>
//                 <div onClick={handleDelete}>
//                   <Image src={deleteIcon} alt="deleteIcon" />
//                 </div>
//               </div>
//             )}
//             {/* <Button className="bg-green-600 px-2 text-xs text-white">RESET CART</Button> */}
//           </>
//         ) : (
//           <>
//             <div className="flex w-[330px] items-center gap-1">
//               {/* Input Section (70%) */}
//               <div className="flex items-center">
//                 <Input
//                   id="cart-id"
//                   className="font-open-sans flex h-[44px] w-full font-normal focus:outline-none"
//                 />
//               </div>

//               {/* Gap (10%) */}

//               {/* Button Section (20%) */}
//               <div className="flex">
//                 <Button
//                   className="m-0 flex items-center justify-start gap-1 bg-transparent px-[5px]"
//                   onClick={handleSave}
//                 >
//                   <Image src={SaveIcon} alt="saveIcon" />
//                   <span className="cursor-pointer text-[16px] text-green-600">save</span>
//                 </Button>
//               </div>
//             </div>

//             {/* <Button className="bg-green-600 px-2 text-xs text-white">RESET CART</Button> */}
//           </>
//         )}
//         <div className="w-[110px]">
//           <Button className="bg-[#1DB14B] p-0 px-[5px] text-xs text-white 
//           onClick={handleDelete}">
//             RESET CART
            
//           </Button>
//           {loading && <p>Loading...</p>}
//         </div>
//       </div>
//     </div>
//   );
// }


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

export default function ReferalId() {
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remove, setRemove] = useState(false);
  const [cartId] = useState("123456789"); // Replace with actual cart ID
  const [referralId] = useState("12345678"); // Example referral ID

  const router = useRouter();

  const handleSave = () => {
    setSaved(true);
    setShowReferralInput(false); // Hide input after saving
  };

  const handleDelete = async () => {
    console.log("Deleting cart...");
    setLoading(true);
    const res = await deleteCart(cartId); // Pass the cartId dynamically
    console.log("Response:", res);

    if (res.status === 200) {
      setRemove(true);
    } else {
      console.log("Error:", res.error);
    }
  };

  useEffect(() => {
    if (remove) {
      router.refresh(); // Refresh the page to update data
      setRemove(false);
    }
    setLoading(false);
  }, [remove]);

  return (
    <div className="grid content-evenly gap-[10px] h-[81px] w-[460px] space-y-1 rounded-lg">
      <div className="flex flex-row items-center h-[32px] justify-between border-none">
        {/* Heading at the start */}
        <h2 className="text-2xl font-normal">Cart ID: #{cartId}</h2>

        {/* Span at the end */}
        <span className="my-2 flex h-[32px] w-[110px] items-center justify-center bg-[#F2DEBE] text-base font-normal">
          Mark: #.#
        </span>
      </div>
      <div className="flex h-[36px] items-end justify-between">
        {!showReferralInput ? (
          <>
            {!saved && (
              <div
                className="flex cursor-pointer items-center gap-2 text-[16px] text-green-600"
                onClick={() => setShowReferralInput(true)}
              >
                Add Referral ID
                <span>
                  <Image src={addIcon} alt="addIcon" />
                </span>
              </div>
            )}
            {saved && (
              <div className="font-open-sans flex items-center gap-2 text-[16px] text-[#353535]">
                <span>{`Referral ID: ${referralId}`}</span>
                <div onClick={handleDelete}>
                  <Image src={deleteIcon} alt="deleteIcon" />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex w-[330px] items-center gap-1">
              {/* Input Section */}
              <Input
                id="cart-id"
                className="font-open-sans flex h-[44px] w-full font-normal focus:outline-none"
              />
              {/* Save Button */}
              <Button
                className="m-0 flex items-center justify-start gap-1 bg-transparent px-[5px]"
                onClick={handleSave}
              >
                <Image src={SaveIcon} alt="saveIcon" />
                <span className="cursor-pointer text-[16px] text-green-600">Save</span>
              </Button>
            </div>
          </>
        )}
        <div className="w-[110px] bg-[#1DB14B] py-[5px] px-[10px] h-[44px] rounded-[3px] items-center content-center ">
          <button
            className=""
            onClick={handleDelete}
          >
             {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
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
