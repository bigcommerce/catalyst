export default function HelpCenter() {
  return (
    <div className="flex justify-center">
      <div className="flex w-[70%] flex-col gap-[40px]">
        <div className="flex flex-col gap-[20px]">
          <div>Breadcrumbs</div>
          <div className="text-[24px] font-normal leading-[32px] text-black">
            <span>Welcome Back,</span> <span className="text-[#008BB7]">username/email!</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-[20px]">
          <div className="p-[10px] grid grid-cols-[70px_auto] gap-[20px] flex-row items-center bg-[#f3f4f5] rounded-[3px]">
            <div>
              <img src="" width={70} height={70} className="h-[70px] w-[70px]" alt="" />
            </div>
            <div>
              <div className="font-[500] text-[20px] leading-[32px] tracking-[0.5px] text-black">Orders</div>
              <div className="font-normal text-[16px] leading-[32px] tracking-[0.15px] text-black">Track, return, cancel, or replace items.</div>
            </div>
          </div>
          <div className="p-[10px] grid grid-cols-[70px_auto] gap-[20px] flex-row items-center bg-[#f3f4f5] rounded-[3px]">
            <div>
              <img src="" width={70} height={70} className="h-[70px] w-[70px]" alt="" />
            </div>
            <div>
              <div className="font-[500] text-[20px] leading-[32px] tracking-[0.5px] text-black">Addresses</div>
              <div className="font-normal text-[16px] leading-[32px] tracking-[0.15px] text-black">Add and edit addresses, set your default address.</div>
            </div>
          </div>
          <div className="p-[10px] grid grid-cols-[70px_auto] gap-[20px] flex-row items-center bg-[#f3f4f5] rounded-[3px]">
            <div>
              <img src="" width={70} height={70} className="h-[70px] w-[70px]" alt="" />
            </div>
            <div>
              <div className="font-[500] text-[20px] leading-[32px] tracking-[0.5px] text-black">Payments</div>
              <div className="font-normal text-[16px] leading-[32px] tracking-[0.15px] text-black">Add and edit credit cards, set your default payment.</div>
            </div>
          </div>
          <div className="p-[10px] grid grid-cols-[70px_auto] gap-[20px] flex-row items-center bg-[#f3f4f5] rounded-[3px]">
            <div>
              <img src="" width={70} height={70} className="h-[70px] w-[70px]" alt="" />
            </div>
            <div>
              <div className="font-[500] text-[20px] leading-[32px] tracking-[0.5px] text-black">Request a Quote</div>
              <div className="font-normal text-[16px] leading-[32px] tracking-[0.15px] text-black">Get our best offer on what you need.</div>
            </div>
          </div>
          <div className="p-[10px] grid grid-cols-[70px_auto] gap-[20px] flex-row items-center bg-[#f3f4f5] rounded-[3px]">
            <div>
              <img src="" width={70} height={70} className="h-[70px] w-[70px]" alt="" />
            </div>
            <div>
              <div className="font-[500] text-[20px] leading-[32px] tracking-[0.5px] text-black">Account Details</div>
              <div className="font-normal text-[16px] leading-[32px] tracking-[0.15px] text-black">Username, password, and contact information.</div>
            </div>
          </div>
          <div className="p-[10px] grid grid-cols-[70px_auto] gap-[20px] flex-row items-center bg-[#f3f4f5] rounded-[3px]">
            <div>
              <img src="" width={70} height={70} className="h-[70px] w-[70px]" alt="" />
            </div>
            <div>
              <div className="font-[500] text-[20px] leading-[32px] tracking-[0.5px] text-black">Favorites and Lists</div>
              <div className="font-normal text-[16px] leading-[32px] tracking-[0.15px] text-black">Your saved products and collections of products.</div>
            </div>
          </div>
          <div className="p-[10px] grid grid-cols-[70px_auto] gap-[20px] flex-row items-center bg-[#f3f4f5] rounded-[3px]">
            <div>
              <img src="" width={70} height={70} className="h-[70px] w-[70px]" alt="" />
            </div>
            <div>
              <div className="font-[500] text-[20px] leading-[32px] tracking-[0.5px] text-black">Email Preferences</div>
              <div className="font-normal text-[16px] leading-[32px] tracking-[0.15px] text-black">Update how frequently we contact you and about what.</div>
            </div>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="flex flex-col gap-[10px] flex-[0.27]">
            <div className="flex flex-col gap-[10px]">
              <div className="text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-black">
                Sales Hours
              </div>
              <div className="text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
                <div>PHONE HOURS</div>
                <div>Monday-Friday 6am - 5pm PST</div>
                <div>(###) ###-####</div>
              </div>
            </div>
            <div className="flex flex-col text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
              <div>CHAT HOURS</div>
              <div>
                <div>Monday - Friday 6am - 4pm PST</div>
                <div>Saturday & Sunday 6am - 3pm PST</div>
              </div>
            </div>
            <div className="text-normal w-fit bg-[#fbf4e9] p-[0px_10px] text-[14px] leading-[24px] tracking-[0.25px] text-[#2a2010]">
              <div>
                Current estimated phone wait time: 15 minutes - thank you for your patience.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
