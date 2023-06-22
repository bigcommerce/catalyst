import {
  Header,
  HeaderNav,
  HeaderNavLink,
  HeaderNavList,
  HeaderSection,
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
      <HeaderSection>
        <a className="text-h4 font-black" href="/home">
          Catalyst Store
        </a>
      </HeaderSection>
      <HeaderNav>
        <HeaderNavList>
          <HeaderNavLink href="/men">Men</HeaderNavLink>
          <HeaderNavLink href="/woman">Woman</HeaderNavLink>
          <HeaderNavLink href="/accessories">Accessories</HeaderNavLink>
        </HeaderNavList>
      </HeaderNav>
      <HeaderSection>
        <a aria-label="Search" href="/search">
          <Search aria-hidden="true" />
        </a>
        <a aria-label="Profile" href="/profile">
          <User aria-hidden="true" />
        </a>
        <a aria-label="Cart" href="/cart">
          <ShoppingCart aria-hidden="true" />
        </a>
      </HeaderSection>
    </Header>
  ),
};

export const NavigationAlignmentLeft: Story = {
  render: () => (
    <Header>
      <HeaderSection>
        <a className="text-h4 font-black" href="/home">
          Catalyst Store
        </a>
      </HeaderSection>
      <HeaderNav className="flex-auto justify-start">
        <HeaderNavList>
          <HeaderNavLink href="/men">Men</HeaderNavLink>
          <HeaderNavLink href="/woman">Woman</HeaderNavLink>
          <HeaderNavLink href="/accessories">Accessories</HeaderNavLink>
        </HeaderNavList>
      </HeaderNav>
      <HeaderSection>
        <a aria-label="Search" href="/search">
          <Search aria-hidden="true" />
        </a>
        <a aria-label="Profile" href="/profile">
          <User aria-hidden="true" />
        </a>
        <a aria-label="Cart" href="/cart">
          <ShoppingCart aria-hidden="true" />
        </a>
      </HeaderSection>
    </Header>
  ),
};

export const NavigationAlignmentRight: Story = {
  render: () => (
    <Header>
      <HeaderSection>
        <a className="text-h4 font-black" href="/home">
          Catalyst Store
        </a>
      </HeaderSection>
      <HeaderNav className="flex-auto justify-end">
        <HeaderNavList className="justify">
          <HeaderNavLink href="/men">Men</HeaderNavLink>
          <HeaderNavLink href="/woman">Woman</HeaderNavLink>
          <HeaderNavLink href="/accessories">Accessories</HeaderNavLink>
        </HeaderNavList>
      </HeaderNav>
      <HeaderSection>
        <a aria-label="Search" href="/search">
          <Search aria-hidden="true" />
        </a>
        <a aria-label="Profile" href="/profile">
          <User aria-hidden="true" />
        </a>
        <a aria-label="Cart" href="/cart">
          <ShoppingCart aria-hidden="true" />
        </a>
      </HeaderSection>
    </Header>
  ),
};

export const LogoCentered: Story = {
  render: () => (
    <Header>
      <HeaderNav className="flex-1">
        <HeaderNavList>
          <HeaderNavLink href="/men">Men</HeaderNavLink>
          <HeaderNavLink href="/woman">Woman</HeaderNavLink>
          <HeaderNavLink href="/accessories">Accessories</HeaderNavLink>
        </HeaderNavList>
      </HeaderNav>
      <HeaderSection>
        <a className="text-h4 font-black" href="/home">
          Catalyst Store
        </a>
      </HeaderSection>
      <HeaderSection className="flex-1 justify-end">
        <a aria-label="Search" href="/search">
          <Search aria-hidden="true" />
        </a>
        <a aria-label="Profile" href="/profile">
          <User aria-hidden="true" />
        </a>
        <a aria-label="Cart" href="/cart">
          <ShoppingCart aria-hidden="true" />
        </a>
      </HeaderSection>
    </Header>
  ),
};

