// import { MakeswiftComponentType } from '@makeswift/runtime/components';
import {
  Checkbox,
  Color,
  Image,
  Link,
  List,
  Number,
  Shape,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { Navigation } from './Navigation';
import { runtime } from 'lib/runtime';

runtime.registerComponent(Navigation, {
  type: 'navigation',
  label: 'Navigation',
  props: {
    className: Style(),
    stickyNav: Checkbox({
      label: 'Sticky navigation',
      defaultValue: false,
    }),
    navBackground: Color({
      label: 'Background color',
      defaultValue: '#ffffff',
    }),
    navWidth: Number({
      label: 'Max content width',
      defaultValue: 1280,
      suffix: 'px',
      selectAll: true,
    }),
    logoImage: Image({
      label: 'Logo',
      format: Image.Format.WithDimensions,
    }),
    logoWidth: Number({
      label: 'Logo width',
      defaultValue: 100,
      suffix: 'px',
      selectAll: true,
    }),
    logoAlt: TextInput({
      label: 'Logo alt text',
      defaultValue: 'Logo',
      selectAll: true,
    }),
    logoLink: Link({ label: 'Logo on click' }),
    mainNavLinks: List({
      label: 'Main links',
      type: Shape({
        type: {
          text: TextInput({
            label: 'Text',
            defaultValue: 'Link',
            selectAll: true,
          }),
          link: Link({ label: 'On click (disabled with subnav)' }),
          subnavGroups: List({
            label: 'Subnav groups',
            type: Shape({
              type: {
                heading: TextInput({ label: 'Heading', defaultValue: 'Heading', selectAll: true }),
                subnavLinks: List({
                  label: 'Links',
                  type: Shape({
                    type: {
                      linkText: TextInput({ label: 'Text', defaultValue: 'Link', selectAll: true }),
                      link: Link({ label: 'On click' }),
                    },
                  }),
                  getItemLabel(subnavLink) {
                    return subnavLink?.linkText || 'Link';
                  },
                }),
              },
            }),
            getItemLabel(subnavGroup) {
              return subnavGroup?.heading || 'Heading';
            },
          }),
        },
      }),
      getItemLabel(links) {
        return links?.text || 'Link';
      },
    }),
    linkColor: Color({
      label: 'Link color',
      defaultValue: '#000000',
    }),
    linkTextStyle: Style({ properties: [Style.TextStyle] }),
  },
});
