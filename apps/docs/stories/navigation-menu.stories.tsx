import { Badge } from '@bigcommerce/components/badge';
import { cn } from '@bigcommerce/components/cn';
import {
  NavigationMenu,
  NavigationMenuCollapsed,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuToggle,
  NavigationMenuTrigger,
} from '@bigcommerce/components/navigation-menu';
import type { Meta, StoryObj } from '@storybook/react';
import { ChevronDown, MenuSquare, Search, ShoppingCart, User, XSquare } from 'lucide-react';

const meta = {
  component: NavigationMenu,
  tags: ['autodocs'],
  argTypes: {
    children: {
      table: {
        disable: true,
      },
    },
  },
} satisfies Meta<typeof NavigationMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

const mockedData = [
  {
    entityId: 1,
    name: 'Men',
    path: '#',
    children: [
      {
        entityId: 11,
        name: 'Featured',
        path: '#',
        children: [
          { entityId: 111, name: 'New releases', path: '#', children: [] },
          { entityId: 112, name: 'Best sellers', path: '#', children: [] },
          { entityId: 113, name: 'Back to school', path: '#', children: [] },
          { entityId: 114, name: 'Sale', path: '#', children: [] },
        ],
      },
      {
        entityId: 12,
        name: 'Clothing',
        path: '#',
        children: [
          { entityId: 121, name: 'Activewear', path: '#', children: [] },
          { entityId: 122, name: 'Coats & jackets', path: '#', children: [] },
          { entityId: 124, name: 'Tops', path: '#', children: [] },
          { entityId: 125, name: 'Pants', path: '#', children: [] },
          { entityId: 126, name: 'Shorts', path: '#', children: [] },
          { entityId: 128, name: 'Loungewear', path: '#', children: [] },
          { entityId: 129, name: 'Sweatshirts', path: '#', children: [] },
          { entityId: 130, name: 'Swimwear', path: '#', children: [] },
        ],
      },
      {
        entityId: 13,
        name: 'Shoes',
        path: '#',
        children: [
          { entityId: 131, name: 'Boots', path: '#', children: [] },
          { entityId: 132, name: 'Comfort', path: '#', children: [] },
          { entityId: 133, name: 'Dress shoes', path: '#', children: [] },
          { entityId: 136, name: 'Sandals', path: '#', children: [] },
          { entityId: 137, name: 'Athletic', path: '#', children: [] },
        ],
      },
      {
        entityId: 14,
        name: 'Shop collections',
        path: '#',
        children: [
          { entityId: 141, name: 'Brand name', path: '#', children: [] },
          { entityId: 142, name: 'Collection name', path: '#', children: [] },
        ],
      },
      {
        entityId: 15,
        name: 'Accessories',
        path: '#',
        children: [
          { entityId: 151, name: 'Hats', path: '#', children: [] },
          { entityId: 152, name: 'Glasses', path: '#', children: [] },
          { entityId: 153, name: 'Belts', path: '#', children: [] },
          { entityId: 154, name: 'Jewelry', path: '#', children: [] },
          { entityId: 155, name: 'Handbags', path: '#', children: [] },
        ],
      },
      {
        entityId: 16,
        name: 'Swimwear',
        path: '#',
        children: [
          { entityId: 161, name: 'Trunks', path: '#', children: [] },
          { entityId: 162, name: 'Vests', path: '#', children: [] },
        ],
      },
    ],
  },
  {
    entityId: 2,
    name: 'Women',
    path: '#',
    children: [
      {
        entityId: 21,
        name: 'Featured',
        path: '#',
        children: [
          { entityId: 211, name: 'New releases', path: '#', children: [] },
          { entityId: 212, name: 'Best sellers', path: '#', children: [] },
          { entityId: 213, name: 'Back to school', path: '#', children: [] },
          { entityId: 214, name: 'Sale', path: '#', children: [] },
        ],
      },
      {
        entityId: 22,
        name: 'Clothing',
        path: '#',
        children: [
          { entityId: 221, name: 'Activewear', path: '#', children: [] },
          { entityId: 222, name: 'Coats & jackets', path: '#', children: [] },
          { entityId: 223, name: 'Dresses', path: '#', children: [] },
          { entityId: 224, name: 'Tops', path: '#', children: [] },
          { entityId: 225, name: 'Pants', path: '#', children: [] },
          { entityId: 226, name: 'Shorts', path: '#', children: [] },
          { entityId: 227, name: 'Skirts', path: '#', children: [] },
          { entityId: 228, name: 'Loungewear', path: '#', children: [] },
          { entityId: 229, name: 'Sweatshirts', path: '#', children: [] },
          { entityId: 230, name: 'Swimwear', path: '#', children: [] },
        ],
      },
      {
        entityId: 23,
        name: 'Shoes',
        path: '#',
        children: [
          { entityId: 231, name: 'Boots', path: '#', children: [] },
          { entityId: 232, name: 'Comfort', path: '#', children: [] },
          { entityId: 233, name: 'Dress shoes', path: '#', children: [] },
          { entityId: 234, name: 'Flats', path: '#', children: [] },
          { entityId: 235, name: 'Heels', path: '#', children: [] },
          { entityId: 236, name: 'Sandals', path: '#', children: [] },
          { entityId: 237, name: 'Athletic', path: '#', children: [] },
        ],
      },
      {
        entityId: 24,
        name: 'Shop collections',
        path: '#',
        children: [
          { entityId: 241, name: 'Brand name', path: '#', children: [] },
          { entityId: 242, name: 'Collection name', path: '#', children: [] },
        ],
      },
      {
        entityId: 25,
        name: 'Accessories',
        path: '#',
        children: [
          { entityId: 251, name: 'Hats', path: '#', children: [] },
          { entityId: 252, name: 'Glasses', path: '#', children: [] },
          { entityId: 253, name: 'Belts', path: '#', children: [] },
          { entityId: 254, name: 'Jewelry', path: '#', children: [] },
          { entityId: 255, name: 'Handbags', path: '#', children: [] },
        ],
      },
      {
        entityId: 26,
        name: 'Swimwear',
        path: '#',
        children: [
          { entityId: 261, name: 'One piece', path: '#', children: [] },
          { entityId: 262, name: 'Bikini', path: '#', children: [] },
        ],
      },
    ],
  },
  { entityId: 3, name: 'Accessories', path: '#', children: [] },
];

