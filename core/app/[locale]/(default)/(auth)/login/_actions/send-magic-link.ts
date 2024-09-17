'use server';

export const sendMagicLink = async (formData: FormData) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const email = formData.get('email-passwordless') as string;

  await fetch(
    `https://store-${process.env.BIGCOMMERCE_STORE_HASH}-${process.env.BIGCOMMERCE_CHANNEL_ID}.mybigcommerce.com/login.php?action=passwordless_login`,
    {
      method: 'POST',
      body: JSON.stringify({ email, redirect_url: '/account' }),
    },
  );
};
