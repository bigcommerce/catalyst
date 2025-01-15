import { Image, Link, List, Select, Shape, TextInput } from '@makeswift/runtime/controls';

import { MegaMenu } from '.';
import { MegaMenuMenuItem, MegaMenuMenuItemColumn, MegaMenuSubMenuItem, MegaMenuSubSubMenuItem, MegaMenuSecondaryMenuItem, MegaMenuProps } from './mega-menu-types';
import { runtime } from '~/lib/makeswift/runtime';

runtime.registerComponent(
  function MSMegaMenu({ classNames, variant, menuItems, secondaryMenuItems }: MegaMenuProps) {
    return (
      <MegaMenu
        variant={variant}
        menuItems={menuItems}
        secondaryMenuItems={secondaryMenuItems}
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
          { value: "hidden", label: "Hidden" },
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
            columns: List({
              label: 'Columns',
              type: Shape({
                type: {
                  //title: TextInput({ label: 'Title', defaultValue: 'Text' }),
                  subMenuItems: List({
                    label: 'Menu Items',
                    type: Shape({
                      type: {
                        title: TextInput({ label: 'Title', defaultValue: 'Text' }),
                        link: Link({ label: 'Link' }),
                        imageSrc: Image({ label: 'Image' }),
                        //imageAlt: TextInput({ label: 'Image alt', defaultValue: '' }),
                        description: TextInput({ label: 'Description', defaultValue: '' }),
                        subSubMenuItems: List({
                          label: 'Menu Items',
                          type: Shape({
                            type: {
                              title: TextInput({ label: 'Title', defaultValue: 'Text' }),
                              link: Link({ label: 'Link' }),
                              imageSrc: Image({ label: 'Image' }),
                              //imageAlt: TextInput({ label: 'Image alt', defaultValue: '' }),
                              //description: TextInput({ label: 'Description', defaultValue: '' }),
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
                }
              }),
              getItemLabel(columnItem) {
                //return columnItem?.title || 'Menu item column';
                return 'Menu item column';
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
