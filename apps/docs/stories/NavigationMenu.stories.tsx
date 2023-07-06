import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuMobile,
  NavigationMenuMobileTrigger,
} from '@bigcommerce/reactant/NavigationMenu';
import type { Meta, StoryObj } from '@storybook/react';
import { Gift, Heart, Menu, Scale, Search, ShoppingCart, User } from 'lucide-react';

const meta: Meta<typeof NavigationMenu> = {
  component: NavigationMenu,
  tags: ['autodocs'],
  argTypes: {
    children: {
      table: {
        disable: true,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof NavigationMenu>;

export const BasicExample: Story = {
  render: () => (
    <NavigationMenu>
      <div className="flex min-h-[92px] w-full items-center justify-between gap-5">
        <a className="text-h4 font-black" href="/home">
          Catalyst Store
        </a>
        <NavigationMenuList className="hidden sm:flex">
          <NavigationMenuItem>
            <NavigationMenuLink href="/men">Men</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/woman">Woman</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/accessories">Accessories</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuList className="hidden sm:flex">
          <NavigationMenuItem>
            <NavigationMenuLink href="/search">
              <Search aria-label="Search" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/compare">
              <Scale aria-label="Compare" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/wish-list">
              <Heart aria-label="Wish list" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/gift-certificates">
              <Gift aria-label="Gift certificates" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/profile">
              <User aria-label="Profile" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/cart">
              <ShoppingCart aria-label="Shopping cart" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <div className="flex items-center gap-5 sm:hidden">
          <NavigationMenuLink href="/cart">
            <ShoppingCart aria-label="Shopping cart" />
          </NavigationMenuLink>
          <NavigationMenuMobileTrigger>
            <Menu />
          </NavigationMenuMobileTrigger>
        </div>
      </div>
      <NavigationMenuMobile>
        <NavigationMenuList className="block pb-6">
          <NavigationMenuItem>
            <NavigationMenuLink href="/men">Men</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/woman">Woman</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/accessories">Accessories</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuList className="block border-t border-gray-200 py-6">
          <NavigationMenuItem>
            <NavigationMenuLink href="/search">
              Search <Search aria-hidden="true" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/compare">
              Compare <Scale aria-hidden="true" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/wish-list">
              Wish List <Heart aria-hidden="true" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/gift-certificates">
              Gift Certificates <Gift aria-hidden="true" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/profile">
              Your account <User aria-hidden="true" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuList className="block border-t border-gray-200 py-6">
          <NavigationMenuLink href="/shipping-and-returns">Shipping & returns</NavigationMenuLink>
          <NavigationMenuLink href="/warranty">Warranty</NavigationMenuLink>
          <NavigationMenuLink href="/location">Downtown store</NavigationMenuLink>
          <NavigationMenuLink href="/currency">USD</NavigationMenuLink>
          <NavigationMenuLink href="/language">ENG</NavigationMenuLink>
        </NavigationMenuList>
        <p>(555) 555-1234</p>
      </NavigationMenuMobile>
    </NavigationMenu>
  ),
};

export const NavigationAlignmentLeft: Story = {
  render: () => (
    <NavigationMenu>
      <div className="flex min-h-[92px] w-full items-center justify-between gap-5">
        <a className="text-h4 font-black" href="/home">
          Catalyst Store
        </a>
        <NavigationMenuList className="hidden flex-auto justify-start sm:flex">
          <NavigationMenuItem>
            <NavigationMenuLink href="/men">Men</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/woman">Woman</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/accessories">Accessories</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuList className="hidden sm:flex">
          <NavigationMenuItem>
            <NavigationMenuLink href="/search">
              <Search aria-label="Search" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/profile">
              <User aria-label="Profile" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/cart">
              <ShoppingCart aria-label="Shopping cart" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <div className="flex items-center gap-5 sm:hidden">
          <NavigationMenuLink href="/cart">
            <ShoppingCart aria-label="Shopping cart" />
          </NavigationMenuLink>
          <NavigationMenuMobileTrigger>
            <Menu />
          </NavigationMenuMobileTrigger>
        </div>
      </div>
      <NavigationMenuMobile>
        <NavigationMenuList className="block pb-6">
          <NavigationMenuItem>
            <NavigationMenuLink href="/men">Men</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/woman">Woman</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/accessories">Accessories</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuList className="block border-t border-gray-200 py-6">
          <NavigationMenuItem>
            <NavigationMenuLink href="/search">
              Search <Search aria-hidden="true" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/profile">
              Your account <User aria-hidden="true" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenuMobile>
    </NavigationMenu>
  ),
};

export const NavigationAlignmentRight: Story = {
  render: () => (
    <NavigationMenu>
      <div className="flex min-h-[92px] w-full items-center justify-between gap-5">
        <a className="text-h4 font-black" href="/home">
          Catalyst Store
        </a>
        <NavigationMenuList className="hidden flex-auto justify-end sm:flex">
          <NavigationMenuItem>
            <NavigationMenuLink href="/men">Men</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/woman">Woman</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/accessories">Accessories</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuList className="hidden sm:flex">
          <NavigationMenuItem>
            <NavigationMenuLink href="/search">
              <Search aria-label="Search" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/profile">
              <User aria-label="Profile" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/cart">
              <ShoppingCart aria-label="Shopping cart" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <div className="flex items-center gap-5 sm:hidden">
          <NavigationMenuLink href="/cart">
            <ShoppingCart aria-label="Shopping cart" />
          </NavigationMenuLink>
          <NavigationMenuMobileTrigger>
            <Menu />
          </NavigationMenuMobileTrigger>
        </div>
      </div>
      <NavigationMenuMobile>
        <NavigationMenuList className="block pb-6">
          <NavigationMenuItem>
            <NavigationMenuLink href="/men">Men</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/woman">Woman</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/accessories">Accessories</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuList className="block border-t border-gray-200 py-6">
          <NavigationMenuItem>
            <NavigationMenuLink href="/search">
              Search <Search aria-hidden="true" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/profile">
              Your account <User aria-hidden="true" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenuMobile>
    </NavigationMenu>
  ),
};

export const LogoCentered: Story = {
  render: () => (
    <NavigationMenu>
      <div className="flex min-h-[92px] w-full items-center justify-between gap-5">
        <NavigationMenuList className="hidden flex-1 sm:flex">
          <NavigationMenuItem>
            <NavigationMenuLink href="/men">Men</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/woman">Woman</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/accessories">Accessories</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <a className="text-h4 font-black" href="/home">
          Catalyst Store
        </a>
        <NavigationMenuList className="hidden flex-1 justify-end sm:flex">
          <NavigationMenuItem>
            <NavigationMenuLink href="/search">
              <Search aria-label="Search" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/profile">
              <User aria-label="Profile" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/cart">
              <ShoppingCart aria-label="Shopping cart" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <div className="flex items-center gap-5 sm:hidden">
          <NavigationMenuLink href="/cart">
            <ShoppingCart aria-label="Shopping cart" />
          </NavigationMenuLink>
          <NavigationMenuMobileTrigger>
            <Menu />
          </NavigationMenuMobileTrigger>
        </div>
      </div>
      <NavigationMenuMobile>
        <NavigationMenuList className="block pb-6">
          <NavigationMenuItem>
            <NavigationMenuLink href="/men">Men</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/woman">Woman</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/accessories">Accessories</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuList className="block border-t border-gray-200 py-6">
          <NavigationMenuItem>
            <NavigationMenuLink href="/search">
              Search <Search aria-hidden="true" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/profile">
              Your account <User aria-hidden="true" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenuMobile>
    </NavigationMenu>
  ),
};

export const BottomNavigationLeft: Story = {
  render: () => {
    return (
      <NavigationMenu>
        <div className="flex min-h-[92px] w-full items-center justify-between gap-5">
          <a className="text-h4 font-black" href="/home">
            Catalyst Store
          </a>
          <NavigationMenuList className="hidden sm:flex">
            <NavigationMenuItem>
              <NavigationMenuLink href="/search">
                <Search aria-label="Search" />
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/profile">
                <User aria-label="Profile" />
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/cart">
                <ShoppingCart aria-label="Shopping cart" />
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
          <div className="flex items-center gap-5 sm:hidden">
            <NavigationMenuLink href="/cart">
              <ShoppingCart aria-label="Shopping cart" />
            </NavigationMenuLink>
            <NavigationMenuMobileTrigger>
              <Menu />
            </NavigationMenuMobileTrigger>
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-5 border-t border-gray-200 py-6">
          <NavigationMenuList className="hidden sm:flex">
            <NavigationMenuItem>
              <NavigationMenuLink href="/men">Men</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/woman">Woman</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/accessories">Accessories</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </div>
        <NavigationMenuMobile>
          <NavigationMenuList className="block pb-6">
            <NavigationMenuItem>
              <NavigationMenuLink href="/men">Men</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/woman">Woman</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/accessories">Accessories</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuList className="block border-t border-gray-200 py-6">
            <NavigationMenuItem>
              <NavigationMenuLink href="/search">
                Search <Search aria-hidden="true" />
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/profile">
                Your account <User aria-hidden="true" />
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenuMobile>
      </NavigationMenu>
    );
  },
};

export const BottomNavigationCenter: Story = {
  render: () => (
    <NavigationMenu>
      <div className="flex min-h-[92px] w-full items-center justify-between gap-5">
        <a className="text-h4 font-black" href="/home">
          Catalyst Store
        </a>
        <NavigationMenuList className="hidden sm:flex">
          <NavigationMenuItem>
            <NavigationMenuLink href="/search">
              <Search aria-label="Search" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/profile">
              <User aria-label="Profile" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/cart">
              <ShoppingCart aria-label="Shopping cart" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <div className="flex items-center gap-5 sm:hidden">
          <NavigationMenuLink href="/cart">
            <ShoppingCart aria-label="Shopping cart" />
          </NavigationMenuLink>
          <NavigationMenuMobileTrigger>
            <Menu />
          </NavigationMenuMobileTrigger>
        </div>
      </div>
      <div className="hidden w-full items-center justify-center gap-5 border-t border-gray-200 py-6 sm:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/men">Men</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/woman">Woman</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/accessories">Accessories</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </div>
      <NavigationMenuMobile>
        <NavigationMenuList className="block pb-6">
          <NavigationMenuItem>
            <NavigationMenuLink href="/men">Men</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/woman">Woman</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/accessories">Accessories</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuList className="block border-t border-gray-200 py-6">
          <NavigationMenuItem>
            <NavigationMenuLink href="/search">
              Search <Search aria-hidden="true" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/profile">
              Your account <User aria-hidden="true" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenuMobile>
    </NavigationMenu>
  ),
};

export const BottomNavigationRight: Story = {
  render: () => (
    <NavigationMenu>
      <div className="flex min-h-[92px] w-full items-center justify-between gap-5 sm:flex">
        <a className="text-h4 font-black" href="/home">
          Catalyst Store
        </a>
        <NavigationMenuList className="hidden sm:flex">
          <NavigationMenuItem>
            <NavigationMenuLink href="/search">
              <Search aria-label="Search" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/profile">
              <User aria-label="Profile" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/cart">
              <ShoppingCart aria-label="Shopping cart" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <div className="flex items-center gap-5 sm:hidden">
          <NavigationMenuLink href="/cart">
            <ShoppingCart aria-label="Shopping cart" />
          </NavigationMenuLink>
          <NavigationMenuMobileTrigger>
            <Menu />
          </NavigationMenuMobileTrigger>
        </div>
      </div>
      <div className="hidden w-full items-center justify-end gap-5 border-t border-gray-200 py-6 sm:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/men">Men</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/woman">Woman</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/accessories">Accessories</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </div>
      <NavigationMenuMobile>
        <NavigationMenuList className="block pb-6">
          <NavigationMenuItem>
            <NavigationMenuLink href="/men">Men</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/woman">Woman</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/accessories">Accessories</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuList className="block border-t border-gray-200 py-6">
          <NavigationMenuItem>
            <NavigationMenuLink href="/search">
              Search <Search aria-hidden="true" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/profile">
              Your account <User aria-hidden="true" />
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenuMobile>
    </NavigationMenu>
  ),
};

// const CustomLink = ({ children, ...props }: ComponentPropsWithoutRef<'a'>) => {
//   return <a {...props}>{children}</a>;
// };

// export const AsChild: Story = {
//   render: () => (
//     <Header>
//       <HeaderSection>
//         <a className="text-h4 font-black" href="/home">
//           Catalyst Store
//         </a>
//       </HeaderSection>
//       <NavigationMenu>
//         <NavigationMenuList>
//           <NavigationMenuLink asChild>
//             <CustomLink href="/men">Men</CustomLink>
//           </NavigationMenuLink>
//           <NavigationMenuLink asChild>
//             <CustomLink href="/woman">Woman</CustomLink>
//           </NavigationMenuLink>
//           <NavigationMenuLink asChild>
//             <CustomLink href="/accessories">Accessories</CustomLink>
//           </NavigationMenuLink>
//         </NavigationMenuList>
//       </NavigationMenu>
//       <HeaderSection>
//         <a aria-label="Search" href="/search">
//           <Search aria-hidden="true" />
//         </a>
//         <a aria-label="Profile" href="/profile">
//           <User aria-hidden="true" />
//         </a>
//         <a aria-label="Cart" href="/cart">
//           <ShoppingCart aria-hidden="true" />
//         </a>
//       </HeaderSection>
//     </Header>
//   ),
// };
