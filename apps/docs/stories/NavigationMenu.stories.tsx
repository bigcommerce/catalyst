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
      <a className="text-h4 font-black" href="/home">
        Catalyst Store
      </a>
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
      <NavigationMenuList>
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
      <NavigationMenuMobile>
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
        <NavigationMenuList>
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
        <NavigationMenuList>
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
      <a className="text-h4 font-black" href="/home">
        Catalyst Store
      </a>
      <NavigationMenuList className="flex-auto justify-start">
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
      <NavigationMenuMobile>
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
        <NavigationMenuList>
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
      <a className="text-h4 font-black" href="/home">
        Catalyst Store
      </a>
      <NavigationMenuList className="flex-auto justify-end">
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
      <NavigationMenuList>
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
      <NavigationMenuMobile>
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
        <NavigationMenuList>
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
      <NavigationMenuList className="flex-1">
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
      <NavigationMenuList className="flex-1 justify-end">
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
      <NavigationMenuMobile>
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
        <NavigationMenuList>
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
      <NavigationMenu className="!flex-col justify-center">
        <div className="flex w-full flex-row items-center justify-between">
          <a className="text-h4 font-black" href="/home">
            Catalyst Store
          </a>
          <NavigationMenuList>
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
        <div className="hidden w-full items-center justify-between gap-5 border-t border-gray-200 pt-5 sm:flex">
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
          <NavigationMenuList>
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
    <NavigationMenu className="!flex-col justify-center">
      <div className="flex w-full flex-row justify-between">
        <a className="text-h4 font-black" href="/home">
          Catalyst Store
        </a>
        <NavigationMenuList>
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
      <div className="hidden w-full items-center justify-center gap-5 border-t border-gray-200 pt-5 sm:flex">
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
        <NavigationMenuList>
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
    <NavigationMenu className="!flex-col justify-center">
      <div className="flex w-full flex-row justify-between">
        <a className="text-h4 font-black" href="/home">
          Catalyst Store
        </a>
        <NavigationMenuList>
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
      <div className="hidden w-full items-center justify-end gap-5 border-t border-gray-200 pt-6 sm:flex">
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
        <NavigationMenuList>
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
