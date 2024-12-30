import React from 'react';
import { BcImage } from '~/components/bc-image';
import { imageManagerImageUrl } from '~/lib/store-assets';

interface TeamMemberProps {
  imageSrc: string;
  name: string;
  startYear: string;
  quote: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({ imageSrc, name, startYear, quote }) => (
  <div className="flex flex-col items-center border border-[#E8E7E7] p-6">
    <div className="mb-4 h-32 w-32 overflow-hidden rounded-full">
      <BcImage
        alt={`${name} profile`}
        width={1600}
        height={300}
        unoptimized={true}
        src={imageSrc}
        className="trade-banner-image h-[100%]"
      />
    </div>
    <h3 className="mb-2 text-center text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#002A37]">
      {name}
    </h3>
    <h4 className="mb-2 text-center text-[16px] font-bold leading-[32px] tracking-[0.5px] text-[#008BB7]">
      Team Member Since {startYear}
    </h4>
    <p className="text-left text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
      {quote}
    </p>
  </div>
);

const TeamMembersSection: React.FC = () => {
  const teamMembers = [
    {
      imageSrc: imageManagerImageUrl('team-member7-trade.png', 'original'),

      name: 'Garrison Samples',
      startYear: '2014',
      quote:
        '"Getting our customers the best deal on products is the easiest part of my day, and I love helping their plan come together!"',
    },
    {
      imageSrc: imageManagerImageUrl('team-member6-trade.png', 'original'),

      name: 'Armando Ramirez',
      startYear: '2016',
      quote:
        '"Supporting PRO business is rewarding, because at it\'s core- it is a pure contribution to someone else\'s success."',
    },
    {
      imageSrc: imageManagerImageUrl('team-member5-trade.jpg', 'original'),

      name: 'Jeremy Coone',
      startYear: '2020',
      quote: '"It\'s my privilege to get my clients the right products at the right price."',
    },
    {
      imageSrc: imageManagerImageUrl('team-member4-trade.jpg', 'original'),
      name: 'Sandy Vogt',
      startYear: '2017',
      quote:
        '"Getting what clients want or need for their properties is always a puzzle, and that\'s what makes my job so interesting. No project is a walk in the park, but that\'s what keeps it exciting."',
    },
    {
      imageSrc: imageManagerImageUrl('team-member3-trade.jpg', 'original'),
      name: 'Erik Anderson',
      startYear: '2018',
      quote:
        "'I enjoy providing maximum comfort for my clients while we meticulously resolve project challenges. I believe in measuring twice and ordering once.'",
    },
    {
      imageSrc: imageManagerImageUrl('team-member2-trade.jpg', 'original'),
      name: 'Kalia Vue',
      startYear: '2019',
      quote:
        '"Probably my favorite thing about my role, is ensuring that our customers are happy at the end. When they are stressed about an order, I like to create a Christmas-like experience and address the issues with the same urgency I\'d expect if I was in their shoes."',
    },
    {
      imageSrc: imageManagerImageUrl('team-member1-trade.jpg', 'original'),
      name: 'Katherine Leonard',
      startYear: '2021',
      quote:
        '"I enjoy working in the PRO space because not only do I play a role in helping their business succeed, but my work also enables me to help our product partners get their new creations out in the world."',
    },
  ];

  return (
    <div className="m-auto w-[94%] bg-white">
      <h2 className="mb-[20px] mt-[40px] pt-[30px] text-center text-[24px] font-normal leading-[32px] text-[#353535]">
      Meet some of Our Amazing Team Members
      </h2>
      <div className="m-auto grid w-[95%] grid-cols-1 gap-6 pb-[40px] sm:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member, index) => (
          <TeamMember key={index} {...member} />
        ))}
      </div>
    </div>
  );
};

export default TeamMembersSection;
