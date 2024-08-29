export const revalidate = process.env.DEFAULT_REVALIDATE_TARGET
  ? Number(process.env.DEFAULT_REVALIDATE_TARGET)
  : 3600;
