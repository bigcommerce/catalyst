import { graphql, VariablesOf } from '~/client/graphql';

// Faking mutation to get input type
// Not ideal but best way to make sure input type is up to date
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FakeMutation = graphql(`
  mutation UpdateCustomerMutation($input: UpdateCustomerInput!, $reCaptchaV2: ReCaptchaV2Input) {
    customer {
      updateCustomer(input: $input, reCaptchaV2: $reCaptchaV2) {
        customer {
          firstName
        }
      }
    }
  }
`);

type FormFieldsType = VariablesOf<typeof FakeMutation>['input']['formFields'];

interface ReturnedFormData {
  [k: string]: unknown;
  formFields: Record<string, unknown>;
}

const updateFormFields = ({
  formFields,
  fieldType,
  fieldEntityId,
  fieldValue,
}: {
  formFields: FormFieldsType;
  fieldType: string;
  fieldEntityId: number;
  fieldValue: string;
}) => {
  const customFormFields = formFields ?? {};

  if (fieldValue.length === 0) {
    return customFormFields;
  }

  switch (fieldType) {
    case 'texts': {
      const definedTexts = customFormFields[fieldType];
      const newText = {
        text: fieldValue,
        fieldEntityId,
      };

      customFormFields[fieldType] = definedTexts ? [...definedTexts, newText] : [newText];

      break;
    }

    case 'passwords': {
      const definedPasswords = customFormFields[fieldType];
      const newPassword = {
        password: fieldValue,
        fieldEntityId,
      };

      customFormFields[fieldType] = definedPasswords
        ? [...definedPasswords, newPassword]
        : [newPassword];

      break;
    }

    case 'checkboxes': {
      const definedCheckboxes = customFormFields[fieldType];
      const newCheckbox = {
        fieldValueEntityIds: [Number(fieldValue)],
        fieldEntityId,
      };
      const previouslyParsedCheckbox = definedCheckboxes?.find(
        (defined) => fieldEntityId === defined.fieldEntityId,
      );

      if (previouslyParsedCheckbox) {
        previouslyParsedCheckbox.fieldValueEntityIds.push(Number(fieldValue));

        break;
      }

      customFormFields[fieldType] = definedCheckboxes
        ? [...definedCheckboxes, newCheckbox]
        : [newCheckbox];

      break;
    }

    case 'multipleChoices': {
      const definedMultipleChoices = customFormFields[fieldType];
      const newMultipleChoice = {
        fieldValueEntityId: Number(fieldValue),
        fieldEntityId,
      };

      customFormFields[fieldType] = definedMultipleChoices
        ? [...definedMultipleChoices, newMultipleChoice]
        : [newMultipleChoice];

      break;
    }

    case 'multilineTexts': {
      const definedMultilineTexts = customFormFields[fieldType];
      const newMultilineText = {
        multilineText: fieldValue,
        fieldEntityId,
      };

      customFormFields[fieldType] = definedMultilineTexts
        ? [...definedMultilineTexts, newMultilineText]
        : [newMultilineText];

      break;
    }

    case 'numbers': {
      const definedNumbers = customFormFields[fieldType];
      const newNumber = {
        number: Number(fieldValue),
        fieldEntityId,
      };

      customFormFields[fieldType] = definedNumbers ? [...definedNumbers, newNumber] : [newNumber];

      break;
    }

    case 'dates': {
      const definedDates = customFormFields[fieldType];
      const [mm, day, year] = fieldValue.split('/');
      const month = Number(mm) - 1;
      const date = new Date(Date.UTC(Number(year), month, Number(day))).toISOString();
      const newDate = {
        date,
        fieldEntityId,
      };

      customFormFields[fieldType] = definedDates ? [...definedDates, newDate] : [newDate];

      break;
    }
  }

  return customFormFields;
};

const isFormFieldsType = (data: unknown): data is FormFieldsType => {
  if (
    typeof data === 'object' &&
    data !== null &&
    ('texts' in data ||
      'checkboxes' in data ||
      'multipleChoices' in data ||
      'numbers' in data ||
      'dates' in data ||
      'passwords' in data)
  ) {
    return true;
  }

  return false;
};

export const parseAccountFormData = (accountFormData: FormData): unknown =>
  [...accountFormData.entries()].reduce<Record<string, unknown>>((parsedData, [name, value]) => {
    // files are not supported in Form Fields
    if (typeof value !== 'string') {
      return parsedData;
    }

    const key = name.split('-').at(-1) ?? '';
    const sections = name.split('-').slice(0, -1);

    if (sections.includes('customer')) {
      parsedData[key] = value;

      return parsedData;
    }

    if (sections.includes('address')) {
      parsedData[key] = value;

      return parsedData;
    }

    // merchant defined Form Fields
    if (sections.some((section) => section.startsWith('custom_'))) {
      parsedData.formFields = updateFormFields({
        formFields: isFormFieldsType(parsedData.formFields) ? parsedData.formFields : null,
        fieldType: sections[1] ?? '',
        fieldEntityId: Number(key),
        fieldValue: value,
      });
    }

    return parsedData;
  }, {});

export const parseRegisterCustomerFormData = (registerFormData: FormData): unknown =>
  [...registerFormData.entries()].reduce<ReturnedFormData>(
    (parsedData, [name, value]) => {
      // files are not supported in Form Fields
      if (typeof value !== 'string') {
        return parsedData;
      }

      const key = name.split('-').at(-1) ?? '';
      const sections = name.split('-').slice(0, -1);

      if (sections.includes('customer')) {
        parsedData[key] = value;
      }

      if (sections.some((section) => section.startsWith('custom_customer'))) {
        parsedData.formFields = updateFormFields({
          formFields: isFormFieldsType(parsedData.formFields) ? parsedData.formFields : null,
          fieldType: sections[1] ?? '',
          fieldEntityId: Number(key),
          fieldValue: value,
        });
      }

      return parsedData;
    },
    { formFields: {} },
  );
