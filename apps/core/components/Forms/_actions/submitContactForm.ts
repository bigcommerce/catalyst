/* eslint-disable  @typescript-eslint/require-await */

'use server';

import { z } from 'zod';

const ContactUsSchema = z.object({
  companyName: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  orderNumber: z.string().optional(),
  rmaNumber: z.string().optional(),
  email: z.string().email(),
  comments: z.string().trim().nonempty(),
});

export const submitContactForm = async (
  formData: FormData,
): Promise<{ status: 'success' | 'failed' }> => {
  try {
    const parsedData = ContactUsSchema.parse({
      email: formData.get('email'),
      comments: formData.get('comments'),
      companyName: formData.get('Company name'),
      fullName: formData.get('Full name'),
      phone: formData.get('Phone'),
      orderNumber: formData.get('Order number'),
      rmaNumber: formData.get('RMA number'),
    });

    console.log('contact us data', parsedData);
    // TODO: add graphql mutation on submit;

    return { status: 'success' };
  } catch (e) {
    return { status: 'failed' };
  }
};