export const BottomNavigationLeft: Story = {
  render: () => (
    <Header className="flex-col">
      <div className="flex w-full flex-row justify-between">
        <HeaderSection>
          <a className="text-h4 font-black" href="/home">
            Catalyst Store
          </a>
        </HeaderSection>
        <HeaderSection>
          <a aria-label="Search" href="/search">
            <Search aria-hidden="true" />
          </a>
          <a aria-label="Profile" href="/profile">
            <User aria-hidden="true" />
          </a>
          <a aria-label="Cart" href="/cart">
            <ShoppingCart aria-hidden="true" />
          </a>
        </HeaderSection>
      </div>
      <HeaderNav className="w-full border-t border-gray-200 pt-2">
        <HeaderNavList>
          <HeaderNavLink href="/men">Men</HeaderNavLink>
          <HeaderNavLink href="/woman">Woman</HeaderNavLink>
          <HeaderNavLink href="/accessories">Accessories</HeaderNavLink>
        </HeaderNavList>
      </HeaderNav>
    </Header>
  ),
};

export const BottomNavigationCenter: Story = {
  render: () => (
    <Header className="flex-col">
      <div className="flex w-full flex-row justify-between">
        <HeaderSection>
          <a className="text-h4 font-black" href="/home">
            Catalyst Store
          </a>
        </HeaderSection>
        <HeaderSection>
          <a aria-label="Search" href="/search">
            <Search aria-hidden="true" />
          </a>
          <a aria-label="Profile" href="/profile">
            <User aria-hidden="true" />
          </a>
          <a aria-label="Cart" href="/cart">
            <ShoppingCart aria-hidden="true" />
          </a>
        </HeaderSection>
      </div>
      <HeaderNav className="flex w-full justify-center border-t border-gray-200 pt-2">
        <HeaderNavList>
          <HeaderNavLink href="/men">Men</HeaderNavLink>
          <HeaderNavLink href="/woman">Woman</HeaderNavLink>
          <HeaderNavLink href="/accessories">Accessories</HeaderNavLink>
        </HeaderNavList>
      </HeaderNav>
    </Header>
  ),
};

export const BottomNavigationRight: Story = {
  render: () => (
    <Header className="flex-col">
      <div className="flex w-full flex-row justify-between">
        <HeaderSection className="text-h4 font-black">
          <a href="/home">Catalyst Store</a>
        </HeaderSection>
        <HeaderSection>
          <a aria-label="Search" href="/search">
            <Search aria-hidden="true" />
          </a>
          <a aria-label="Profile" href="/profile">
            <User aria-hidden="true" />
          </a>
          <a aria-label="Cart" href="/cart">
            <ShoppingCart aria-hidden="true" />
          </a>
        </HeaderSection>
      </div>
      <HeaderNav className="flex w-full justify-end border-t border-gray-200 pt-2">
        <HeaderNavList>
          <HeaderNavLink href="/men">Men</HeaderNavLink>
          <HeaderNavLink href="/woman">Woman</HeaderNavLink>
          <HeaderNavLink href="/accessories">Accessories</HeaderNavLink>
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
      <HeaderSection className="text-h4 font-black">
        <a href="/home">Catalyst Store</a>
      </HeaderSection>
      <HeaderNav>
        <HeaderNavList>
          <HeaderNavLink asChild>
            <CustomLink href="/men">Men</CustomLink>
          </HeaderNavLink>
          <HeaderNavLink asChild>
            <CustomLink href="/woman">Woman</CustomLink>
          </HeaderNavLink>
          <HeaderNavLink asChild>
            <CustomLink href="/accessories">Accessories</CustomLink>
          </HeaderNavLink>
        </HeaderNavList>
      </HeaderNav>
      <HeaderSection>
        <a aria-label="Search" href="/search">
          <Search aria-hidden="true" />
        </a>
        <a aria-label="Profile" href="/profile">
          <User aria-hidden="true" />
        </a>
        <a aria-label="Cart" href="/cart">
          <ShoppingCart aria-hidden="true" />
        </a>
      </HeaderSection>
    </Header>
  ),
};
