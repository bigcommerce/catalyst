export const revalidate = process.env.NEXT_PUBLIC_DEFAULT_REVALIDATE_TARGET
  ? Number(process.env.NEXT_PUBLIC_DEFAULT_REVALIDATE_TARGET)
  : 3600;
