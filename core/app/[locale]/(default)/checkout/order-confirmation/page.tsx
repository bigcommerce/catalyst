'use server';

import { cookies } from 'next/headers';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { getOrderDetails } from './page-data';
import { OrderDetailsInfo } from './order-details';

const emailImg = imageManagerImageUrl('emailicon.png', '16w');
const facebookImg = imageManagerImageUrl('facebook.png', '23w');
const googleImg = imageManagerImageUrl('google-logo.png', '23w');
const appleImg = imageManagerImageUrl('apple-logo.png','24w');
const tikGreenImg = imageManagerImageUrl('tikgreen.png','20w');
const deleteImg = imageManagerImageUrl('delete.png','16w');
const printIconImg = imageManagerImageUrl('printicon.png','16w');
const creditCardImg = imageManagerImageUrl('creditcard.png','20w');
const productSampleImg = imageManagerImageUrl('image-2-.png','150w');

export default async function OrderConfirmation() {
  const cookieStore = await cookies();
  const orderId = cookieStore.get('orderId')?.value;
  
  console.log('=========orderId======', orderId);
  if (orderId) {
    const data  = await getOrderDetails({orderId});
    console.log('----orderId----', JSON.stringify(data));
  }

  return (
    <div className="lg:mt-[3rem] mt-[1rem] flex lg:flex-row justify-around gap-[30px] lg:gap-[50px] px-[20px] flex-col">
      <div className="flex w-full lg:w-[calc((800/1600)*100vw)] flex-col items-start gap-[30px] p-[0px] lg:p-[0px_40px]">
        <div className="flex flex-col items-start gap-[10px] p-[0px]">
          <OrderDetailsInfo />
          <div className="flex items-center gap-[7px] w-full justify-center xsm:justify-normal xsm:w-[unset]">
            <img src={tikGreenImg} className='relative self-start top-[6px]' width={20} height={20} alt="Tik" />
            <p className="flex items-center xsm:text-[24px] xsm:font-[400] xsm:-tracking-normal leading-[32px] text-[#353535] text-[20px] font-[500] tracking-[0.15px]">
              Your order has been placed
            </p>
          </div>
          <p className="flex flex-col">
            <span className="text-[16px] font-[400] leading-[32px] xsm:tracking-[0.15px] tracking-[0.5px] text-[#353535] text-center xsm:text-left">
              We have received your order. You will receive an email conformation at
            </span>
            <span className="text-[16px] lg:font-[700] font-normal text-[#008BB7] text-center xsm:text-left leading-[32px] sm:tracking-[0.15px] tracking-[0.5px] lg:text-[#353535]">
              customer.email@domail.com
            </span>
          </p>
        </div>
        <div className='flex flex-row lg:hidden justify-center items-center p-0 gap-[10px] bg-[#F3F4F5] w-full min-h-[400px]'>
          <p className='font-normal text-[34px] leading-[46px] text-center tracking-[0.25px] text-[#353535]'>Rewards Summary Placeholder</p>
        </div>
        <div className="flex w-full mt-[-10px] xsm:mt-[0px] items-center flex-col xsm:flex-row justify-between gap-[20px] border-b border-[#d6d6d6] pb-[8px]">
          <p className="text-[24px] font-[400] leading-[32px] text-[#353535]">Order Summary</p>
          <div className="flex items-center gap-[5px]">
            <img src={printIconImg} alt="print" width={16} height={16} />
            <p className="text-[16px] font-[400] tracking-[0.15px] text-[#7F7F7F]">Print</p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-[5px]">
          <p className="text-[16px] font-[400] leading-[32px] tracking-[0.15px] text-[#353535]">
            Confirmation Number:{' '}
            <span className="text-[16px] font-[600] leading-[32px] tracking-[0.15px] text-[#353535]">
              1234567890
            </span>
          </p>
          <p className="text-[16px] font-[400] leading-[32px] tracking-[0.15px] text-[#353535]">
            Order Date:{' '}
            <span className="text-[16px] font-[600] leading-[32px] tracking-[0.15px] text-[#353535]">
              7/22/2024
            </span>
          </p>
        </div>
        <div className="flex flex-col items-start gap-[20px]">
          <div>
            <p className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#353535]">
              Customer Contact
            </p>
            <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
              customer.email@domain.com
            </p>
          </div>
          <div>
            <p className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#353535]">
              Shipping Address
            </p>
            <div>
              <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                Customer Name
              </p>
              <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                3321 Power Inn Rd
              </p>
              <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                Suite 310
              </p>
              <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                Sacramento, CA 95826
              </p>
            </div>
          </div>
          <div>
            <p className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#353535]">
              Billing Address
            </p>
            <div>
              <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                Customer Name
              </p>
              <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                3321 Power Inn Rd
              </p>
              <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                Suite 310
              </p>
              <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                Sacramento, CA 95826
              </p>
            </div>
          </div>
          <div className='flex items-start gap-[7px]'>
            <p className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#353535]">
              Payment
            </p>
            <img src={tikGreenImg} className='relative !top-[5px]' alt="Tik img" />
          </div>
        </div>
        <div className="flex w-full flex-col">
          <p className="text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#002A37]">
            <span>Order Total: </span>
            <span>$543.21</span>
          </p>
          <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
            <span>Reg. Subtotal </span>
            <span>$ 600</span>
          </p>
          <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
            <span>Discounts </span>
            <span className="text-[#008BB7]">-$ 150.00</span>
          </p>
          <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
            <span>Coupon: COUPON </span>
            <span>-$ 15.00</span>
          </p>
          <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
            <span>You Save </span>
            <span className="text-[#008BB7]">$ 165.00</span>
          </p>
          <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
            <span>Subtotal </span>
            <span>$ 435.00</span>
          </p>
          <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
            <span>Shipping </span>
            <span>FREE</span>
          </p>
          <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
            <span>Freight & Handling </span>
            <span>$ 15.00</span>
          </p>
          <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
            <span>Alaska/Hawaii Surcharge </span>
            <span>$ 40.00</span>
          </p>
          <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
            <span>Tax </span>
            <span>$ 0.00</span>
          </p>
          <p className="flex flex-row items-center justify-between border-b border-[#E8E7E7] text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
            <span>Total </span>
            <span>$ 476.00</span>
          </p>
        </div>
        <div>
          <p className="text-[24px] font-normal leading-[32px] text-[#353535]">
            Items In Your Order <span>(5)</span>
          </p>
        </div>
        <div className="flex w-full flex-col items-start gap-[10px] border border-[#CCCBCB] p-[10px]">
          <div className="flex w-full flex-row items-center gap-[20px] p-0">
            <div>
              <img src={productSampleImg} width={88} height={88} alt="bulp" className='w-[88px] h-[88px]' />
            </div>
            <div className="flex flex-col items-start gap-[5px] p-0">
              <p className='font-normal text-[14px] leading-[24px] tracking-[0.25px] text-[#353535]'>Product Title Goes Here</p>
              <p className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                <span>QTY: 5 </span>
                <span className="bg-[#FBF4E9] px-[10px] text-[#6A4C1E]">Final Sale</span>
              </p>
            </div>
          </div>
          <div className='w-full flex flex-row flex-wrap justify-between items-center content-start p-[10px] gap-x-[312px] bg-[#F3F4F5]'>
            <div className='flex flex-col justify-center items-start p-0 gap-[5px] w-full'>
              <div className='flex flex-row items-center p-0 gap-[17px]'>
                <img src={productSampleImg} width={75} height={75} alt="blank" className='w-[75px] h-[75px]' />
                <p className='font-normal text-[14px] leading-[24px] tracking-[0.25px] text-[#353535]'>Accessory Title Goes Here</p>
              </div>
              <div className='flex flex-row justify-between items-center p-0 gap-[20px] w-full'>
                <p className='font-normal text-[12px] leading-[18px] tracking-[0.4px] text-[#353535]'>QTY: 5</p>
                <img src={deleteImg} alt="dlt" width={16} height={18} className='w-[16px] h-[18px]' />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full lg:w-[calc((500/1600)*100vw)] lg:flex-col flex-col-reverse items-start gap-[40px] p-[0px] lg:px-[40px]">
        <div className="flex w-full flex-col items-start gap-[20px] p-0">
          <p className="text-[20px] font-[500] text-center w-full lg:text-left leading-[32px] tracking-[0.15px] text-[#353535]">
            Save Your Details for Next Time:
          </p>
          <div className="flex w-full flex-col gap-[20px] p-0">
            <button className="flex h-[54px] flex-row items-center justify-center gap-[10px] rounded-[5px] bg-[#002A37] shadow-[0px_0px_3px_rgba(0,0,0,0.084),0px_2px_3px_rgba(0,0,0,0.168)]">
              <img src={emailImg} alt="e-mail" />
              <p className="text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-[#FFFFFF]">
                Continue with Email
              </p>
            </button>
            <p className="text-[16px] font-[400] leading-[32px] text-center lg:text-left tracking-[0.15px] text-[#353535]">
              Or, Sign in with an Existing Account
            </p>
            <div className="flex flex-col gap-[20px]">
              <button className="flex h-[54px] flex-row items-center justify-center gap-[10px] rounded-[5px] bg-[#1877F2]">
                <img src={facebookImg} alt="facebook" />
                <p className="text-[20px] font-[700] leading-[23px] text-[#FFFFFF]">
                  Log in with Facebook
                </p>
              </button>
              <button className="flex h-[54px] flex-row items-center justify-center gap-[10px] rounded-[5px] bg-[#FFFFFF] shadow-[0px_0px_3px_rgba(0,0,0,0.084),0px_2px_3px_rgba(0,0,0,0.168)]">
                <img src={googleImg} alt="google" />
                <p className="text-[rgba(0,0,0,0.54) text-[20px] font-[500] leading-[23px]">
                  Log in with Google
                </p>
              </button>
              <button className="flex h-[54px] flex-row items-center justify-center gap-[10px] rounded-[5px] bg-[#353535] shadow-[0px_0px_3px_rgba(0,0,0,0.084),0px_2px_3px_rgba(0,0,0,0.168)]">
                <img src={appleImg} alt="apple" />
                <p className="text-[20px] font-[500] leading-[24px] text-[#FFFFFF]">
                  Log in with Apple
                </p>
              </button>
            </div>
          </div>
        </div>
        <div className='lg:flex flex-row hidden justify-center items-center p-0 gap-[10px] bg-[#F3F4F5] w-full lg:min-h-[400px]'>
          <p className='font-normal text-[34px] leading-[46px] text-center tracking-[0.25px] text-[#353535]'>Rewards Summary Placeholder</p>
        </div>
        <div className="flex flex-col">
          <p className="text-[20px] font-[500] leading-[32px] tracking-[0.15px] text-[#353535]">
            Something Wrong?
          </p>
          <p>
            <a className="text-[20px] font-[400] leading-[32px] tracking-[0.15px] text-[#008db8] underline">
              Update Contact or Delivery
            </a>
          </p>
          <p>
            <a className="text-[20px] font-[400] leading-[32px] tracking-[0.15px] text-[#008db8] underline">
              Cancel Order
            </a>
          </p>
          <p>
            <a className="text-[20px] font-[400] leading-[32px] tracking-[0.15px] text-[#008db8] underline">
              Contact an Agent
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}