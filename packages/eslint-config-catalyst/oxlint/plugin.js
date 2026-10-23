// Rules oxlint can't run from their original ESLint plugins.

/**
 * Replaces `switch-case/newline-between-switch-case` ("always", { fallthrough: "never" }), whose
 * reachability check depends on ESLint's code-path API. An empty case is treated as a fallthrough.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
const newlineBetweenSwitchCase = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    messages: {
      expected: 'Expected a blank line after this switch case.',
      unexpected: 'Unexpected blank line after a fallthrough switch case.',
    },
    schema: [],
  },
  create(context) {
    const { sourceCode } = context;

    return {
      SwitchCase(node) {
        const { cases } = node.parent;

        if (cases[cases.length - 1] === node) {
          return;
        }

        const lastToken = sourceCode.getLastToken(node);
        const nextToken = sourceCode.getTokenAfter(node, { includeComments: true });
        const hasBlankLine = nextToken.loc.start.line - lastToken.loc.end.line > 1;
        const isFallthrough = node.consequent.length === 0;

        if (isFallthrough && hasBlankLine) {
          context.report({
            node,
            messageId: 'unexpected',
            fix: (fixer) => fixer.replaceTextRange([lastToken.range[1], nextToken.range[0]], '\n'),
          });
        } else if (!isFallthrough && !hasBlankLine) {
          context.report({
            node,
            messageId: 'expected',
            fix: (fixer) => fixer.insertTextAfter(lastToken, '\n'),
          });
        }
      },
    };
  },
};

/**
 * Replaces the `no-restricted-syntax` selectors from `@bigcommerce/eslint-config` (oxlint has no
 * `no-restricted-syntax`). `with` statements are already a parse error in modules.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
const noRestrictedSyntax = {
  meta: {
    type: 'suggestion',
    messages: {
      forIn:
        'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      forOf:
        'iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.',
      labeled:
        'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      setter: 'Property setters are not allowed',
      getter: 'Property getters are not allowed',
    },
    schema: [],
  },
  create(context) {
    return {
      ForInStatement: (node) => context.report({ node, messageId: 'forIn' }),
      ForOfStatement: (node) => context.report({ node, messageId: 'forOf' }),
      LabeledStatement: (node) => context.report({ node, messageId: 'labeled' }),
      MethodDefinition(node) {
        if (node.kind === 'set') context.report({ node, messageId: 'setter' });
        if (node.kind === 'get') context.report({ node, messageId: 'getter' });
      },
    };
  },
};

module.exports = {
  meta: { name: 'catalyst' },
  rules: {
    'newline-between-switch-case': newlineBetweenSwitchCase,
    'no-restricted-syntax': noRestrictedSyntax,
  },
};
