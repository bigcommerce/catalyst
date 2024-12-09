export default function ReturnInstruction() {
  return (
    <div className="my-[2rem] flex w-full justify-center text-[#353535]">
      <div className="flex w-[70%] flex-col gap-[30px]">
        <div>
          <p>Bread crumbs</p>
        </div>
        <div className="flex flex-col gap-[30px]">
          <div className="flex flex-col gap-[10px] font-normal leading-[32px]">
            <div className="text-[20px]">Return Method</div>
            <div className="text-[16px]">Your item must be shipped no later than mm/dd/yy.</div>
          </div>
          <div className="flex flex-row gap-[60px]">
            <div className="flex flex-1 flex-col items-start gap-[20px] border border-[#CCCBCB] bg-[#F3F4F5] p-[30px]">
            <div className="flex flex-row items-center p-[0px] pb-[5px] gap-[10px] border-b border-[#008BB7]">
            <div className="font-normal text-[24px] leading-[32px] text-center">Option 1</div>
              </div>
              <div className="font-medium text-[20px] leading-[32px] tracking-[0.15px]">Return with a pre-generated FedEx Label</div>
              <div>
                10% of your return refund will be deducted to cover the applicable return shipping
                costs.
              </div>
              <div className="font-normal text-[14px] leading-[24px] tracking-[0.25px] flex items-center justify-center gap-[10px]">
                <input type="checkbox" className="h-[18px] w-[18px]" />
                <p>I agree to terms and conditions and to refund.</p>
              </div>
              <div className="px-[10px] bg-[#F5E9E8] font-normal text-[14px] leading-[24px] tracking-[0.25px] text-[#A71F23]">You must accept the terms and conditions to proceed.</div>
              <div>
                <button className="flex flex-row justify-center items-center px-[10px] py-[5px] gap-[5px] h-[42px] bg-white border border-[#B4DDE9] rounded-[3px] font-medium text-[14px] leading-[32px] tracking-[1.25px] text-[#002A37]">GET PREPAID LABLE</button>
              </div>
            </div>
            <div className="flex flex-1 flex-col items-start gap-[20px] border border-[#CCCBCB] bg-[#F3F4F5] p-[30px]">
              <div className="flex flex-row items-center p-[0px] pb-[5px] gap-[10px] border-b border-[#008BB7]">
                <div className="font-normal text-[24px] leading-[32px] text-center">Option 2</div>
              </div>
              <div className="flex flex-col gap-[20px]">
                <div className="font-medium text-[20px] leading-[32px] tracking-[0.15px]">Return Via Your Own Shipping Method</div>
                <ul className="list-disc flex flex-col gap-[3px] list-inside font-normal text-[14px] leading-[24px] tracking-[0.25px]"> 
                  <li>Your Return Goods Authorization (RGA) number MUST be noted on the label.</li>
                  <li>
                    After shipping, provide return tracking information to avoid delays in your
                    refund.
                  </li>
                  <li>
                    We highly recommend purchasing insurance for the return package; wea re not
                    responsible for any lost or damaged packages.
                  </li>
                  <li>Please note: We do NOT reimburse for any shipping fees incurred.</li>
                </ul>
              </div>
              <div className="font-bold text-[16px] leading-[32px] tracking-[0.15px]">RGA Number: 123456789</div>
              <div className="flex flex-col gap-[5px]">
                <div className="font-bold text-[16px] leading-[32px] tracking-[0.15px]">Return To:</div>
                <div className="font-normal text-[14px] leading-[24px] tracking-[0.25px]">
                  <div>1234 An Address Way</div>
                  <div>Address Line 2</div>
                  <div>City, State Here, 12345</div>
                </div>
              </div>
              <div className="flex flex-row gap-[10px] items-center">
                <div className="flex justify-center items-center">
                  <img src="" alt="print image" className="h-[16px] w-[16px]" />
                </div>
                <div className="font-normal text-[16px] leading-[32px] tracking-[0.5px] text-[#008BB7]">Print Return Instructions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
