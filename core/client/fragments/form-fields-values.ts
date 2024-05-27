import { graphql } from '../graphql';

export const FORM_FIELDS_VALUES_FRAGMENT = graphql(`
  fragment FormFieldsValues on CustomerFormFieldValue {
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
  }
`);
