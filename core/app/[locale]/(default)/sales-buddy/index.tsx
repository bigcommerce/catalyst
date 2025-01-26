'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import AppIcon from './assets/image.png';
import DrawerModal from './common-components/SalesBuddyDrawer/SalesBuddyDrawer';
import ChatIcon from './assets/DrawerIcon.png'; // Replace with your chat icon path
import { usePathname } from 'next/navigation';
import CustomerSupportPage from './common-components/_components/CustomerSupportPage';
import CartInterface from './common-components/_components/CartInterfacePage';
import ReferalId from './common-components/_components/CartReferralPage';
import SalesBuddyProductPage from './common-components/_components/PDPPage';
import PLPPageInterface from './common-components/_components/PLPPageInterface';
import { InsertShopperVisitedUrl } from './_actions/insert-shopper-url';

export default function SalesBuddyAppIndex() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };
  const path = usePathname();
  const [customerAccordinOpenIndexes, setCustomerAccordinOpenIndexes] = useState<number[]>([]);
  const [cartAccordinOpenIndexes, setCartAccordinOpenIndexes] = useState<number[]>([]);
  const [pdpAccordinOpenIndexes, setPdpAccordinOpenIndexes] = useState<number[]>([]);
  const [plpAccordinOpenIndexes, setPlpAccordinOpenIndexes] = useState<number[]>([]);

  const CustomerSupportToggleAccordion = (index: any) => {
    setCustomerAccordinOpenIndexes(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };
  const CartToggleAccordion = (index: any) => {
    setCartAccordinOpenIndexes(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };
  const PDPToggleAccordion = (index: any) => {
    setPdpAccordinOpenIndexes(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };
  const PLPToggleAccordion = (index: any) => {
    setPlpAccordinOpenIndexes(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };


  const renderDrawerContent = () => {
    if (path.indexOf('/cart/') > -1 || path.indexOf('/cart') > -1) {
      return (
        <div className="space-y-[20px]">
          <ReferalId />
          <CartInterface toggleAccordion={CartToggleAccordion} openIndexes={cartAccordinOpenIndexes} setOpenIndexes={setCartAccordinOpenIndexes} />
          <CustomerSupportPage toggleAccordion={CustomerSupportToggleAccordion} openIndexes={customerAccordinOpenIndexes} setOpenIndexes={setCustomerAccordinOpenIndexes} />
        </div>
      );
    } else if (path.indexOf('/c/') > -1 || path.indexOf('/search/') > -1) {
      return (
        <div className="">
          <CustomerSupportPage toggleAccordion={CustomerSupportToggleAccordion} openIndexes={customerAccordinOpenIndexes} setOpenIndexes={setCustomerAccordinOpenIndexes} />
          <PLPPageInterface toggleAccordion={PLPToggleAccordion} openIndexes={plpAccordinOpenIndexes} setOpenIndexes={setPlpAccordinOpenIndexes} />
        </div>
      );
    }
    else if (path.indexOf('/p/') !== -1) {
      return (
        <div className=" space-y-[20px] ">
          <SalesBuddyProductPage toggleAccordion={PDPToggleAccordion} openIndexes={pdpAccordinOpenIndexes} setOpenIndexes={setPdpAccordinOpenIndexes} />
          <CustomerSupportPage toggleAccordion={CustomerSupportToggleAccordion} openIndexes={customerAccordinOpenIndexes} setOpenIndexes={setCustomerAccordinOpenIndexes} />
        </div>
      );
    } else {
      return (
        <div className="">
          <CustomerSupportPage toggleAccordion={CustomerSupportToggleAccordion} openIndexes={customerAccordinOpenIndexes} setOpenIndexes={setCustomerAccordinOpenIndexes} />
        </div>
      );
    }
    return null;
  };


  return (
    <>
      <div className=" no-scrollbar h-full justify-start bg-[#F3F4F5]">
        <button
          onClick={(event) => {
            event.stopPropagation(); // Prevents the click from bubbling up
            toggleDrawer(event);
          }}
          className="fixed bottom-[1vh] left-[1vh] flex"
        >
          <Image src={ChatIcon} alt="Chat Icon" className="h-[164px] w-[164px] object-cover" />
        </button>
      </div>

      <DrawerModal
        isOpen={isOpen}
        onClose={toggleDrawer}
        headerTitle="Agent Tools"
        headerIcon={AppIcon}
        position={path === '/cart/' || path==='/cart' ? 'right' : 'left'}
        width="500px"
      >
        <div className="h-full w-[460px] bg-[#F3F4F5]">{renderDrawerContent()}</div>
      </DrawerModal>
    </>
  );
}