const mockLinks = [
  { href: '#', label: 'Search', icon: <Search aria-label="Search" /> },
  { href: '#', label: 'Profile', icon: <User aria-label="Profile" /> },
  { href: '#', label: 'Shopping cart', icon: <ShoppingCart aria-label="Shopping cart" /> },
];

export const BasicExample: Story = {
  render: () => (
    <NavigationMenu className="gap-6 lg:gap-8">
      <NavigationMenuLink className="px-0 text-2xl font-black font-bold lg:text-3xl" href="/home">
        Catalyst Store
      </NavigationMenuLink>
      <NavigationMenuList className="hidden md:flex lg:gap-4">
        {mockedData.map((rootCategory) => (
          <NavigationMenuItem key={rootCategory.entityId}>
            {rootCategory.children.length > 0 ? (
              <>
                <NavigationMenuTrigger>
                  {rootCategory.name}{' '}
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      'transition duration-200 group-data-[state=open]/button:-rotate-180',
                    )}
                  />
                </NavigationMenuTrigger>
                <NavigationMenuContent className="grid auto-cols-auto grid-flow-col">
                  {rootCategory.children.map((childCategory1) => (
                    <ul key={childCategory1.entityId}>
                      <NavigationMenuItem>
                        <NavigationMenuLink href="#">{childCategory1.name}</NavigationMenuLink>
                      </NavigationMenuItem>
                      {childCategory1.children.map((childCategory2) => (
                        <NavigationMenuItem key={childCategory2.entityId}>
                          <NavigationMenuLink className="font-normal" href="#">
                            {childCategory2.name}
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      ))}
                    </ul>
                  ))}
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink href="#">{rootCategory.name}</NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
      <NavigationMenuList className="hidden gap-2 md:flex">
        {mockLinks.map((link, index) => (
          <NavigationMenuItem key={index}>
            <NavigationMenuLink href={link.href}>{link.icon}</NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
      <div className="flex items-center md:hidden">
        <NavigationMenuLink href="/cart">
          <ShoppingCart aria-label="Shopping cart" />
        </NavigationMenuLink>
        <NavigationMenuToggle />
      </div>
      <NavigationMenuCollapsed>
        <ul className="pb-6">
          {mockedData.map((category, key) => (
            <NavigationMenuItem key={key}>
              {category.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger asChild>
                    <NavigationMenuLink href="#">
                      {category.name}{' '}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          'transition duration-200 group-data-[state=open]/button:-rotate-180',
                        )}
                      />
                    </NavigationMenuLink>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="ps-6">
                    {category.children.map((childCategory, index) => (
                      <ul className="pb-6" key={index}>
                        <NavigationMenuItem>
                          <NavigationMenuLink href="#">{childCategory.name}</NavigationMenuLink>
                        </NavigationMenuItem>
                        {childCategory.children.map((grandchildCategory, childIndex) => (
                          <NavigationMenuItem key={childIndex}>
                            <NavigationMenuLink className="font-normal" href="#">
                              {grandchildCategory.name}
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        ))}
                      </ul>
                    ))}
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink href="#">{category.name}</NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </ul>
        <ul className="border-t border-gray-200 pt-6">
          {mockLinks.map((link, index) => (
            <NavigationMenuItem key={index}>
              <NavigationMenuLink href={link.href}>
                {link.label} {link.icon}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </ul>
      </NavigationMenuCollapsed>
    </NavigationMenu>
  ),
};

export const NavigationAlignmentLeft: Story = {
  render: () => (
    <NavigationMenu className="gap-6 lg:gap-8">
      <NavigationMenuLink className="px-0 text-2xl font-black font-bold lg:text-3xl" href="/home">
        Catalyst Store
      </NavigationMenuLink>
      <div className="flex flex-auto">
        <NavigationMenuList className="hidden md:flex lg:gap-4">
          {mockedData.map((rootCategory) => (
            <NavigationMenuItem key={rootCategory.entityId}>
              {rootCategory.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger>
                    {rootCategory.name}{' '}
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        'transition duration-200 group-data-[state=open]/button:-rotate-180',
                      )}
                    />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="grid auto-cols-auto grid-flow-col">
                    {rootCategory.children.map((childCategory1) => (
                      <ul key={childCategory1.entityId}>
                        <NavigationMenuItem>
                          <NavigationMenuLink href="#">{childCategory1.name}</NavigationMenuLink>
                        </NavigationMenuItem>
                        {childCategory1.children.map((childCategory2) => (
                          <NavigationMenuItem key={childCategory2.entityId}>
                            <NavigationMenuLink className="font-normal" href="#">
                              {childCategory2.name}
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        ))}
                      </ul>
                    ))}
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink href="#">{rootCategory.name}</NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </div>
      <NavigationMenuList className="hidden gap-2 md:flex">
        {mockLinks.map((link, index) => (
          <NavigationMenuItem key={index}>
            <NavigationMenuLink href={link.href}>{link.icon}</NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
      <div className="flex items-center md:hidden">
        <NavigationMenuLink href="/cart">
          <ShoppingCart aria-label="Shopping cart" />
        </NavigationMenuLink>
        <NavigationMenuToggle />
      </div>
      <NavigationMenuCollapsed>
        <ul className="pb-6">
          {mockedData.map((category, key) => (
            <NavigationMenuItem key={key}>
              {category.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger asChild>
                    <NavigationMenuLink href="#">
                      {category.name}{' '}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          'transition duration-200 group-data-[state=open]/button:-rotate-180',
                        )}
                      />
                    </NavigationMenuLink>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="ps-6">
                    {category.children.map((childCategory, index) => (
                      <ul className="pb-6" key={index}>
                        <NavigationMenuItem>
                          <NavigationMenuLink href="#">{childCategory.name}</NavigationMenuLink>
                        </NavigationMenuItem>
                        {childCategory.children.map((grandchildCategory, childIndex) => (
                          <NavigationMenuItem key={childIndex}>
                            <NavigationMenuLink className="font-normal" href="#">
                              {grandchildCategory.name}
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        ))}
                      </ul>
                    ))}
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink href="#">{category.name}</NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </ul>
        <ul className="border-t border-gray-200 pt-6">
          {mockLinks.map((link, index) => (
            <NavigationMenuItem key={index}>
              <NavigationMenuLink href={link.href}>
                {link.label} {link.icon}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </ul>
      </NavigationMenuCollapsed>
    </NavigationMenu>
  ),
};

export const NavigationAlignmentRight: Story = {
  render: () => (
    <NavigationMenu className="gap-6 lg:gap-8">
      <NavigationMenuLink className="px-0 text-2xl font-black font-bold lg:text-3xl" href="/home">
        Catalyst Store
      </NavigationMenuLink>
      <div className="flex flex-auto justify-end">
        <NavigationMenuList className="hidden md:flex lg:gap-4">
          {mockedData.map((rootCategory) => (
            <NavigationMenuItem key={rootCategory.entityId}>
              {rootCategory.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger>
                    {rootCategory.name}{' '}
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        'transition duration-200 group-data-[state=open]/button:-rotate-180',
                      )}
                    />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="grid auto-cols-auto grid-flow-col">
                    {rootCategory.children.map((childCategory1) => (
                      <ul key={childCategory1.entityId}>
                        <NavigationMenuItem>
                          <NavigationMenuLink href="#">{childCategory1.name}</NavigationMenuLink>
                        </NavigationMenuItem>
                        {childCategory1.children.map((childCategory2) => (
                          <NavigationMenuItem key={childCategory2.entityId}>
                            <NavigationMenuLink className="font-normal" href="#">
                              {childCategory2.name}
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        ))}
                      </ul>
                    ))}
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink href="#">{rootCategory.name}</NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </div>
      <NavigationMenuList className="hidden gap-2 md:flex">
        {mockLinks.map((link, index) => (
          <NavigationMenuItem key={index}>
            <NavigationMenuLink href={link.href}>{link.icon}</NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
      <div className="flex items-center md:hidden">
        <NavigationMenuLink href="/cart">
          <ShoppingCart aria-label="Shopping cart" />
        </NavigationMenuLink>
        <NavigationMenuToggle />
      </div>
      <NavigationMenuCollapsed>
        <ul className="pb-6">
          {mockedData.map((category, key) => (
            <NavigationMenuItem key={key}>
              {category.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger asChild>
                    <NavigationMenuLink href="#">
                      {category.name}{' '}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          'transition duration-200 group-data-[state=open]/button:-rotate-180',
                        )}
                      />
                    </NavigationMenuLink>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="ps-6">
                    {category.children.map((childCategory, index) => (
                      <ul className="pb-6" key={index}>
                        <NavigationMenuItem>
                          <NavigationMenuLink href="#">{childCategory.name}</NavigationMenuLink>
                        </NavigationMenuItem>
                        {childCategory.children.map((grandchildCategory, childIndex) => (
                          <NavigationMenuItem key={childIndex}>
                            <NavigationMenuLink className="font-normal" href="#">
                              {grandchildCategory.name}
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        ))}
                      </ul>
                    ))}
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink href="#">{category.name}</NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </ul>
        <ul className="border-t border-gray-200 pt-6">
          {mockLinks.map((link, index) => (
            <NavigationMenuItem key={index}>
              <NavigationMenuLink href={link.href}>
                {link.label} {link.icon}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </ul>
      </NavigationMenuCollapsed>
    </NavigationMenu>
  ),
};

export const LogoCentered: Story = {
  render: () => (
    <NavigationMenu className="justify-start gap-6 lg:gap-8">
      <div className="flex-1">
        <NavigationMenuList className="hidden flex-1 md:flex lg:gap-4">
          {mockedData.map((rootCategory) => (
            <NavigationMenuItem key={rootCategory.entityId}>
              {rootCategory.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger>
                    {rootCategory.name}{' '}
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        'transition duration-200 group-data-[state=open]/button:-rotate-180',
                      )}
                    />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="grid auto-cols-auto grid-flow-col">
                    {rootCategory.children.map((childCategory1) => (
                      <ul key={childCategory1.entityId}>
                        <NavigationMenuItem>
                          <NavigationMenuLink href="#">{childCategory1.name}</NavigationMenuLink>
                        </NavigationMenuItem>
                        {childCategory1.children.map((childCategory2) => (
                          <NavigationMenuItem key={childCategory2.entityId}>
                            <NavigationMenuLink className="font-normal" href="#">
                              {childCategory2.name}
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        ))}
                      </ul>
                    ))}
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink href="#">{rootCategory.name}</NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </div>
      <a
        className="flex flex-auto justify-center px-0 text-2xl font-black font-bold lg:text-3xl"
        href="/home"
      >
        Catalyst Store
      </a>
      <div className="flex-1">
        <NavigationMenuList className="hidden justify-end gap-2 md:flex">
          {mockLinks.map((link, index) => (
            <NavigationMenuItem key={index}>
              <NavigationMenuLink href={link.href}>{link.icon}</NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
        <div className="flex items-center justify-end md:hidden">
          <NavigationMenuLink href="/cart">
            <ShoppingCart aria-label="Shopping cart" />
          </NavigationMenuLink>
          <NavigationMenuToggle />
        </div>
      </div>
      <NavigationMenuCollapsed>
        <ul className="pb-6">
          {mockedData.map((category, key) => (
            <NavigationMenuItem key={key}>
              {category.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger asChild>
                    <NavigationMenuLink href="#">
                      {category.name}{' '}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          'transition duration-200 group-data-[state=open]/button:-rotate-180',
                        )}
                      />
                    </NavigationMenuLink>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="ps-6">
                    {category.children.map((childCategory, index) => (
                      <ul className="pb-6" key={index}>
                        <NavigationMenuItem>
                          <NavigationMenuLink href="#">{childCategory.name}</NavigationMenuLink>
                        </NavigationMenuItem>
                        {childCategory.children.map((grandchildCategory, childIndex) => (
                          <NavigationMenuItem key={childIndex}>
                            <NavigationMenuLink className="font-normal" href="#">
                              {grandchildCategory.name}
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        ))}
                      </ul>
                    ))}
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink href="#">{category.name}</NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </ul>
        <ul className="border-t border-gray-200 pt-6">
          {mockLinks.map((link, index) => (
            <NavigationMenuItem key={index}>
              <NavigationMenuLink href={link.href}>
                {link.label} {link.icon}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </ul>
      </NavigationMenuCollapsed>
    </NavigationMenu>
  ),
};

export const BottomNavigationLeft: Story = {
  render: () => {
    return (
      <NavigationMenu className="flex-col">
        <div className="flex min-h-[92px] w-full items-center justify-between">
          <a className="px-0 text-2xl font-black font-bold lg:text-3xl" href="/home">
            Catalyst Store
          </a>
          <NavigationMenuList className="hidden gap-2 md:flex">
            {mockLinks.map((link, index) => (
              <NavigationMenuItem key={index}>
                <NavigationMenuLink href={link.href}>{link.icon}</NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
          <div className="flex items-center md:hidden">
            <NavigationMenuLink href="/cart">
              <ShoppingCart aria-label="Shopping cart" />
            </NavigationMenuLink>
            <NavigationMenuToggle />
          </div>
        </div>
        <div className="hidden w-full border-t border-gray-200 pt-6 md:flex">
          <NavigationMenuList className="hidden md:flex lg:gap-4">
            {mockedData.map((rootCategory) => (
              <NavigationMenuItem key={rootCategory.entityId}>
                {rootCategory.children.length > 0 ? (
                  <>
                    <NavigationMenuTrigger>
                      {rootCategory.name}{' '}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          'transition duration-200 group-data-[state=open]/button:-rotate-180',
                        )}
                      />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="grid auto-cols-auto grid-flow-col">
                      {rootCategory.children.map((childCategory1) => (
                        <ul key={childCategory1.entityId}>
                          <NavigationMenuItem>
                            <NavigationMenuLink href="#">{childCategory1.name}</NavigationMenuLink>
                          </NavigationMenuItem>
                          {childCategory1.children.map((childCategory2) => (
                            <NavigationMenuItem key={childCategory2.entityId}>
                              <NavigationMenuLink className="font-normal" href="#">
                                {childCategory2.name}
                              </NavigationMenuLink>
                            </NavigationMenuItem>
                          ))}
                        </ul>
                      ))}
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink href="#">{rootCategory.name}</NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </div>
        <NavigationMenuCollapsed>
          <ul className="pb-6">
            {mockedData.map((category, key) => (
              <NavigationMenuItem key={key}>
                {category.children.length > 0 ? (
                  <>
                    <NavigationMenuTrigger asChild>
                      <NavigationMenuLink href="#">
                        {category.name}{' '}
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            'transition duration-200 group-data-[state=open]/button:-rotate-180',
                          )}
                        />
                      </NavigationMenuLink>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="ps-6">
                      {category.children.map((childCategory, index) => (
                        <ul className="pb-6" key={index}>
                          <NavigationMenuItem>
                            <NavigationMenuLink href="#">{childCategory.name}</NavigationMenuLink>
                          </NavigationMenuItem>
                          {childCategory.children.map((grandchildCategory, childIndex) => (
                            <NavigationMenuItem key={childIndex}>
                              <NavigationMenuLink className="font-normal" href="#">
                                {grandchildCategory.name}
                              </NavigationMenuLink>
                            </NavigationMenuItem>
                          ))}
                        </ul>
                      ))}
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink href="#">{category.name}</NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </ul>
          <ul className="border-t border-gray-200 pt-6">
            {mockLinks.map((link, index) => (
              <NavigationMenuItem key={index}>
                <NavigationMenuLink href={link.href}>
                  {link.label} {link.icon}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </ul>
        </NavigationMenuCollapsed>
      </NavigationMenu>
    );
  },
};

export const BottomNavigationCenter: Story = {
  render: () => (
    <NavigationMenu className="flex-col">
      <div className="flex min-h-[92px] w-full items-center justify-between">
        <a className="px-0 text-2xl font-black font-bold lg:text-3xl" href="/home">
          Catalyst Store
        </a>
        <NavigationMenuList className="hidden gap-2 md:flex">
          {mockLinks.map((link, index) => (
            <NavigationMenuItem key={index}>
              <NavigationMenuLink href={link.href}>{link.icon}</NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
        <div className="flex items-center md:hidden">
          <NavigationMenuLink href="/cart">
            <ShoppingCart aria-label="Shopping cart" />
          </NavigationMenuLink>
          <NavigationMenuToggle />
        </div>
      </div>
      <div className="hidden w-full justify-center border-t border-gray-200 pt-6 md:flex">
        <NavigationMenuList className="hidden md:flex lg:gap-4">
          {mockedData.map((rootCategory) => (
            <NavigationMenuItem key={rootCategory.entityId}>
              {rootCategory.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger>
                    {rootCategory.name}{' '}
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        'transition duration-200 group-data-[state=open]/button:-rotate-180',
                      )}
                    />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="grid auto-cols-auto grid-flow-col">
                    {rootCategory.children.map((childCategory1) => (
                      <ul key={childCategory1.entityId}>
                        <NavigationMenuItem>
                          <NavigationMenuLink href="#">{childCategory1.name}</NavigationMenuLink>
                        </NavigationMenuItem>
                        {childCategory1.children.map((childCategory2) => (
                          <NavigationMenuItem key={childCategory2.entityId}>
                            <NavigationMenuLink className="font-normal" href="#">
                              {childCategory2.name}
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        ))}
                      </ul>
                    ))}
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink href="#">{rootCategory.name}</NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </div>
      <NavigationMenuCollapsed>
        <ul className="pb-6">
          {mockedData.map((category, key) => (
            <NavigationMenuItem key={key}>
              {category.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger asChild>
                    <NavigationMenuLink href="#">
                      {category.name}{' '}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          'transition duration-200 group-data-[state=open]/button:-rotate-180',
                        )}
                      />
                    </NavigationMenuLink>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="ps-6">
                    {category.children.map((childCategory, index) => (
                      <ul className="pb-6" key={index}>
                        <NavigationMenuItem>
                          <NavigationMenuLink href="#">{childCategory.name}</NavigationMenuLink>
                        </NavigationMenuItem>
                        {childCategory.children.map((grandchildCategory, childIndex) => (
                          <NavigationMenuItem key={childIndex}>
                            <NavigationMenuLink className="font-normal" href="#">
                              {grandchildCategory.name}
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        ))}
                      </ul>
                    ))}
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink href="#">{category.name}</NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </ul>
        <ul className="border-t border-gray-200 pt-6">
          {mockLinks.map((link, index) => (
            <NavigationMenuItem key={index}>
              <NavigationMenuLink href={link.href}>
                {link.label} {link.icon}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </ul>
      </NavigationMenuCollapsed>
    </NavigationMenu>
  ),
};

export const BottomNavigationRight: Story = {
  render: () => (
    <NavigationMenu className="flex-col">
      <div className="flex min-h-[92px] w-full items-center justify-between">
        <a className="px-0 text-2xl font-black font-bold lg:text-3xl" href="/home">
          Catalyst Store
        </a>
        <NavigationMenuList className="hidden gap-2 md:flex">
          {mockLinks.map((link, index) => (
            <NavigationMenuItem key={index}>
              <NavigationMenuLink href={link.href}>{link.icon}</NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
        <div className="flex items-center md:hidden">
          <NavigationMenuLink href="/cart">
            <ShoppingCart aria-label="Shopping cart" />
          </NavigationMenuLink>
          <NavigationMenuToggle />
        </div>
      </div>
      <div className="hidden w-full justify-end border-t border-gray-200 pt-6 md:flex">
        <NavigationMenuList className="hidden md:flex lg:gap-4">
          {mockedData.map((rootCategory) => (
            <NavigationMenuItem key={rootCategory.entityId}>
              {rootCategory.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger>
                    {rootCategory.name}{' '}
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        'transition duration-200 group-data-[state=open]/button:-rotate-180',
                      )}
                    />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="grid auto-cols-auto grid-flow-col">
                    {rootCategory.children.map((childCategory1) => (
                      <ul key={childCategory1.entityId}>
                        <NavigationMenuItem>
                          <NavigationMenuLink href="#">{childCategory1.name}</NavigationMenuLink>
                        </NavigationMenuItem>
                        {childCategory1.children.map((childCategory2) => (
                          <NavigationMenuItem key={childCategory2.entityId}>
                            <NavigationMenuLink className="font-normal" href="#">
                              {childCategory2.name}
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        ))}
                      </ul>
                    ))}
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink href="#">{rootCategory.name}</NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </div>
      <NavigationMenuCollapsed>
        <ul className="pb-6">
          {mockedData.map((category, key) => (
            <NavigationMenuItem key={key}>
              {category.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger asChild>
                    <NavigationMenuLink href="#">
                      {category.name}{' '}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          'transition duration-200 group-data-[state=open]/button:-rotate-180',
                        )}
                      />
                    </NavigationMenuLink>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="ps-6">
                    {category.children.map((childCategory, index) => (
                      <ul className="pb-6" key={index}>
                        <NavigationMenuItem>
                          <NavigationMenuLink href="#">{childCategory.name}</NavigationMenuLink>
                        </NavigationMenuItem>
                        {childCategory.children.map((grandchildCategory, childIndex) => (
                          <NavigationMenuItem key={childIndex}>
                            <NavigationMenuLink className="font-normal" href="#">
                              {grandchildCategory.name}
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        ))}
                      </ul>
                    ))}
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink href="#">{category.name}</NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </ul>
        <ul className="border-t border-gray-200 pt-6">
          {mockLinks.map((link, index) => (
            <NavigationMenuItem key={index}>
              <NavigationMenuLink href={link.href}>
                {link.label} {link.icon}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </ul>
      </NavigationMenuCollapsed>
    </NavigationMenu>
  ),
};

export const NavigationWithBadge: Story = {
  args: {
    children: 3,
  },
  render: ({ children }) => (
    <NavigationMenu className="mx-5 gap-6 lg:gap-8">
      <NavigationMenuLink className="px-0 text-2xl font-black font-bold lg:text-3xl" href="/home">
        Catalyst Store
      </NavigationMenuLink>
      <NavigationMenuList className="hidden md:flex lg:gap-4">
        {mockedData.map((rootCategory) => (
          <NavigationMenuItem key={rootCategory.entityId}>
            {rootCategory.children.length > 0 ? (
              <>
                <NavigationMenuTrigger>
                  {rootCategory.name}{' '}
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      'transition duration-200 group-data-[state=open]/button:-rotate-180',
                    )}
                  />
                </NavigationMenuTrigger>
                <NavigationMenuContent className="grid auto-cols-auto grid-flow-col">
                  {rootCategory.children.map((childCategory1) => (
                    <ul key={childCategory1.entityId}>
                      <NavigationMenuItem>
                        <NavigationMenuLink href="#">{childCategory1.name}</NavigationMenuLink>
                      </NavigationMenuItem>
                      {childCategory1.children.map((childCategory2) => (
                        <NavigationMenuItem key={childCategory2.entityId}>
                          <NavigationMenuLink className="font-normal" href="#">
                            {childCategory2.name}
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      ))}
                    </ul>
                  ))}
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink href="#">{rootCategory.name}</NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
      <NavigationMenuList className="hidden gap-2 md:flex">
        {mockLinks.map((link, index) => (
          <NavigationMenuItem key={index}>
            {link.label === 'Shopping cart' ? (
              <NavigationMenuLink className="relative" href="/cart" role="status">
                <Badge>{children}</Badge>
                <ShoppingCart aria-label="Shopping cart" />
              </NavigationMenuLink>
            ) : (
              <NavigationMenuLink href={link.href}>{link.icon}</NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
      <div className="flex items-center md:hidden">
        <NavigationMenuLink className="relative" href="/cart" role="status">
          <Badge>{children}</Badge>
          <ShoppingCart aria-label="Shopping cart" />
        </NavigationMenuLink>
        <NavigationMenuToggle />
      </div>
      <NavigationMenuCollapsed>
        <ul className="pb-6">
          {mockedData.map((category, key) => (
            <NavigationMenuItem key={key}>
              {category.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger asChild>
                    <NavigationMenuLink href="#">
                      {category.name}{' '}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          'transition duration-200 group-data-[state=open]/button:-rotate-180',
                        )}
                      />
                    </NavigationMenuLink>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="ps-6">
                    {category.children.map((childCategory, index) => (
                      <ul className="pb-6" key={index}>
                        <NavigationMenuItem>
                          <NavigationMenuLink href="#">{childCategory.name}</NavigationMenuLink>
                        </NavigationMenuItem>
                        {childCategory.children.map((grandchildCategory, childIndex) => (
                          <NavigationMenuItem key={childIndex}>
                            <NavigationMenuLink className="font-normal" href="#">
                              {grandchildCategory.name}
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        ))}
                      </ul>
                    ))}
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink href="#">{category.name}</NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </ul>
        <ul className="border-t border-gray-200 pt-6">
          {mockLinks.map((link, index) => (
            <NavigationMenuItem key={index}>
              <NavigationMenuLink href={link.href}>
                {link.label} {link.icon}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </ul>
      </NavigationMenuCollapsed>
    </NavigationMenu>
  ),
};

export const CustomNavigationMenuToggle: Story = {
  render: () => (
    <NavigationMenu className="gap-6 lg:gap-8">
      <NavigationMenuLink className="px-0 text-2xl font-black font-bold lg:text-3xl" href="/home">
        Catalyst Store
      </NavigationMenuLink>
      <NavigationMenuList className="hidden md:flex lg:gap-4">
        {mockedData.map((rootCategory) => (
          <NavigationMenuItem key={rootCategory.entityId}>
            {rootCategory.children.length > 0 ? (
              <>
                <NavigationMenuTrigger>
                  {rootCategory.name}{' '}
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      'transition duration-200 group-data-[state=open]/button:-rotate-180',
                    )}
                  />
                </NavigationMenuTrigger>
                <NavigationMenuContent className="grid auto-cols-auto grid-flow-col">
                  {rootCategory.children.map((childCategory1) => (
                    <ul key={childCategory1.entityId}>
                      <NavigationMenuItem>
                        <NavigationMenuLink href="#">{childCategory1.name}</NavigationMenuLink>
                      </NavigationMenuItem>
                      {childCategory1.children.map((childCategory2) => (
                        <NavigationMenuItem key={childCategory2.entityId}>
                          <NavigationMenuLink className="font-normal" href="#">
                            {childCategory2.name}
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      ))}
                    </ul>
                  ))}
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink href="#">{rootCategory.name}</NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
      <NavigationMenuList className="hidden gap-2 md:flex">
        {mockLinks.map((link, index) => (
          <NavigationMenuItem key={index}>
            <NavigationMenuLink href={link.href}>{link.icon}</NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
      <div className="flex items-center md:hidden">
        <NavigationMenuLink href="/cart">
          <ShoppingCart aria-label="Shopping cart" />
        </NavigationMenuLink>
        <NavigationMenuToggle>
          <XSquare className="hidden group-aria-[expanded='true']:block" />
          <MenuSquare className="hidden group-aria-[expanded='false']:block" />
        </NavigationMenuToggle>
      </div>
      <NavigationMenuCollapsed>
        <ul className="pb-6">
          {mockedData.map((category, key) => (
            <NavigationMenuItem key={key}>
              {category.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger asChild>
                    <NavigationMenuLink href="#">
                      {category.name}{' '}
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          'transition duration-200 group-data-[state=open]/button:-rotate-180',
                        )}
                      />
                    </NavigationMenuLink>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="ps-6">
                    {category.children.map((childCategory, index) => (
                      <ul className="pb-6" key={index}>
                        <NavigationMenuItem>
                          <NavigationMenuLink href="#">{childCategory.name}</NavigationMenuLink>
                        </NavigationMenuItem>
                        {childCategory.children.map((grandchildCategory, childIndex) => (
                          <NavigationMenuItem key={childIndex}>
                            <NavigationMenuLink className="font-normal" href="#">
                              {grandchildCategory.name}
                            </NavigationMenuLink>
                          </NavigationMenuItem>
                        ))}
                      </ul>
                    ))}
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink href="#">{category.name}</NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </ul>
        <ul className="border-t border-gray-200 pt-6">
          {mockLinks.map((link, index) => (
            <NavigationMenuItem key={index}>
              <NavigationMenuLink href={link.href}>
                {link.label} {link.icon}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </ul>
      </NavigationMenuCollapsed>
    </NavigationMenu>
  ),
};
