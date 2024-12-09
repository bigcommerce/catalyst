export default function ReturnRequestConfirmation() {
  return (
    <div className="my-[2rem] flex w-full justify-center text-[#353535]">
      <div className="flex w-[70%] flex-col gap-[30px]">
        <div>
          <p>Bread crumbs</p>
        </div>
        <div className="flex flex-col gap-[20px]">
          <div className="flex items-center gap-2">
            <img src="" alt="tik img" className="h-[24px] w-[24px]" />
            <div className="text-[24px] font-normal leading-[32px] text-[#167E3F]">
              Your Return Request has been Sent.
            </div>
          </div>
          <div className="flex flex-col gap-1 text-[20px] font-[500] leading-[32px] tracking-[0.15px]">
            <div>What's Next? </div>
            <div className="text-[16px]">
              You will receive an email with return instructions within 1-2 business days. If we
              need more information, a team member will contact you directly.
            </div>
          </div>
          <div className="flex flex-col gap-1 text-[20px] font-[500] leading-[32px] tracking-[0.15px]">
            <div>Why the Wait?</div>
            <div className="text-[16px]">
              All of our returns require an Return Goods Authorization (RGA) Number. In some cases,
              we require confirmation from the product's manufacturer to obtain the RGA number.{' '}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
