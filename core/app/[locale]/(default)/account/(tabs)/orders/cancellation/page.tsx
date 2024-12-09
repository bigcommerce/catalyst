export default function Cancellation() {
    return (
      <div className="text-[#353535] flex justify-center w-full my-[2rem]">
        <div className="flex flex-col gap-[30px] w-[70%]">
          <div>
            <p>Bread crumbs</p>
          </div>
          <div className="flex flex-col gap-[30px]">
            <div className="flex flex-col gap-[30px]">
              <div className="text-[24px] font-[400] leading-[32px]">You are Requesting a Cancellation</div>
              <div className="bg-[#F3F4F5] p-[20px]">
                <div className="flex items-center gap-[40px]">
                  <div className="bg-[#CCCBCB]">
                    <img src="" alt="image" className="h-[150px] w-[150px]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[16px] font-[400] leading-[32px] tracking-[0.15px]">
                      Crystorama Lighting - 8828-GA-CL-MWP - Bridgehampton - 8 Light Chandelier ...
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
                    <p className=" text-[#1DB14B]">
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
                      Qty to Cancel
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
                  Reason for Cancellation (Optional)
                  </div>
                </div>
                <div>
                  <select name="" className="flex flex-col justify-center items-start p-[6px] px-[10px] gap-[10px] border border-[#CCCBCB] rounded-[3px] bg-white w-full h-[44px]" id="">
                    <option value="">1</option>
                    <option value="">2</option>
                    <option value="">3</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-[20px]">
                <div>
                  <div className="text-[20px] font-[500] leading-[32px] tracking-[0.15px]">
                    Comments (Optional)
                  </div>
                </div>
                <div>
                  <input type="text" className="py-[6px] px-[10px] h-[44px] bg-white border border-[#CCCBCB] rounded-[3px] w-full" placeholder="Add your comments here..." />
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <button className="font-medium text-[14px] leading-[32px] tracking-[1.25px] text-white p-[5px] px-[10px] bg-[#008BB7] rounded-[3px] flex justify-center items-center">REQUEST CANCELLATION</button>
            </div>
            <div className="bg-[#E7F5F8] p-[30px]">
              <div className="flex flex-col gap-[20px]">
                <div className="flex flex-col gap-[20px]">
                  <p className="font-normal text-[24px] leading-[32px]">About Cancellations</p>
                  <p className="font-normal text-[16px] leading-[32px] tracking-[0.15px]">Cancellations are made on a best efforts basis. Due to our priority with manufacturers, our orders are processed very quickly. It's not always possible to stop an order from shipping, even if you request to cancel the same day an order was placed. We will do all we can to stop the order, but if it should ship, a return can be requested through our normal return policy.</p>
                </div>
                <div>
                  <p className="font-bold text-[20px] leading-[32px] tracking-[0.15px] text-[#4EAECC]">View Full Cancellation Policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  