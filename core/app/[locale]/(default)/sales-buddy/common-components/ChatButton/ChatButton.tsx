import React from 'react';
import Image from 'next/image';
import ChatIcon from './assets/chat_icon.png'; // Replace with your chat icon path
import AppIcon from '../../assets/DrawerIcon.png';
export default function ChatButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-[10vh] right-[5%] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#353535] shadow-lg hover:bg-[#444] focus:outline-none"
    >
      <Image src={AppIcon} alt="Chat" className="h-[30px] w-[30px]" />
    </button>
  );
}
