export const hsl = (hslValues: string, percentage?: number) =>
  `hsl(${hslValues}${percentage ? ` / ${percentage}` : ''})`;
