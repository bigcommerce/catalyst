import * as z from 'zod';

import { PageContent } from './PageContent';

const SearchParamSchema = z.union([z.string(), z.array(z.string()), z.undefined()]);

const SearchParamToArray = SearchParamSchema.transform((value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return [value];
  }

  return undefined;
});

const LoginParamsSchema = z.object({
  action: SearchParamToArray.transform((param) => {
    if (param) {
      const parsed = z
        .union([z.literal('reset_password'), z.literal('create_account'), z.undefined()])
        .safeParse(param[param.length - 1]);

      if (parsed.success) {
        return parsed.data;
      }
    }
  }),
});

interface Props {
  searchParams: { [key: string]: z.infer<typeof SearchParamToArray> };
}

export default function Login({ searchParams }: Props) {
  const { action } = LoginParamsSchema.parse(searchParams);

  switch (action) {
    case 'reset_password': {
      return (
        <>
          <h2 className="mb-3 text-h2">Reset Password</h2>
          {/* TODO: implement reset form */}
        </>
      );
    }

    case 'create_account': {
      return (
        <>
          <h2 className="mb-3 text-h2">New Account</h2>
          {/* TODO: implement  createAccount form */}
        </>
      );
    }

    default:
      return (
        <div className="mx-auto mb-12 flex lg:mb-14">
          <PageContent />
        </div>
      );
  }
}

export const runtime = 'edge';
