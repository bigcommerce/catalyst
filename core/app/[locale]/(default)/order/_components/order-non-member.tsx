export default function OrderNonMember() {
  return (
    <div className="flex justify-center">
      <div className="w-[70%]">
        <div className="my-[2rem] flex flex-col gap-[20px] text-[#353535]">
          <div className="flex flex-col gap-[20px] p-0">
            <div>Home / Find an Order</div>
            <div className="text-[24px] font-[400] leading-[32px] text-[#000]">Find Your Order</div>
            <div className="flex items-center gap-[10px] text-[1rem] font-normal leading-[32px] tracking-[0.15px]">
              <img src="" alt="img 1" className="h-[24px] w-[24px]" />
              <div className="flex items-center gap-[5px]">
                <div>Still need help?</div>
                <div className="font-bold text-[#008BB7]">Contact Us</div>
              </div>
            </div>
            <div className="flex flex-row items-end gap-[20px] p-0">
              <div className="flex flex-1 flex-col gap-[20px]">
                <div className="text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-[#008BB7]">
                  Order Number (Required)
                </div>
                <div>
                  <input
                    type="text"
                    className="flex h-[44px] w-full flex-col items-start justify-center gap-[10px] rounded-[3px] border border-[#CCCBCB] bg-white p-[6px_10px]"
                  />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-[20px]">
                <div className="text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-[#008BB7]">
                  Billing Zip/Postal Code (Required)
                </div>
                <div>
                  <input
                    type="text"
                    className="flex h-[44px] w-full flex-col items-start justify-center gap-[10px] rounded-[3px] border border-[#CCCBCB] bg-white p-[6px_10px]"
                  />
                </div>
              </div>
              <div>
                <button className="flex h-[42px] flex-row items-center justify-center gap-[5px] rounded bg-[#03465C] p-[5px_10px] text-sm font-[500] leading-8 tracking-[1.25px] text-[#ffffff]">
                  FIND ORDER
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[20px] p-0">
            <div className="text-[24px] font-normal leading-[32px] text-[#000]">Results</div>
            <div className="flex flex-col items-start gap-[15px] border border-[#CCCBCB] p-0">
              <div className="w-full bg-[#03465C] p-[10px]">
                <button className="flex h-[32px] flex-row items-center justify-center gap-[10px] rounded-full bg-[#F3F4F5] p-[0px_10px] text-[16px] font-normal leading-[32px]">
                  PROCESSING
                </button>
              </div>
              <div className="flex w-full flex-col items-start gap-[15px] p-[0px_20px_20px]">
                <div className="flex w-full flex-row justify-between">
                  <div className="flex flex-row items-center gap-[5px] text-[16px] font-normal leading-[32px] tracking-[0.15px]">
                    <span>Month DD, YYYY</span>
                    <span>| Order #12345678</span>
                  </div>
                  <div className="flex flex-row items-center gap-[5px] text-[16px] font-normal leading-[32px] tracking-[0.15px]">
                    <span>Order Total: $123.00 |</span>
                    <img src="" alt="Print icon" className="h-[16px] w-[16px]" />
                    <span className="text-[#008BB7]">Print Invoice</span>
                  </div>
                </div>
                <div className="flex w-full flex-row items-center justify-between p-0">
                  <div className="flex flex-1 flex-row items-center gap-[40px] p-0">
                    <div className="flex h-[150px] w-[150px] flex-row gap-[10px] py-[5px]">
                      <img src="" alt="image 1" className="h-[150px] w-[150px]" />
                    </div>
                    <div className="flex flex-[0.7] flex-col items-start justify-center gap-[5px] p-0">
                      <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                        Crystorama Lighting - 8828-GA-CL-MWP - Bridgehampton - 8 Light Chandelier
                        ...
                      </div>
                      <div className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#7f7f7f]">
                        <span>SKU: ABC-1234DE</span>{' '}
                        <span>
                          | Finish: <span className="font-[400]">Oil Rubbed Bronze</span>
                        </span>
                      </div>
                      <div className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#353535]">
                        QTY: 1
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-[0.44] flex-col justify-center gap-[5px] p-0">
                    <button className="flex min-h-[42px] flex-row items-center justify-center rounded-[3px] border border-[#008BB7] bg-[#008BB7] p-[5px_10px] text-[14px] font-medium leading-[32px] tracking-[1.25px] text-white">
                      CANCEL ORDER
                    </button>
                    <button className="flex min-h-[42px] flex-row items-center justify-center rounded-[3px] border border-[#B4DDE9] bg-white p-[5px_10px] text-[14px] font-medium leading-[32px] tracking-[1.25px] text-[#002A37]">
                      VIEW ORDER DETAILS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
