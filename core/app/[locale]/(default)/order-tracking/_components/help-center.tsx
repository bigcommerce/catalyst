export default function HelpCenter() {
  return (
    <div className="flex justify-center">
      <div className="flex w-[70%] flex-col gap-[40px]">
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
