import { FieldMetadata, FormMetadata } from '@conform-to/react';
import { createContext, useContext, useEffect } from 'react';
import { z } from 'zod';

import { ModalFormState } from '.';

interface ModalFormContext<T extends z.ZodTypeAny> {
  state: ModalFormState;
  fields: Record<keyof z.infer<T>, FieldMetadata<unknown, z.infer<T>>>;
  form: FormMetadata<z.infer<T>>;
  schema?: z.ZodTypeAny;
  setSchema?: (schema?: z.infer<T>) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ModalFormContext = createContext<ModalFormContext<any> | undefined>(undefined);

export function useModalForm<T extends z.ZodTypeAny>(
  schema: T,
): Omit<ModalFormContext<T>, 'schema' | 'setSchema'> {
  const context = useContext<ModalFormContext<T> | undefined>(ModalFormContext);

  if (context === undefined) {
    throw new Error('useModalForm must be used within a Modal form');
  }

  useEffect(() => {
    if (!context.schema) {
      context.setSchema?.(schema);
    }
  }, [context, schema]);

  return { fields: context.fields, state: context.state, form: context.form };
}
