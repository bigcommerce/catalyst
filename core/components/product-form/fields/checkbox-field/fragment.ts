import { graphql } from '~/client/graphql';

export const CheckboxFieldFragment = graphql(`
  fragment CheckboxFieldFragment on CheckboxOption {
    entityId
    isRequired
    displayName
    checkedByDefault
    label
    checkedOptionValueEntityId
    uncheckedOptionValueEntityId
  }
`);
