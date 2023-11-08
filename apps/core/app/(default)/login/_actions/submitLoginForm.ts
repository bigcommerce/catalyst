'use server';

import { z } from 'zod';

import client from '~/client';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().nonempty(),
});

export const submitLoginForm = async (formData: FormData) => {
  try {
    const { email, password } = LoginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const customer = await client.login(email, password);

    return { status: 'success', data: customer };
  } catch (e: unknown) {
    if (e instanceof Error || e instanceof z.ZodError) {
      return { status: 'failed', error: e.message };
    }

    return { status: 'failed' };
  }
};
