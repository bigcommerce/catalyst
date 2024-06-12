import * as z from 'zod';

export const ManifestSchema = z.object({
  name: z.string(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  environmentVariables: z.array(z.string()).optional(),
});

export const GitHubContentResponse = z.array(
  z.object({
    name: z.string(),
  }),
);

export const EnvironmentVariableStringSchema = z
  .string()
  .refine((str) => str.includes('=') && str.length > 1, {
    message: 'Each string must contain at least one character and an equal sign',
  });

export const EnvironmentVariableOptionSchema = z.array(EnvironmentVariableStringSchema).min(1, {
  message: 'Array must contain at least one string',
});
