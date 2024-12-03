'use client';
import React, { useState } from 'react';
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

export default function SalesBuddyAppIndex() {
  const [isOpen, setIsOpen] = useState(false); 
  const path = usePathname();
  // Extract last segment of the path
  const pathMatch = path.match(/\/([^\/?]*)/);
  const lastSegment = pathMatch ? pathMatch[1] : '';
  const endsWithNumbers = /\d+$/.test(lastSegment);
  const toggleDrawer = () => setIsOpen(!isOpen);
  console.log(path.split('/').length - 1 === 2 && endsWithNumbers);
  
  const renderDrawerContent = () => {
    if (path === '/') {
      return (
        <div className="">
          <CustomerSupportPage />
        </div>
      );
    }

    if (path === '/cart/') {
      return (
        <div className="space-y-[20px]">
          <ReferalId />
          <CartInterface />
          <CustomerSupportPage />
        </div>
      );
    }

    if (path.split('/').length - 1 === 2 && endsWithNumbers) {
      return (
        <div className=" space-y-[20px] ">
          <SalesBuddyProductPage />
          <CustomerSupportPage />
        </div>
      );
    }
    if (!endsWithNumbers){
        return (
          <div className="">
            <CustomerSupportPage />
            <PLPPageInterface />
          </div>
        );
    }
     return null; 
  };

  return (
    <>
      {/* Chat Button */}
      <div className="no-scrollbar h-full justify-start bg-[#F3F4F5]">
        <button onClick={toggleDrawer} className="fixed bottom-[10vh] left-[5%] flex">
          <Image src={ChatIcon} alt="Chat Icon" className="h-[164px] w-[164px] object-cover" />
        </button>
      </div>

      {/* Drawer Modal */}
      <DrawerModal
        isOpen={isOpen}
        onClose={toggleDrawer}
        headerTitle="Agent Tools"
        headerIcon={AppIcon}
        position={path === '/cart/' ? 'right' : 'left'}
        width="500px"
      >
        <div className="h-full w-[460px] bg-[#F3F4F5]">{renderDrawerContent()}</div>
      </DrawerModal>
    </>
  );
}
