'use server';

import { sealData } from 'iron-session/edge';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';

import client from '~/client';
import { sessionOptions } from '~/lib/session';

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

    const encryptedSession = await sealData(
      { customer: { id: customer?.entityId } },
      {
        password: sessionOptions.password,
        ttl: sessionOptions.ttl,
      },
    );

    cookies().set(sessionOptions.cookieName, encryptedSession, {
      maxAge: sessionOptions.ttl,
      httpOnly: true,
      sameSite: 'strict',
    });

    revalidatePath('/');

    return { status: 'success' };
  } catch (e: unknown) {
    if (e instanceof Error || e instanceof z.ZodError) {
      return { status: 'failed', error: e.message };
    }

    return { status: 'failed' };
  }
};
