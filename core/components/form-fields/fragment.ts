import { graphql } from '~/client/graphql';

export const FormFieldsFragment = graphql(`
  fragment FormFieldsFragment on FormField {
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
