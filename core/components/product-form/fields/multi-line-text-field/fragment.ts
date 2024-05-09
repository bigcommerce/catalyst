import { graphql } from '~/client/graphql';

export const MultiLineTextFieldFragment = graphql(`
  fragment MultiLineTextFieldFragment on MultiLineTextFieldOption {
    entityId
    displayName
    isRequired
    defaultText: defaultValue
    maxLength
    minLength
    maxLines
  }
`);
