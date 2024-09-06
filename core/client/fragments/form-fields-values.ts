import { graphql } from '../graphql';

export const FormFieldValuesFragment = graphql(`
  fragment FormFieldValuesFragment on CustomerFormFieldValue {
    entityId
    __typename
    name
    ... on CheckboxesFormFieldValue {
      valueEntityIds
      values
    }
    ... on DateFormFieldValue {
      date {
        utc
      }
    }
    ... on MultipleChoiceFormFieldValue {
      valueEntityId
      value
    }
    ... on NumberFormFieldValue {
      number
    }
    ... on PasswordFormFieldValue {
      password
    }
    ... on TextFormFieldValue {
      text
    }
    ... on MultilineTextFormFieldValue {
      multilineText
    }
  }
`);
