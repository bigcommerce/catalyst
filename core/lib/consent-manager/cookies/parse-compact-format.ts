/**
 * Parses the compact format: i.t:1765485149496,c.necessary:1,c.functionality:1,etc.
 *
 * @param {string} raw - The raw compact format string
 * @returns {Record<string, string | number>} Parsed object with keys and values
 */
export function parseCompactFormat(raw: string): Record<string, string | number> {
  const pairs = raw.split(',');
  const result: Record<string, string | number> = {};

  pairs.forEach((pair) => {
    const [key, value] = pair.split(':');

    if (key && value !== undefined) {
      // Try to parse as number, otherwise keep as string
      const numValue = Number(value);
      const trimmedKey = key.trim();
      const trimmedValue = value.trim();

      result[trimmedKey] = Number.isNaN(numValue) ? trimmedValue : numValue;
    }
  });

  return result;
}
