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
  render: () => (
    <Header>
      <HeaderLogo>
        <a href="/home">Catalyst Store</a>
      </HeaderLogo>
      <HeaderNav>
        <HeaderNavList>
          <HeaderNavLink href="#">Men</HeaderNavLink>
          <HeaderNavLink href="#">Woman</HeaderNavLink>
          <HeaderNavLink href="#">Accessories</HeaderNavLink>
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
    </Header>
  ),
};

export const NavigationAlignmentLeft: Story = {
  render: () => (
    <Header>
      <HeaderLogo className="text-h4">
        <a href="/home">Catalyst Store</a>
      </HeaderLogo>
      <HeaderNav className="flex-auto justify-start">
        <HeaderNavList>
          <HeaderNavLink href="#">Men</HeaderNavLink>
          <HeaderNavLink href="#">Woman</HeaderNavLink>
          <HeaderNavLink href="#">Accessories</HeaderNavLink>
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
    </Header>
  ),
};

export const NavigationAlignmentRight: Story = {
  render: () => (
    <Header>
      <HeaderLogo>
        <a href="/home">Catalyst Store</a>
      </HeaderLogo>
      <HeaderNav className="flex-auto justify-end">
        <HeaderNavList className="justify">
          <HeaderNavLink href="#">Men</HeaderNavLink>
          <HeaderNavLink href="#">Woman</HeaderNavLink>
          <HeaderNavLink href="#">Accessories</HeaderNavLink>
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
    </Header>
  ),
};

export const LogoCentered: Story = {
  render: () => (
    <Header>
      <HeaderNav className="flex-1">
        <HeaderNavList>
          <HeaderNavLink href="#">Men</HeaderNavLink>
          <HeaderNavLink href="#">Woman</HeaderNavLink>
          <HeaderNavLink href="#">Accessories</HeaderNavLink>
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
    </Header>
  ),
};

export const BottomNavigationLeft: Story = {
  render: () => (
    <Header className="flex-col">
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
      <HeaderNav className="w-full border-t border-gray-200 pt-2">
        <HeaderNavList>
          <HeaderNavLink href="#">Men</HeaderNavLink>
          <HeaderNavLink href="#">Woman</HeaderNavLink>
          <HeaderNavLink href="#">Accessories</HeaderNavLink>
        </HeaderNavList>
      </HeaderNav>
    </Header>
  ),
};

export const BottomNavigationCenter: Story = {
  render: () => (
    <Header className="flex-col">
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
      <HeaderNav className="flex w-full justify-center border-t border-gray-200 pt-2">
        <HeaderNavList>
          <HeaderNavLink href="#">Men</HeaderNavLink>
          <HeaderNavLink href="#">Woman</HeaderNavLink>
          <HeaderNavLink href="#">Accessories</HeaderNavLink>
        </HeaderNavList>
      </HeaderNav>
    </Header>
  ),
};

export const BottomNavigationRight: Story = {
  render: () => (
    <Header className="flex-col">
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
      <HeaderNav className="flex w-full justify-end border-t border-gray-200 pt-2">
        <HeaderNavList>
          <HeaderNavLink href="#">Men</HeaderNavLink>
          <HeaderNavLink href="#">Woman</HeaderNavLink>
          <HeaderNavLink href="#">Accessories</HeaderNavLink>
        </HeaderNavList>
      </HeaderNav>
    </Header>
  ),
};

const CustomLink = ({ children, ...props }: ComponentPropsWithoutRef<'a'>) => {
  return <a {...props}>{children}</a>;
};

export const AsChild: Story = {
  render: () => (
    <Header>
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
            <CustomLink href="#">Accessories</CustomLink>
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
    </Header>
  ),
};
