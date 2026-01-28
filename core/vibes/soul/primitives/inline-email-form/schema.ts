import { z } from 'zod';

export const schema = ({
  requiredMessage = 'Email is required',
  invalidMessage = 'Please enter a valid email address',
}: {
  requiredMessage: string;
  invalidMessage: string;
}) =>
  z.object({
    email: z.string({ required_error: requiredMessage }).email({ message: invalidMessage }),
  });
