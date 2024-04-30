'use server';

import { z } from 'zod';

import {
  ContactUsSchema,
  submitContactForm as submitContactFormClient,
} from '~/client/mutations/submit-contact-form';

interface SubmitContactForm {
  formData: FormData;
  pageEntityId: number;
  reCaptchaToken: string;
}

export const submitContactForm = async ({
  formData,
  pageEntityId,
  reCaptchaToken,
}: SubmitContactForm) => {
  try {
    const parsedData = ContactUsSchema.parse({
      email: formData.get('email'),
      comments: formData.get('comments'),
      companyName: formData.get('companyname'),
      fullName: formData.get('fullname'),
      phoneNumber: formData.get('phone'),
      orderNumber: formData.get('orderno'),
      rmaNumber: formData.get('rma'),
    });

    const response = await submitContactFormClient({
      formFields: parsedData,
      pageEntityId,
      reCaptchaToken,
    });

    if (response.errors.length === 0) {
      return { status: 'success', data: parsedData };
    }

    return {
      status: 'error',
      error: response.errors.map((error) => error.message).join('\n'),
    };
  } catch (error: unknown) {
    if (error instanceof Error || error instanceof z.ZodError) {
      return { status: 'error', error: error.message };
    }

    return { status: 'error', error: 'Unknown error.' };
  }
};
