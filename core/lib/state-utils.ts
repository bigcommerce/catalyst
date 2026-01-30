/**
 * Separator used in composite state values.
 * We use a pipe character to avoid conflicts with hyphens that may appear in abbreviations.
 */
const STATE_VALUE_SEPARATOR = '|';

/**
 * Creates a composite state value from entityId and abbreviation.
 * This format ensures unique values for Radix UI Select components.
 *
 * @param {number} entityId - The state entity ID
 * @param {string} abbreviation - The state abbreviation
 * @returns {string} A composite value in the format "entityId|abbreviation"
 */
export function createStateValue(entityId: number, abbreviation: string): string {
  return `${entityId}${STATE_VALUE_SEPARATOR}${abbreviation}`;
}

/**
 * Extracts the state abbreviation from a composite state value.
 *
 * @param {string | undefined} compositeValue - The composite value in format "entityId|abbreviation"
 * @returns {string | undefined} The state abbreviation, or undefined if the value is invalid
 */
export function parseStateAbbreviation(compositeValue: string | undefined): string | undefined {
  if (!compositeValue) {
    return undefined;
  }

  const separatorIndex = compositeValue.indexOf(STATE_VALUE_SEPARATOR);

  if (separatorIndex === -1) {
    return undefined;
  }

  return compositeValue.slice(separatorIndex + 1);
}
