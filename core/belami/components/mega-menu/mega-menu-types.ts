//import { Streamable } from '@/vibes/soul/lib/streamable';
//import { mapStreamable } from '@/vibes/soul/lib/streamable/server';

export interface MegaMenuMenuItem {
  title?: string;
  link?: { href?: string; target?: string };
  subMenuItems: MegaMenuSubMenuItem[];
}

export interface MegaMenuSubMenuItem {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
  subSubMenuItems: MegaMenuSubSubMenuItem[];
}

export interface MegaMenuSubSubMenuItem {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
}

export interface MegaMenuSecondaryMenuItem {
  title?: string;
  link?: { href?: string; target?: string };
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
    mainMenuItem?: string;
    mainSubMenuItem?: string;
    mainSubSubMenuItem?: string;
    secondaryMenuItem?: string;
    mainMenuLink?: string;
    mainSubMenuLink?: string;
    mainSubSubMenuLink?: string;
    secondaryMenuLink?: string;
  };
};
