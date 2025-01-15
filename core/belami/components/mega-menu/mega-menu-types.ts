//import { Streamable } from '@/vibes/soul/lib/streamable';
//import { mapStreamable } from '@/vibes/soul/lib/streamable/server';

export interface MegaMenuMenuItem {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
  description?: string;
  columns: MegaMenuMenuItemColumn[];
}

export interface MegaMenuMenuItemColumn {
  title?: string;
  subMenuItems: MegaMenuSubMenuItem[];
}

export interface MegaMenuSubMenuItem {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
  description?: string;
  button?: string;
  subSubMenuItems: MegaMenuSubSubMenuItem[];
}

export interface MegaMenuSubSubMenuItem {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
  button?: string;
  description?: string;
}

export interface MegaMenuSecondaryMenuItem {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
  description?: string;
}

export type MegaMenuProps = {
  variant?: string;
  /*
    menuItems: Streamable<MenuItem[]>;
    secondaryMenuItems: Streamable<SecondaryMenuItem[]>;
    */
  menuItems: MegaMenuMenuItem[];
  secondaryMenuItems: MegaMenuSecondaryMenuItem[];
  classNames?: {
    root?: string;
    mainMenu?: string;
    secondaryMenu?: string;
    subMenuRoot?: string;
    subMenuColumns?: string;
    subMenuCloseButton?: string;
    mainMenuItem?: string;
    mainSubMenuItem?: string;
    mainSubMenuColumn?: string;
    mainSubMenuImage?: string;
    mainSubMenuDescription?: string;
    mainSubMenuButton?: string;
    mainSubSubMenuItem?: string;
    mainSubSubMenuImage?: string;
    mainSubSubMenuDescription?: string;
    mainSubSubMenuButton?: string;
    secondaryMenuItem?: string;
    mainMenuLink?: string;
    mainSubMenuLink?: string;
    mainSubSubMenuLink?: string;
    secondaryMenuLink?: string;
  };
};
