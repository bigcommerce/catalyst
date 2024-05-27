import { UpdateCustomerAddressInput } from '~/client/mutations/update-customer-address';

type FormFieldsType = UpdateCustomerAddressInput['data']['formFields'];
type ReturnedFormData = Record<string, unknown>;

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
      const customTexts = customFormFields[fieldType];

      const fieldData = {
        text: fieldValue,
        fieldEntityId,
      };

      customFormFields[fieldType] = customTexts ? [...customTexts, fieldData] : [fieldData];

      break;
    }

    case 'passwords': {
      const customPasswords = customFormFields[fieldType];

      const fieldData = {
        password: fieldValue,
        fieldEntityId,
      };

      customFormFields[fieldType] = customPasswords ? [...customPasswords, fieldData] : [fieldData];

      break;
    }

    case 'checkboxes': {
      const customCheckboxes = customFormFields[fieldType];

      const fieldData = {
        fieldValueEntityIds: [Number(fieldValue)],
        fieldEntityId,
      };

      customFormFields[fieldType] = customCheckboxes
        ? [...customCheckboxes, fieldData]
        : [fieldData];

      break;
    }

<<<<<<< HEAD
    case 'multilineTexts': {
      const customMultilineTexts = customFormFields[fieldType];

      const fieldData = {
        multilineText: fieldValue,
        fieldEntityId,
      };

      customFormFields[fieldType] = customMultilineTexts
        ? [...customMultilineTexts, fieldData]
        : [fieldData];

      break;
    }

=======
>>>>>>> f743f42a (feat(core): add numbers-only field & utils for account form fields)
    case 'multipleChoices': {
      const customMultipleChoices = customFormFields[fieldType];

      const fieldData = {
        fieldValueEntityId: Number(fieldValue),
        fieldEntityId,
      };

      customFormFields[fieldType] = customMultipleChoices
        ? [...customMultipleChoices, fieldData]
        : [fieldData];

      break;
    }

    case 'numbers': {
      const customNumbers = customFormFields[fieldType];

      const fieldData = {
        number: Number(fieldValue),
        fieldEntityId,
      };

      customFormFields[fieldType] = customNumbers ? [...customNumbers, fieldData] : [fieldData];

      break;
    }

    case 'dates': {
      const customDates = customFormFields[fieldType];

      const [day, mm, year] = fieldValue.split('/');
      const month = Number(mm) - 1;
      const date = new Date(Date.UTC(Number(year), month, Number(day))).toISOString();
      const fieldData = {
        date,
        fieldEntityId,
      };

      customFormFields[fieldType] = customDates ? [...customDates, fieldData] : [fieldData];

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
  [...accountFormData.entries()].reduce<ReturnedFormData>((parsedData, [name, value]) => {
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
    if (sections.every((section) => section.startsWith('custom_'))) {
      const customFieldType = sections[0]?.split('_').at(-1) ?? '';

      parsedData.formFields = updateFormFields({
        formFields: isFormFieldsType(parsedData.formFields) ? parsedData.formFields : null,
        fieldType: customFieldType,
        fieldEntityId: Number(key),
        fieldValue: value,
      });
    }

    return parsedData;
  }, {});
