import {
  Header,
  HeaderLogo,
  HeaderNav,
  HeaderNavLink,
  HeaderNavList,
} from '@bigcommerce/reactant/Header';
import type { Meta, StoryObj } from '@storybook/react';
import { Search, ShoppingCart, User } from 'lucide-react';
import { ComponentPropsWithoutRef } from 'react';

const meta: Meta<typeof Header> = {
  component: Header,
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

type Story = StoryObj<typeof Header>;

export const BasicExample: Story = {
  args: {
    children: (
      <>
        <HeaderLogo>
          <a href="/home">Catalyst Store</a>
        </HeaderLogo>
        <HeaderNav>
          <HeaderNavList>
            <HeaderNavLink href="#">Men</HeaderNavLink>
            <HeaderNavLink href="#">Woman</HeaderNavLink>
            <HeaderNavLink href="#">Accesories</HeaderNavLink>
          </HeaderNavList>
        </HeaderNav>
        <div className="flex items-center gap-4">
          <a aria-label="Search" href="/search">
            <Search aria-hidden="true" />
          </a>
          <a aria-label="Profile" href="/profile">
            <User aria-hidden="true" />
          </a>
          <a aria-label="Cart" href="/cart">
            <ShoppingCart aria-hidden="true" />
          </a>
        </div>
      </>
    ),
  },
};

export const NavigationAlignmentLeft: Story = {
  args: {
    children: (
      <>
        <HeaderLogo className="text-h4">
          <a href="/home">Catalyst Store</a>
        </HeaderLogo>
        <HeaderNav className="flex-auto justify-start">
          <HeaderNavList>
            <HeaderNavLink href="#">Men</HeaderNavLink>
            <HeaderNavLink href="#">Woman</HeaderNavLink>
            <HeaderNavLink href="#">Accesories</HeaderNavLink>
          </HeaderNavList>
        </HeaderNav>
        <div className="flex items-center gap-4">
          <a aria-label="Search" href="/search">
            <Search aria-hidden="true" />
          </a>
          <a aria-label="Profile" href="/profile">
            <User aria-hidden="true" />
          </a>
          <a aria-label="Cart" href="/cart">
            <ShoppingCart aria-hidden="true" />
          </a>
        </div>
      </>
    ),
  },
};

export const NavigationAlignmentRight: Story = {
  args: {
    children: (
      <>
        <HeaderLogo>
          <a href="/home">Catalyst Store</a>
        </HeaderLogo>
        <HeaderNav className="flex-auto justify-end">
          <HeaderNavList className="justify">
            <HeaderNavLink href="#">Men</HeaderNavLink>
            <HeaderNavLink href="#">Woman</HeaderNavLink>
            <HeaderNavLink href="#">Accesories</HeaderNavLink>
          </HeaderNavList>
        </HeaderNav>
        <div className="flex items-center gap-4">
          <a aria-label="Search" href="/search">
            <Search aria-hidden="true" />
          </a>
          <a aria-label="Profile" href="/profile">
            <User aria-hidden="true" />
          </a>
          <a aria-label="Cart" href="/cart">
            <ShoppingCart aria-hidden="true" />
          </a>
        </div>
      </>
    ),
  },
};

export const LogoCentered: Story = {
  args: {
    children: (
      <>
        <HeaderNav className="flex-1">
          <HeaderNavList>
            <HeaderNavLink href="#">Men</HeaderNavLink>
            <HeaderNavLink href="#">Woman</HeaderNavLink>
            <HeaderNavLink href="#">Accesories</HeaderNavLink>
          </HeaderNavList>
        </HeaderNav>
        <HeaderLogo>
          <a href="/home">Catalyst Store</a>
        </HeaderLogo>
        <div className="flex flex-1 items-center justify-end gap-4">
          <a aria-label="Search" href="/search">
            <Search aria-hidden="true" />
          </a>
          <a aria-label="Profile" href="/profile">
            <User aria-hidden="true" />
          </a>
          <a aria-label="Cart" href="/cart">
            <ShoppingCart aria-hidden="true" />
          </a>
        </div>
      </>
    ),
  },
};

export const BottomNavigationLeft: Story = {
  args: {
    className: 'flex-col',
    children: (
      <>
        <div className="flex w-full flex-row justify-between">
          <HeaderLogo>
            <a href="/home">Catalyst Store</a>
          </HeaderLogo>
          <div className="flex items-center gap-4">
            <a aria-label="Search" href="/search">
              <Search aria-hidden="true" />
            </a>
            <a aria-label="Profile" href="/profile">
              <User aria-hidden="true" />
            </a>
            <a aria-label="Cart" href="/cart">
              <ShoppingCart aria-hidden="true" />
            </a>
          </div>
        </div>
        <HeaderNav className="w-full border-t border-gray-200">
          <HeaderNavList>
            <HeaderNavLink href="#">Men</HeaderNavLink>
            <HeaderNavLink href="#">Woman</HeaderNavLink>
            <HeaderNavLink href="#">Accesories</HeaderNavLink>
          </HeaderNavList>
        </HeaderNav>
      </>
    ),
  },
};

export const BottomNavigationCenter: Story = {
  args: {
    className: 'flex-col',
    children: (
      <>
        <div className="flex w-full flex-row justify-between">
          <HeaderLogo>
            <a href="/home">Catalyst Store</a>
          </HeaderLogo>
          <div className="flex items-center gap-4">
            <a aria-label="Search" href="/search">
              <Search aria-hidden="true" />
            </a>
            <a aria-label="Profile" href="/profile">
              <User aria-hidden="true" />
            </a>
            <a aria-label="Cart" href="/cart">
              <ShoppingCart aria-hidden="true" />
            </a>
          </div>
        </div>
        <HeaderNav className="flex w-full justify-center border-t border-gray-200">
          <HeaderNavList>
            <HeaderNavLink href="#">Men</HeaderNavLink>
            <HeaderNavLink href="#">Woman</HeaderNavLink>
            <HeaderNavLink href="#">Accesories</HeaderNavLink>
          </HeaderNavList>
        </HeaderNav>
      </>
    ),
  },
};

export const BottomNavigationRight: Story = {
  args: {
    className: 'flex-col',
    children: (
      <>
        <div className="flex w-full flex-row justify-between">
          <HeaderLogo>
            <a href="/home">Catalyst Store</a>
          </HeaderLogo>
          <div className="flex items-center gap-4">
            <a aria-label="Search" href="/search">
              <Search aria-hidden="true" />
            </a>
            <a aria-label="Profile" href="/profile">
              <User aria-hidden="true" />
            </a>
            <a aria-label="Cart" href="/cart">
              <ShoppingCart aria-hidden="true" />
            </a>
          </div>
        </div>
        <HeaderNav className="flex w-full justify-end border-t border-gray-200">
          <HeaderNavList>
            <HeaderNavLink href="#">Men</HeaderNavLink>
            <HeaderNavLink href="#">Woman</HeaderNavLink>
            <HeaderNavLink href="#">Accesories</HeaderNavLink>
          </HeaderNavList>
        </HeaderNav>
      </>
    ),
  },
};

const CustomLink = ({ children, ...props }: ComponentPropsWithoutRef<'a'>) => {
  return <a {...props}>{children}</a>;
};

export const AsChild: Story = {
  args: {
    children: (
      <>
        <HeaderLogo>
          <a href="/home">Catalyst Store</a>
        </HeaderLogo>
        <HeaderNav>
          <HeaderNavList>
            <HeaderNavLink asChild>
              <CustomLink href="#">Men</CustomLink>
            </HeaderNavLink>
            <HeaderNavLink asChild>
              <CustomLink href="#">Woman</CustomLink>
            </HeaderNavLink>
            <HeaderNavLink asChild>
              <CustomLink href="#">Accesories</CustomLink>
            </HeaderNavLink>
          </HeaderNavList>
        </HeaderNav>
        <div className="flex items-center  gap-4">
          <a aria-label="Search" href="/search">
            <Search aria-hidden="true" />
          </a>
          <a aria-label="Profile" href="/profile">
            <User aria-hidden="true" />
          </a>
          <a aria-label="Cart" href="/cart">
            <ShoppingCart aria-hidden="true" />
          </a>
        </div>
      </>
    ),
  },
};
