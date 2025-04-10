import { draftMode } from 'next/headers';

export const GET = async () => {
  const mode = await draftMode();

  mode.enable();

  return new Response(null, { status: 204 });
};
