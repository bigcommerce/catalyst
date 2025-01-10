import { FragmentOf, graphql } from '~/client/graphql';

export type FormField = NonNullable<FragmentOf<typeof FormFieldsFragment>>;

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

export type FormFieldValue = NonNullable<FragmentOf<typeof FormFieldValuesFragment>>;

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
