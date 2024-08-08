import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ChevronDown } from 'lucide-react';
import { ComponentPropsWithoutRef, ReactNode } from 'react';

import { Link } from '~/components/link';
import { cn } from '~/lib/utils';

import { MobileNav } from './mobile-nav';

interface Children {
  name: string;
  path: string;
  children?: Children[];
}

interface Props extends ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> {
  links: Array<{ name: string; path: string; children?: Children[] }>;
  logo: ReactNode;
}

const Header = ({ children, className, links, logo }: Props) => (
  <div className={cn('relative', className)}>
    <header className="flex h-[92px] items-center justify-between gap-1 overflow-y-visible bg-white px-4 2xl:container sm:px-10 lg:gap-8 lg:px-12 2xl:mx-auto 2xl:px-0">
      <Link className="overflow-hidden text-ellipsis py-3" href="/">
        {logo}
      </Link>

      <NavigationMenuPrimitive.Root className="hidden lg:block">
        <NavigationMenuPrimitive.List className="flex items-center gap-2 lg:gap-4">
          {links.map((link) =>
            link.children && link.children.length > 0 ? (
              <NavigationMenuPrimitive.Item key={link.path}>
                <NavigationMenuPrimitive.Trigger className="group/button flex items-center font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20">
                  <Link className="p-3 font-semibold" href={link.path}>
                    {link.name}
                  </Link>
                  <ChevronDown
                    aria-hidden="true"
                    className="cursor-pointer transition duration-200 group-data-[state=open]/button:-rotate-180"
                  />
                </NavigationMenuPrimitive.Trigger>
                <NavigationMenuPrimitive.Content className="flex gap-20 2xl:container data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 sm:px-10 lg:px-12 2xl:mx-auto 2xl:px-0">
                  {link.children.map((child) => (
                    <ul className="flex flex-col" key={child.path}>
                      <li>
                        <NavigationMenuPrimitive.Link asChild>
                          <Link className="block p-3 font-semibold" href={child.path}>
                            {child.name}
                          </Link>
                        </NavigationMenuPrimitive.Link>
                      </li>
                      {child.children &&
                        child.children.length > 0 &&
                        child.children.map((child2) => (
                          <li key={child2.path}>
                            <NavigationMenuPrimitive.Link asChild>
                              <Link className="block p-3" href={child2.path}>
                                {child2.name}
                              </Link>
                            </NavigationMenuPrimitive.Link>
                          </li>
                        ))}
                    </ul>
                  ))}
                </NavigationMenuPrimitive.Content>
              </NavigationMenuPrimitive.Item>
            ) : (
              <NavigationMenuPrimitive.Item key={link.path}>
                <NavigationMenuPrimitive.Link asChild>
                  <Link className="p-3 font-semibold" href={link.path}>
                    {link.name}
                  </Link>
                </NavigationMenuPrimitive.Link>
              </NavigationMenuPrimitive.Item>
            ),
          )}
        </NavigationMenuPrimitive.List>

        <NavigationMenuPrimitive.Viewport className="absolute start-0 top-full z-50 w-full bg-white pb-12 pt-6 shadow-xl duration-200 animate-in slide-in-from-top-5" />
      </NavigationMenuPrimitive.Root>

      <div className="flex items-center gap-2 lg:gap-4">
        <nav className="flex gap-2 lg:gap-4">{children}</nav>

        <MobileNav links={links} logo={logo} />
      </div>
    </header>
  </div>
);

Header.displayName = 'Header';

export { Header };
