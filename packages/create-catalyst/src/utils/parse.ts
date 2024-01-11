import * as z from 'zod';
import { fromZodError } from 'zod-validation-error';

export const parse = <T>(data: unknown, schema: z.Schema<T>): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(fromZodError(error).toString());
    }

    process.exit(1);
  }
};
