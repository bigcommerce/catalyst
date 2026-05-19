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

export const ManifestSchema = z.object({
  name: z.string(),
  dependencies: z.object({ add: z.array(z.string()) }),
  devDependencies: z.object({ add: z.array(z.string()) }),
  environmentVariables: z.array(z.string()),
});

export type Manifest = z.infer<typeof ManifestSchema>;

export const PackageDependenciesSchema = z.object({
  dependencies: z.record(z.string(), z.unknown()),
  devDependencies: z.record(z.string(), z.unknown()),
});

export type PackageDependencies = z.infer<typeof PackageDependenciesSchema>;

export const DeviceCodeSchema = z.object({
  device_code: z.string(),
  user_code: z.string(),
  verification_uri: z.string(),
  expires_in: z.number(),
  interval: z.number(),
});

export type DeviceCode = z.infer<typeof DeviceCodeSchema>;

export const DeviceCodeSuccessSchema = z.object({
  access_token: z.string(),
  store_hash: z.string(),
  context: z.string(),
  api_uri: z.string().url(),
});

export type DeviceCodeSuccess = z.infer<typeof DeviceCodeSuccessSchema>;
