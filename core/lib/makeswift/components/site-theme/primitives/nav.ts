import { Color, Font, Shape } from '@makeswift/runtime/controls';

const elementGroup = (label: string, { selectable = false }: { selectable?: boolean } = {}) =>
  Shape({
    label,
    layout: Shape.Layout.Popover,
    type: {
      font: Font({ label: 'Font', variant: false }),
      text: Color({ label: 'Text' }),
      textHover: Color({ label: 'Text hover' }),
      ...(selectable && {
        textSelected: Color({ label: 'Text selected' }),
      }),
      background: Color({ label: 'Background' }),
      backgroundHover: Color({ label: 'Background hover' }),
    },
  });

const buttonGroup = (label: string) =>
  Shape({
    label,
    layout: Shape.Layout.Popover,
    type: {
      icon: Color({ label: 'Icon' }),
      iconHover: Color({ label: 'Icon hover' }),
      background: Color({ label: 'Background' }),
      backgroundHover: Color({ label: 'Background hover' }),
    },
  });

const menuGroup = (label: string) =>
  Shape({
    label,
    layout: Shape.Layout.Popover,
    type: {
      background: Color({ label: 'Background' }),
      border: Color({ label: 'Border' }),
      divider: Color({ label: 'Divider' }),
    },
  });

const mobile = Shape({
  label: 'Mobile',
  layout: Shape.Layout.Popover,
  type: {
    background: Color({ label: 'Background' }),
    divider: Color({ label: 'Divider' }),
    buttonIcon: Color({ label: 'Button icon' }),
    link: elementGroup('Link'),
    subLink: elementGroup('Sub-link'),
  },
});

const searchGroup = (label: string) =>
  Shape({
    label,
    layout: Shape.Layout.Popover,
    type: {
      background: Color({ label: 'Background' }),
      border: Color({ label: 'Border' }),
      divider: Color({ label: 'Divider' }),
      icon: Color({ label: 'Icon' }),
      emptyTitle: Color({ label: 'Empty title' }),
      emptySubtitle: Color({ label: 'Empty subtitle' }),
    },
  });

const searchResultGroup = (label: string) =>
  Shape({
    label,
    layout: Shape.Layout.Popover,
    type: {
      title: Color({ label: 'Title' }),
      titleFont: Font({ label: 'Title font', variant: false }),
      link: elementGroup('Link'),
    },
  });

const cartCountGroup = (label: string) =>
  Shape({
    label,
    layout: Shape.Layout.Popover,
    type: {
      text: Color({ label: 'Text' }),
      background: Color({ label: 'Background' }),
    },
  });

const localeGroup = (label: string) =>
  Shape({
    label,
    layout: Shape.Layout.Popover,
    type: {
      background: Color({ label: 'Background' }),
      link: elementGroup('Link', { selectable: true }),
    },
  });

export const nav = Shape({
  label: 'Navigation',
  layout: Shape.Layout.Popover,
  type: {
    background: Color({ label: 'Background' }),
    floatingBorder: Color({ label: 'Floating border' }),
    focus: Color({ label: 'Focus' }),
    link: elementGroup('Link'),
    group: elementGroup('Group'),
    subLink: elementGroup('Sub-link'),
    button: buttonGroup('Button'),
    menu: menuGroup('Menu'),
    mobile,
    search: searchGroup('Search'),
    searchResult: searchResultGroup('Search result'),
    cartCount: cartCountGroup('Cart count'),
    locale: localeGroup('Locale'),
  },
});
