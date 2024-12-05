export default function OrderSummary() {
  return (
    <div className="flex justify-center">
      <div className="flex w-[90%] flex-col gap-[30px]">
        <div className="flex flex-col gap-[30px]">
          <div className="border-b border-b-[#E8E7E7]">
            <div className="pb-1 text-[24px] font-normal leading-[32px] text-black">
              Order Summary
            </div>
          </div>
          <div className="flex justify-between gap-[0]">
            <div className="flex w-1/2 flex-col gap-[30px]">
              <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                <div>
                  Confirmation Number: <span className="font-[700]">1234567890</span>
                </div>
                <div>
                  Order Date: <span className="font-[700]">7/22/2024</span>
                </div>
              </div>
              <div className="flex flex-col gap-[20px]">
                <div>
                  <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                    Customer Contact
                  </div>
                  <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-black">
                    customer.email@domain.com
                  </div>
                </div>
                <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-black">
                  <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                    Shipping Address
                  </div>
                  <div>
                    <div>Customer Name</div>
                    <div>3321 Power Inn Rd</div>
                    <div>Suite 310</div>
                    <div>Sacramento, CA 95826</div>
                  </div>
                </div>
                <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-black">
                  <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                    Billing Address
                  </div>
                  <div>
                    <div>Customer Name</div>
                    <div>3321 Power Inn Rd</div>
                    <div>Suite 310</div>
                    <div>Sacramento, CA 95826</div>
                  </div>
                </div>
                <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-black">
                  <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                    Payment
                  </div>
                  <div>*** *** *** 1234</div>
                </div>
              </div>
            </div>
            <div className="flex w-1/2 ml-[60px] flex-col gap-[3px] text-[16px] font-normal leading-[32px] tracking-[0.5px]">
              <div className="text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#002A37]">
                Order Total: $543.21
              </div>
              <div>
                <div className="flex justify-between border-b border-b-[#E8E7E7]">
                  <div>Reg. Subtotal</div>
                  <div>$600.00</div>
                </div>
                <div className="flex justify-between border-b border-b-[#E8E7E7]">
                  <div>Discounts</div>
                  <div className="text-[#008BB7]">-$150.00</div>
                </div>
                <div className="flex justify-between border-b border-b-[#E8E7E7]">
                  <div>Coupon: COUPON</div>
                  <div>-$15.00</div>
                </div>
                <div className="flex justify-between border-b border-b-[#E8E7E7]">
                  <div>You Save</div>
                  <div className="text-[#008BB7]">$165.00</div>
                </div>
                <div className="flex justify-between border-b border-b-[#E8E7E7]">
                  <div>Subtotal</div>
                  <div>$435.00</div>
                </div>
                <div className="flex justify-between border-b border-b-[#E8E7E7]">
                  <div>Shipping</div>
                  <div>FREE</div>
                </div>
                <div className="flex justify-between border-b border-b-[#E8E7E7]">
                  <div>Freight & Handling</div>
                  <div>$15.00</div>
                </div>
                <div className="flex justify-between border-b border-b-[#E8E7E7]">
                  <div>Alaska/Hawaii Surcharge</div>
                  <div>$40.00</div>
                </div>
                <div className="flex justify-between border-b border-b-[#E8E7E7]">
                  <div>Tax</div>
                  <div>$0.00</div>
                </div>
                <div className="flex justify-between border-b border-b-[#E8E7E7]">
                  <div>Total</div>
                  <div>$476.00</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-[30px]">
          <div className="font-[500] text-[20px] leading-[32px] tracking-[0.15px] text-black">Items In This Order (3)</div>
          <div className="flex flex-col gap-[30px]">
            <div className="border border-[#cccbcb] p-[20px]">
              <div className="flex gap-[20px] justify-between items-center">
                <div className="flex gap-[20px] items-center flex-1">
                  <div className="bg-[#d9d9d9]">
                    <img src="" alt="image" width={150} height={150} className="w-[150px] h-[150px]" />
                  </div>
                  <div className="flex-shrink-[50] flex flex-col gap-[3px]">
                    <div className="font-normal text-[16px] leading-[32px] tracking-[0.15px] text-black">
                      Crystorama Lighting - 8828-GA-CL-MWP - Bridgehampton - 8 Light Chandelier ...
                    </div>
                    <div className="font-bold text-[14px] leading-[24px] tracking-[0.25px] text-[#7f7f7f]">
                      <span>SKU: ABC-1234DE</span>{' '}
                      <span>
                        | Finish: <span className="font-normal">Oil Rubbed Bronze</span>
                      </span>
                    </div>
                    <div className="font-normal text-[14px] leading-[24px] tracking-[0.25px]">QTY: 1</div>
                  </div>
                </div>
                <div className="flex-1 text-right flex flex-col gap-[3px]">
                  <div className="font-normal text-[14px] leading-[24px] tracking-[0.25px] text-[#1DB14B]">
                    10% Coupon: <span>$81.17</span>
                  </div>
                  <div className="font-normal text-[14px] leading-[24px] tracking-[0.25px]">$90.18</div>
                  <div>
                    <span className="font-normal text-[14px] leading-[24px] tracking-[0.25px] line-through ">$100.20</span> <span className="font-normal text-[12px] leading-[18px] tracking-[0.4px] text-[#5c5c5c]">10% Off</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border border-[#cccbcb] p-[20px]">
              <div className="flex gap-[20px] justify-between items-center">
                <div className="flex gap-[20px] items-center flex-1">
                  <div className="bg-[#d9d9d9]">
                    <img src="" alt="image" width={150} height={150} className="w-[150px] h-[150px]" />
                  </div>
                  <div className="flex-shrink-[50] flex flex-col gap-[3px]">
                    <div className="font-normal text-[16px] leading-[32px] tracking-[0.15px] text-black">
                      Crystorama Lighting - 8828-GA-CL-MWP - Bridgehampton - 8 Light Chandelier ...
                    </div>
                    <div className="font-bold text-[14px] leading-[24px] tracking-[0.25px] text-[#7f7f7f]">
                      <span>SKU: ABC-1234DE</span>{' '}
                      <span>
                        | Finish: <span className="font-normal">Oil Rubbed Bronze</span>
                      </span>
                    </div>
                    <div className="font-normal text-[14px] leading-[24px] tracking-[0.25px]">QTY: 1</div>
                  </div>
                </div>
                <div className="flex-1 text-right flex flex-col gap-[3px]">
                  <div className="font-normal text-[14px] leading-[24px] tracking-[0.25px] text-[#1DB14B]">
                    10% Coupon: <span>$81.17</span>
                  </div>
                  <div className="font-normal text-[14px] leading-[24px] tracking-[0.25px]">$90.18</div>
                  <div>
                    <span className="font-normal text-[14px] leading-[24px] tracking-[0.25px] line-through ">$100.20</span> <span className="font-normal text-[12px] leading-[18px] tracking-[0.4px] text-[#5c5c5c]">10% Off</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border border-[#cccbcb] p-[20px]">
              <div className="flex gap-[20px] justify-between items-center">
                <div className="flex gap-[20px] items-center flex-1">
                  <div className="bg-[#d9d9d9]">
                    <img src="" alt="image" width={150} height={150} className="w-[150px] h-[150px]" />
                  </div>
                  <div className="flex-shrink-[50] flex flex-col gap-[3px]">
                    <div className="font-normal text-[16px] leading-[32px] tracking-[0.15px] text-black">
                      Crystorama Lighting - 8828-GA-CL-MWP - Bridgehampton - 8 Light Chandelier ...
                    </div>
                    <div className="font-bold text-[14px] leading-[24px] tracking-[0.25px] text-[#7f7f7f]">
                      <span>SKU: ABC-1234DE</span>{' '}
                      <span>
                        | Finish: <span className="font-normal">Oil Rubbed Bronze</span>
                      </span>
                    </div>
                    <div className="font-normal text-[14px] leading-[24px] tracking-[0.25px]">QTY: 1</div>
                  </div>
                </div>
                <div className="flex-1 text-right flex flex-col gap-[3px]">
                  <div className="font-normal text-[14px] leading-[24px] tracking-[0.25px] text-[#1DB14B]">
                    10% Coupon: <span>$81.17</span>
                  </div>
                  <div className="font-normal text-[14px] leading-[24px] tracking-[0.25px]">$90.18</div>
                  <div>
                    <span className="font-normal text-[14px] leading-[24px] tracking-[0.25px] line-through ">$100.20</span> <span className="font-normal text-[12px] leading-[18px] tracking-[0.4px] text-[#5c5c5c]">10% Off</span>
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
