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

    if (response.submitContactUs.errors.length === 0) {
      return { status: 'success', data: parsedData };
    }

    return {
      status: 'failed',
      error: response.submitContactUs.errors.map((error) => error.message).join('\n'),
    };
  } catch (e: unknown) {
    if (e instanceof Error || e instanceof z.ZodError) {
      return { status: 'failed', error: e.message };
    }

    return { status: 'failed', error: 'Unknown error' };
  }
};
