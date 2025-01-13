import { Image, Link, List, Select, Shape, TextInput } from '@makeswift/runtime/controls';

import { MegaMenu } from '.';
import { runtime } from '~/lib/makeswift/runtime';

interface MenuItem {
  title?: string;
  link?: { href?: string; target?: string };
  subMenuItems: SubMenuItem[];
}

interface SubMenuItem {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
  subSubMenuItems: SubSubMenuItem[];
}

interface SubSubMenuItem {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
}

interface SecondaryMenuItem {
  title?: string;
  link?: { href?: string; target?: string };
}

interface MSMegaMenuProps {
  classNames?: {
    root?: string,
    content?: string,
    item?: string
  };
  variant?: string;
  menuItems: MenuItem[];
  secondaryMenuItems: SecondaryMenuItem[];
}

runtime.registerComponent(
  function MSMegaMenu({ classNames, variant, menuItems, secondaryMenuItems }: MSMegaMenuProps) {
    return (
      <MegaMenu
        menuItems={menuItems.map(({ title, link }, index) => {
          return {
            id: title ?? index.toString(),
            title: title ?? '',
            url: link?.href ?? '',
          };
        })}
        classNames={classNames}
      />
    );
  },
  {
    type: 'belami-mega-menu',
    label: 'Belami / Mega Menu',
    icon: 'navigation',
    props: {
      /*
      classNames: Shape({
        type: {
          root: TextInput({ label: 'Root class', defaultValue: '' }),
          content: TextInput({ label: 'Content class', defaultValue: '' }),
          item: TextInput({ label: 'Item class', defaultValue: '' }),
        }
      }),
      */
      /*
      menuItems: List({
        label: 'Menu Items',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: 'Text' }),
            link: Link({ label: 'Link' }),
          },
        }),
        getItemLabel(menuItem) {
          return menuItem?.title || 'Menu item';
        },
      }),
      */

      variant: Select({
        label: "Style",
        labelOrientation: "horizontal",
        options: [
          { value: "default", label: "Default" },
        ],
        defaultValue: "default",
      }),
      menuItems: List({
        label: 'Menu Items',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: 'Text' }),
            link: Link({ label: 'Link' }),
            subMenuItems: List({
              label: 'Menu Items',
              type: Shape({
                type: {
                  title: TextInput({ label: 'Title', defaultValue: 'Text' }),
                  link: Link({ label: 'Link' }),
                  imageSrc: Image({ label: 'Image' }),
                  imageAlt: TextInput({ label: 'Image alt', defaultValue: '' }),
                  subSubMenuItems: List({
                    label: 'Menu Items',
                    type: Shape({
                      type: {
                        title: TextInput({ label: 'Title', defaultValue: 'Text' }),
                        link: Link({ label: 'Link' }),
                        imageSrc: Image({ label: 'Image' }),
                        imageAlt: TextInput({ label: 'Image alt', defaultValue: '' }),
                      },
                    }),
                    getItemLabel(menuItem) {
                      return menuItem?.title || 'Menu item';
                    },
                  }),
                },
              }),
              getItemLabel(menuItem) {
                return menuItem?.title || 'Menu item';
              },
            }),
          },
        }),
        getItemLabel(menuItem) {
          return menuItem?.title || 'Menu item';
        },
      }),
      secondaryMenuItems: List({
        label: 'Secondary Menu Items',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: 'Text' }),
            link: Link({ label: 'Link' }),
          },
        }),
        getItemLabel(menuItem) {
          return menuItem?.title || 'Menu item';
        },
      }),
    },
  },
);
