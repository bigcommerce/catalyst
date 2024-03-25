import { graphql } from '../graphql';

export const FORM_FIELDS_FRAGMENT = graphql(`
  fragment FormFields on FormField {
    entityId
    label
    sortOrder
    isBuiltIn
    isRequired
    __typename
    ... on CheckboxesFormField {
      options {
        entityId
        label
      }
    }
    ... on DateFormField {
      defaultDate
      minDate
      maxDate
    }
    ... on MultilineTextFormField {
      defaultText
      rows
    }
    ... on NumberFormField {
      defaultNumber
      maxLength
      minNumber
      maxNumber
    }
    ... on PasswordFormField {
      defaultText
      maxLength
    }
    ... on PicklistFormField {
      choosePrefix
      options {
        entityId
        label
      }
    }
    ... on RadioButtonsFormField {
      options {
        entityId
        label
      }
    }
    ... on TextFormField {
      defaultText
      maxLength
    }
  }
`);
