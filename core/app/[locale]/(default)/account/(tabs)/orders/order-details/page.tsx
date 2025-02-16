export default function OrderDetails() {
  return (
    <div className="my-[1rem] flex justify-center text-[#353535]">
      <div className="flex w-[70%] flex-col gap-[20px]">
        <div>
          <p>Bread crumbs</p>
        </div>
        <div className="flex flex-col gap-[30px]">
          <div className="flex items-center justify-between">
            <div className="text-[24px] font-normal leading-[32px]">Order #1234567890</div>
            <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#008BB7]">
              Print Invoice
            </div>
          </div>
          <div className="flex items-center gap-[5px]">
            <div className="text-[16px] font-normal leading-[32px] tracking-[0.15px]">
              Still need help?{' '}
            </div>
            <div className="text-[16px] font-[500] leading-[32px] tracking-[0.15px] text-[#008BB7]">
              Contact Us
            </div>
          </div>
          <div className="flex flex-col gap-[30px]">
            <div>
              <p className="text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#000000]">
                Items In This Order (3)
              </p>
            </div>
            <div className="flex flex-col gap-[30px]">
              <div className="flex flex-col items-start gap-[15px] border border-[#CCCBCB] p-0">
                <div className="flex w-full flex-row items-start gap-[10px] bg-[#03465C] p-[10px]">
                  <button className="flex flex-row items-center justify-center gap-[10px] rounded-[50px] bg-[#F3F4F5] px-[10px] text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#353535]">
                    PROCESSING
                  </button>
                </div>
                <div className="flex w-full flex-row items-center justify-between p-0 px-[20px] pb-[20px]">
                  <div className="flex w-2/3 flex-row items-center gap-[20px] p-0 pr-[20px]">
                    <div>
                      <img
                        src=""
                        width={150}
                        height={150}
                        className="h-[150px] w-[150px]"
                        alt="imag1"
                      />
                    </div>
                    <div className="flex-shrink-[100]">
                      <div className="items-center text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                        Crystorama Lighting - 8828-GA-CL-MWP - Bridgehampton - 8 Light Chandelier
                        ...
                      </div>
                      <div>
                        <span className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                          SKU: ABC-1234DE
                        </span>
                        <span className="text-[14px] font-[400] leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                          {' '}
                          |{' '}
                        </span>
                        <span className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                          Finish:
                        </span>
                        <span className="text-[14px] font-[400] leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                          {' '}
                          Oil Rubbed Bronze
                        </span>
                      </div>
                      <div className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#353535]">
                        QTY: 1
                      </div>
                    </div>
                    <div className="flex min-w-[25%] flex-col justify-center text-right">
                      <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#1DB14B]">
                        <span>10% Coupon:</span> <span>$81.17</span>
                      </div>
                      <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px]">
                        $90.18
                      </div>
                      <div className="flex items-center justify-end gap-[2px]">
                        <span className="text-[14px] font-normal leading-[24px] tracking-[0.25px] line-through">
                          $100.20
                        </span>
                        <span className="text-[12px] font-normal leading-[18px] tracking-[0.4px] text-[#5C5C5C]">
                          10% Off
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/3">
                    <button className="flex w-full flex-row items-center justify-center gap-[5px] rounded-[3px] bg-[#008BB7] p-[5px] px-[10px] text-[14px] font-medium leading-[32px] tracking-[1.25px] text-white">
                      CANCEL ORDER
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start gap-[15px] border border-[#CCCBCB] p-0">
                <div className="flex w-full flex-row items-start gap-[10px] bg-[#03465C] p-[10px]">
                  <button className="flex flex-row items-center justify-center gap-[10px] rounded-[50px] bg-[#F3F4F5] px-[10px] text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#353535]">
                    PROCESSING
                  </button>
                </div>
                <div className="flex w-full flex-row items-center justify-between p-0 px-[20px] pb-[20px]">
                  <div className="flex w-2/3 flex-row items-center gap-[20px] p-0 pr-[20px]">
                    <div>
                      <img
                        src=""
                        width={150}
                        height={150}
                        className="h-[150px] w-[150px]"
                        alt="imag1"
                      />
                    </div>
                    <div className="flex-shrink-[100]">
                      <div className="items-center text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                        Crystorama Lighting - 8828-GA-CL-MWP - Bridgehampton - 8 Light Chandelier
                        ...
                      </div>
                      <div>
                        <span className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                          SKU: ABC-1234DE
                        </span>
                        <span className="text-[14px] font-[400] leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                          {' '}
                          |{' '}
                        </span>
                        <span className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                          Finish:
                        </span>
                        <span className="text-[14px] font-[400] leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                          {' '}
                          Oil Rubbed Bronze
                        </span>
                      </div>
                      <div className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#353535]">
                        QTY: 1
                      </div>
                    </div>
                    <div className="flex min-w-[25%] flex-col justify-center text-right">
                      <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#1DB14B]">
                        <span>10% Coupon:</span> <span>$81.17</span>
                      </div>
                      <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px]">
                        $90.18
                      </div>
                      <div className="flex items-center justify-end gap-[2px]">
                        <span className="text-[14px] font-normal leading-[24px] tracking-[0.25px] line-through">
                          $100.20
                        </span>
                        <span className="text-[12px] font-normal leading-[18px] tracking-[0.4px] text-[#5C5C5C]">
                          10% Off
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/3">
                    <button className="flex w-full flex-row items-center justify-center gap-[5px] rounded-[3px] bg-[#008BB7] p-[5px] px-[10px] text-[14px] font-medium leading-[32px] tracking-[1.25px] text-white">
                      TRACK YOUR ORDER
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start gap-[15px] border border-[#CCCBCB] p-0">
                <div className="flex w-full flex-row items-start gap-[10px] bg-[#03465C] p-[10px]">
                  <button className="flex flex-row items-center justify-center gap-[10px] rounded-[50px] bg-[#F3F4F5] px-[10px] text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#353535]">
                    PROCESSING
                  </button>
                </div>
                <div className="flex w-full flex-row items-center justify-between p-0 px-[20px] pb-[20px]">
                  <div className="flex w-2/3 flex-row items-center gap-[20px] p-0 pr-[20px]">
                    <div>
                      <img
                        src=""
                        width={150}
                        height={150}
                        className="h-[150px] w-[150px]"
                        alt="imag1"
                      />
                    </div>
                    <div className="flex-shrink-[100]">
                      <div className="items-center text-[16px] font-normal leading-[32px] tracking-[0.15px] text-black">
                        Crystorama Lighting - 8828-GA-CL-MWP - Bridgehampton - 8 Light Chandelier
                        ...
                      </div>
                      <div>
                        <span className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                          SKU: ABC-1234DE
                        </span>
                        <span className="text-[14px] font-[400] leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                          {' '}
                          |{' '}
                        </span>
                        <span className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                          Finish:
                        </span>
                        <span className="text-[14px] font-[400] leading-[24px] tracking-[0.25px] text-[#7F7F7F]">
                          {' '}
                          Oil Rubbed Bronze
                        </span>
                      </div>
                      <div className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#353535]">
                        QTY: 1
                      </div>
                    </div>
                    <div className="flex min-w-[25%] flex-col justify-center text-right">
                      <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#1DB14B]">
                        <span>10% Coupon:</span> <span>$81.17</span>
                      </div>
                      <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px]">
                        $90.18
                      </div>
                      <div className="flex items-center justify-end gap-[2px]">
                        <span className="text-[14px] font-normal leading-[24px] tracking-[0.25px] line-through">
                          $100.20
                        </span>
                        <span className="text-[12px] font-normal leading-[18px] tracking-[0.4px] text-[#5C5C5C]">
                          10% Off
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-1/3">
                    <div className="flex flex-col gap-[5px]">
                      <button className="flex w-full flex-row items-center justify-center gap-[5px] rounded-[3px] bg-[#008BB7] p-[5px] px-[10px] text-[14px] font-medium leading-[32px] tracking-[1.25px] text-white">
                        CANCEL ORDER
                      </button>
                      <div className="h-[42px] self-center text-center text-[12px] font-normal leading-[18px] tracking-[0.4px] text-[#000000]">
                        Eligible Through mm/dd/yy
                      </div>
                      <button className="flex h-[42px] flex-row items-center justify-center rounded-[3px] border border-[#B4DDE9] bg-[#ffffff] p-[5px_10px] text-[14px] font-[500] leading-[32px] tracking-[1.25px] text-[#002A37] hover:bg-brand-50">
                        LEAVE A REVIEW
                      </button>
                      <button className="flex h-[42px] flex-row items-center justify-center rounded-[3px] border border-[#B4DDE9] bg-[#ffffff] p-[5px_10px] text-[14px] font-[500] leading-[32px] tracking-[1.25px] text-[#002A37] hover:bg-brand-50">
                        REPLACE ITEMS
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-b border-b-[#E8E7E7]">
            <div className="pb-1 text-[24px] font-normal leading-[32px] text-black">
              Order Summary
            </div>
          </div>
          <div className="flex justify-between gap-[30px]">
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
            <div className="flex w-1/2 flex-col gap-[3px] text-[16px] font-normal leading-[32px] tracking-[0.5px]">
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
      </div>
    </div>
  );
}
