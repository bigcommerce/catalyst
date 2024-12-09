export default function Replacement() {
  return (
    <div className="my-[2rem] flex w-full justify-center text-[#353535]">
      <div className="flex w-[70%] flex-col gap-[30px]">
        <div>
          <p>Bread crumbs</p>
        </div>
        <div className="flex flex-col gap-[30px]">
          <div className="flex flex-col gap-[30px]">
            <div className="text-[24px] font-[400] leading-[32px]">Item for Replacement</div>
            <div className="bg-[#F3F4F5] p-[20px]">
              <div className="flex items-center gap-[40px]">
                <div className="bg-[#CCCBCB]">
                  <img src="" alt="image" className="h-[150px] w-[150px]" />
                </div>
                <div className="flex-1">
                  <p className="text-[16px] font-[400] leading-[32px] tracking-[0.15px]">
                    Crystorama Lighting - 8828-GA-CL-MWP - Bridgehampton - 8 Light Chandelier ...
                  </p>
                  <p className="text-[14px] font-[700] leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                    <span>SKU: ABC-1234DE</span>
                    <span>
                      {' '}
                      | Finish: <span className="font-[400]">Oil Rubbed Bronze</span>
                    </span>
                  </p>
                </div>
                <div className="flex-[0.5] text-[14px] font-[400] leading-[24px] tracking-[0.25px]">
                  <p className="text-[#1DB14B]">
                    <span>10% Coupon: $405.85</span>
                    <span className="ml-[7px]"> ($81.17 Each)</span>
                  </p>
                  <p className="">
                    <span>$450.90 </span>
                    <span className="ml-[7px]">($90.18 Each) </span>
                  </p>
                  <p className="">
                    <span className="line-through">$501.00 ($100.20 Each)</span>
                    <span className="ml-[7px]">10% Off</span>
                  </p>
                </div>
                <div>
                  <p className="text-[16px] font-[400] leading-[32px] tracking-[0.15px]">
                    Qty to Return
                  </p>
                  <select
                    className="flex w-full flex-col items-start justify-center rounded-[3px] border border-[#CCCBCB] bg-[#FFFFFF] p-[6px_10px]"
                    name=""
                    id=""
                  >
                    <option value="">1</option>
                    <option value="">2</option>
                    <option value="">3</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-[30px]">
            <div className="flex flex-1 flex-col gap-[20px]">
              <div>
                <div className="text-[20px] font-[500] leading-[32px] tracking-[0.15px]">
                  Reason for Replacement
                </div>
              </div>
              <div>
                <select
                  name=""
                  className="flex h-[44px] w-full flex-col items-start justify-center gap-[10px] rounded-[3px] border border-[#CCCBCB] bg-white p-[6px] px-[10px]"
                  id=""
                >
                  <option value="">1</option>
                  <option value="">2</option>
                  <option value="">3</option>
                </select>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-[20px]">
              <div>
                <div className="text-[20px] font-[500] leading-[32px] tracking-[0.15px]">
                  Comments
                </div>
              </div>
              <div>
                <input
                  type="text"
                  className="h-[44px] w-full rounded-[3px] border border-[#CCCBCB] bg-white px-[10px] py-[6px]"
                  placeholder="Add your comments here..."
                />
              </div>
            </div>
          </div>
          <div>
            <div className="text-[20px] font-[500] leading-[32px] tracking-[0.15px]">
              Show us What's Wrong (Optional)
            </div>
            <div className="flex items-center gap-[10px]">
              <img src="" alt="upload image" className="w-[20px] h-[18px]" />
              <p className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#006380]">
                Take or Upload an Image
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <button className="flex items-center justify-center rounded-[3px] bg-[#008BB7] p-[5px] px-[10px] text-[14px] font-medium leading-[32px] tracking-[1.25px] text-white">
            REQUEST A REPLACEMENT
            </button>
          </div>
          <div className="bg-[#E7F5F8] p-[30px]">
            <div className="flex flex-col gap-[20px]">
              <div className="flex flex-col gap-[20px]">
                <p className="text-[24px] font-normal leading-[32px]">About Replacements</p>
                <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px]">
                  Replacement requests sometimes require us to verify the specifics of the damage or
                  defect, so one of our customer service agents may need to contact you for more
                  information. Once we've assessed what is needed to resolve your replacement
                  request, we will send out the appropriate replacement(s) as quickly as possible.
                  If the original item is required back, we will email you with return instructions
                  and prepaid return labels so that you can send back the damaged or defective
                  merchandise.
                </div>
              </div>
              <div>
                <p className="text-[20px] font-bold leading-[32px] tracking-[0.15px] text-[#4EAECC]">
                View Full Replacement Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
