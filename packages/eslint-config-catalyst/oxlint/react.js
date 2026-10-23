// @ts-check

// Generated from `@bigcommerce/catalyst/react` (delta over base) with @oxlint/migrate.
/** @type {import('oxlint').OxlintConfig} */
const config = {
  plugins: ['react', 'jsx-a11y'],
  rules: {
    'react/jsx-curly-brace-presence': [
      'error',
      {
        children: 'never',
        propElementValues: 'always',
        props: 'never',
      },
    ],
    'react/jsx-fragments': ['error', 'syntax'],
    'react/jsx-no-useless-fragment': ['error'],
    'react/jsx-pascal-case': ['error'],
    'react/no-redundant-should-component-update': ['error'],
    'react/no-this-in-sfc': ['error'],
    'react/no-unescaped-entities': 'error',
    'react/no-unsafe': ['error'],
    'react/prefer-es6-class': ['error'],
    'react/self-closing-comp': ['error'],
    'react/style-prop-object': ['error'],
    'jsx-a11y/alt-text': ['error'],
    'jsx-a11y/anchor-has-content': ['error'],
    'jsx-a11y/anchor-is-valid': ['error'],
    'jsx-a11y/aria-activedescendant-has-tabindex': ['error'],
    'jsx-a11y/aria-props': ['error'],
    'jsx-a11y/aria-proptypes': ['error'],
    'jsx-a11y/aria-role': ['error'],
    'jsx-a11y/aria-unsupported-elements': ['error'],
    'jsx-a11y/autocomplete-valid': ['error'],
    'jsx-a11y/click-events-have-key-events': ['error'],
    'jsx-a11y/heading-has-content': ['error'],
    'jsx-a11y/html-has-lang': ['error'],
    'jsx-a11y/iframe-has-title': ['error'],
    'jsx-a11y/img-redundant-alt': ['error'],
    'jsx-a11y/interactive-supports-focus': [
      'error',
      {
        tabbable: ['button', 'checkbox', 'link', 'searchbox', 'spinbutton', 'switch', 'textbox'],
      },
    ],
    'jsx-a11y/label-has-associated-control': ['error'],
    'jsx-a11y/media-has-caption': ['error'],
    'jsx-a11y/mouse-events-have-key-events': ['error'],
    'jsx-a11y/no-access-key': ['error'],
    'jsx-a11y/no-autofocus': ['error'],
    'jsx-a11y/no-distracting-elements': ['error'],
    'jsx-a11y/no-interactive-element-to-noninteractive-role': [
      'error',
      {
        tr: ['none', 'presentation'],
        canvas: ['img'],
      },
    ],
    'jsx-a11y/no-noninteractive-element-interactions': [
      'error',
      {
        handlers: [
          'onClick',
          'onError',
          'onLoad',
          'onMouseDown',
          'onMouseUp',
          'onKeyPress',
          'onKeyDown',
          'onKeyUp',
        ],
        alert: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
        body: ['onError', 'onLoad'],
        dialog: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
        iframe: ['onError', 'onLoad'],
        img: ['onError', 'onLoad'],
      },
    ],
    'jsx-a11y/no-noninteractive-element-to-interactive-role': [
      'error',
      {
        ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        li: ['menuitem', 'menuitemradio', 'menuitemcheckbox', 'option', 'row', 'tab', 'treeitem'],
        table: ['grid'],
        td: ['gridcell'],
        fieldset: ['radiogroup', 'presentation'],
      },
    ],
    'jsx-a11y/no-noninteractive-tabindex': [
      'error',
      {
        tags: [],
        roles: ['tabpanel'],
        allowExpressionValues: true,
      },
    ],
    'jsx-a11y/no-redundant-roles': ['error'],
    'jsx-a11y/no-static-element-interactions': [
      'error',
      {
        allowExpressionValues: true,
        handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
      },
    ],
    'jsx-a11y/role-has-required-aria-props': ['error'],
    'jsx-a11y/role-supports-aria-props': ['error'],
    'jsx-a11y/scope': ['error'],
    'jsx-a11y/tabindex-no-positive': ['error'],
    'react/jsx-key': ['error'],
    'react/jsx-no-comment-textnodes': ['error'],
    'react/jsx-no-duplicate-props': ['error'],
    'react/jsx-no-target-blank': ['error'],
    'react/jsx-no-undef': ['error'],
    'react/no-children-prop': ['error'],
    'react/no-danger-with-children': ['error'],
    'react/no-direct-mutation-state': ['error'],
    'react/no-find-dom-node': ['error'],
    'react/no-is-mounted': ['error'],
    'react/no-render-return-value': ['error'],
    'react/no-string-refs': ['error'],
    'react/no-unknown-property': ['error'],
    'react/exhaustive-deps': ['error'],
    'react/rules-of-hooks': ['error'],
  },
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        'react/jsx-filename-extension': [
          'warn',
          {
            extensions: ['.tsx'],
          },
        ],
      },
    },
    {
      files: ['**/*.spec.ts', '**/*.test.ts'],
      rules: {
        'react/jsx-filename-extension': [
          'warn',
          {
            extensions: ['.tsx'],
          },
        ],
      },
    },
    {
      files: ['**/*.d.ts'],
      rules: {
        'react/jsx-filename-extension': [
          'warn',
          {
            extensions: ['.tsx'],
          },
        ],
      },
    },
  ],
  env: {
    browser: true,
  },
};

module.exports = config;
