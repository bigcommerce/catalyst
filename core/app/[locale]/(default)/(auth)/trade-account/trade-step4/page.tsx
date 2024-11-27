import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { BcImage } from '~/components/bc-image';

interface TeamMember {
  name: string;
  image: string;
  title: string;
  description: string;
}

const TradeSearch = imageManagerImageUrl('search.png', 'original');
const TradeGroup = imageManagerImageUrl('groups.png', 'original');
const TradeFavourite = imageManagerImageUrl('favorite.png', 'original');
const TradeCircle = imageManagerImageUrl('trade-circle.png', 'original');
const TradeArrowCircle = imageManagerImageUrl('arrow-circle-right.png', 'original');
const TradeCheck = imageManagerImageUrl('check.png', 'original');

interface Link {
  label: string;
  href: string;
  color: string;
  fontWeight: string;
}

const TeamLayout: React.FC = () => {
  const breadcrumbs = [
    {
      label: 'Rewards Program',
      href: '#',
      color: '#000000',
      fontWeight: '400',
    },
  ];

  const teamMembers: TeamMember[] = [
    {
      name: 'Jeremy Coune',
      image: imageManagerImageUrl('team-member1-trade.png', 'original'),
      title: "When I'm not helping pros...",
      description:
        'I love a good craft beer, working at MY loc... finished a latte slip on my dirt...',
    },
    {
      name: 'Sandy Vogt',
      image: imageManagerImageUrl('team-member3-trade.png', 'original'),
      title: "When I'm not helping pros...",
      description: 'I love being outside n enjoying riding bike like...',
    },
    {
      name: 'Erik Andersen',
      image: imageManagerImageUrl('team-member3-trade.png', 'original'),
      title: "When I'm not helping pros...",
      description:
        'I love to stay active, pushing it to reach my goals everyday and so just mastering new goal',
    },
    {
      name: 'Kaila Vue',
      image: imageManagerImageUrl('team-member3-trade.png', 'original'),
      title: "When I'm not helping pros...",
      description:
        'I love discovering local workout spots and small restaurants. Supporting local business and eating their menu specials.',
    },
    {
      name: 'Armando Ramirez',
      image: imageManagerImageUrl('team-member3-trade.png', 'original'),
      title: "When I'm not helping pros...",
      description:
        'Getting out of the city on hiking, trying new foods and enjoying life and family time.',
    },
    {
      name: 'Katherine Leonard',
      image: imageManagerImageUrl('team-member3-trade.png', 'original'),
      title: "When I'm not helping pros...",
      description:
        "I'm testing my way through various recipes, going to learning events with my husband, or I can be found being entertained by the theater arts.",
    },
    {
      name: 'Erik Anderson',
      image: imageManagerImageUrl('team-member3-trade.png', 'original'),
      title: "When I'm not helping pros...",
      description:
        'I love to stay active, pushing it to reach goals everyday and so just mastering new goal',
    },
  ];

  return (
    <div className="mx-auto w-[93%]">
      <ComponentsBreadcrumbs
        className="login-div login-breadcrumb justify-left mx-auto flex pb-6 pt-5"
        breadcrumbs={breadcrumbs}
      />

      <div className="mb-8 flex items-center gap-2">
        <BcImage
          alt="TradeSearch"
          width="10"
          height="10"
          src={TradeCheck}
          className="h-[20px] w-[20px]"
          unoptimized={true}
        />
        <div className="text-[20px] font-normal leading-[32px] text-[#008BB7]">
          Application Submitted!
        </div>
      </div>
      <div className="mb-6 flex">
        <div className="h-[730px] w-[40%] bg-[#006380] p-8">
          <h2 className="mb-4 text-2xl font-normal leading-8 text-[#E7F5F8]">
            Here's what's next...
          </h2>
          <div className="mb-4 text-[16px] text-base font-bold leading-8 tracking-[0.5px] text-[#E7F5F8]">
            Once we’re partners, you can expect elite project support from our dedicated team of
            specialists.
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <BcImage
                alt="TradeSearch"
                width="10"
                height="10"
                src={TradeSearch}
                className="h-[25px] w-[25px]"
                unoptimized={true}
              />
              <p className="text-[16px] text-base font-[400] leading-8 tracking-[0.5px] text-[#E7F5F8]">
                Our team will review your application (usually within 4 business hours)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <BcImage
                alt="TradeSearch"
                width="20"
                height="20"
                src={TradeGroup}
                className="h-[15px] w-[30px]"
                unoptimized={true}
              />
              <p className="text-[16px] text-base font-[400] leading-8 tracking-[0.5px] text-[#E7F5F8]">
                One of our Account Managers will connect with you via email and phone to launch our
                partnership and talk about your current and future projects.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <BcImage
                alt="TradeSearch"
                width="20"
                height="20"
                src={TradeCircle}
                className="h-[25px] w-[25px]"
                unoptimized={true}
              />
              <p className="text-[16px] text-base font-[400] leading-8 tracking-[0.5px] text-[#E7F5F8]">
                Your discount will be active as soon as your account manager reaches out. You can
                start saving right away!
              </p>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center gap-4 text-white">
            <div className="text-center text-[20px] font-[500] leading-[32px] tracking-[0.15px]">
              Start preparing now by adding items to your favorites list!
            </div>
            <div>
              <BcImage
                alt="TradeSearch"
                width="20"
                height="20"
                src={TradeFavourite}
                className="h-[60px] w-[60px]"
                unoptimized={true}
              />
            </div>
          </div>
        </div>

        <div className="w-[60%] overflow-y-auto rounded-r-lg bg-white p-8 pt-4">
          <div className="grid grid-cols-4 gap-6">
            <div className="flex flex-col !items-center justify-start gap-2">
              <h1 className="text-center text-[34px] font-bold leading-[46.3px] tracking-[0.25px] text-[#008DB9]">
                Meet
                <br />
                Your
                <br />
                Team
              </h1>

              <BcImage
                alt="TradeSearch"
                width="20"
                height="20"
                src={TradeArrowCircle}
                className="h-[25px] w-[25px]"
                unoptimized={true}
              />
            </div>

            {teamMembers.map((member, index) => (
              <div key={index} className="group flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-20 w-20 rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mb-2 text-center text-[20px] font-medium leading-[32px] tracking-[0.15px] text-[#002A37]">
                  {member.name}
                </h3>

                <h4 className="mb-2 text-center text-[16px] font-bold leading-[32px] tracking-[0.15px] text-[#009DCC]">
                  {member.title}
                </h4>

                <p className="text-center text-[16px] leading-[24px] tracking-[0.5px] text-[#002A37]">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamLayout;