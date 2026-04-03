import { z } from 'zod';

export const giftCertificateCodeSchema = ({ required_error }: { required_error: string }) =>
  z.object({
    code: z.string({ required_error }).min(1),
  });
