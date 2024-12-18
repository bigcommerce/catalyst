import { auth } from '~/auth';

export async function b2bLogout() {
  const session = await auth();

  const payload = {
    id: session?.b2bToken,
    name: session?.user?.name,
    email: session?.user?.email,
  };

  await fetch('https://api-b2b.bigcommerce.com/api/io/auth/customers/storefront', {
    method: 'DELETE',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
