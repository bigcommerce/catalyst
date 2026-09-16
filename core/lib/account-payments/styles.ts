// Returns the value of the first set variable in the list (e.g. font stacks, font sizes),
// unchanged. Falls back through the list in order; last one is the guaranteed default.
const getRawStyle = (...names: string[]) => {
  const styles = getComputedStyle(document.documentElement);

  return names.map((name) => styles.getPropertyValue(name).trim()).find(Boolean) ?? '';
};

// Same fallback idea as `getRawStyle`, but for colors. The last name is always Catalyst's
// plain base color (just raw numbers, needs `hsl(...)` to become a real color). Any earlier
// name is a merchant's own color override, which is already a complete color if they set one
// — so only the base fallback gets wrapped in `hsl(...)`; an override is returned as-is.
const getStyle = (...names: string[]) => {
  const styles = getComputedStyle(document.documentElement);
  const overrideNames = names.slice(0, -1);
  const baseTokenName = names.at(-1) ?? '';

  const override = overrideNames.map((name) => styles.getPropertyValue(name).trim()).find(Boolean);

  if (override) return override;

  return `hsl(${styles.getPropertyValue(baseTokenName).trim()})`;
};

const getComputedClassStyles = (className: string, properties: string[]) => {
  const probe = document.createElement('div');

  probe.className = className;
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  document.body.appendChild(probe);

  const computed = getComputedStyle(probe);
  const values = Object.fromEntries(
    properties.map((property) => [property, computed.getPropertyValue(property)]),
  );

  probe.remove();

  return values;
};

export function buildMicroappStyles(): AccountPaymentsAppStyles {
  const roundedLg = getComputedClassStyles('rounded-lg', ['border-radius'])['border-radius'];
  const roundedFull = getComputedClassStyles('rounded-full', ['border-radius'])['border-radius'];
  const semibold = getComputedClassStyles('font-semibold', ['font-weight'])['font-weight'];
  const formRowGap = getComputedClassStyles('gap-4', ['gap']).gap;
  const formActionsGap = getComputedClassStyles('gap-1', ['gap']).gap;
  const formActionsMarginTop = getComputedClassStyles('mt-3', ['margin-top'])['margin-top'];
  const headingMarginBottom = getComputedClassStyles('mb-2', ['margin-bottom'])['margin-bottom'];
  const buttonFontFamily = getRawStyle('--button-font-family', '--font-family-body');

  return {
    inputBase: {
      backgroundColor: getStyle('--input-light-background', '--background'),
      color: getStyle('--input-light-text', '--foreground'),
      borderColor: getStyle('--input-light-border', '--contrast-100'),
      fontFamily: getRawStyle('--font-family-body'),
      fontSize: getRawStyle('--font-size-sm'),
      borderRadius: roundedLg,
    },
    inputValidationError: { borderColor: getStyle('--input-light-border-error', '--error') },
    inputValidationSuccess: { borderColor: getStyle('--contrast-100'), backgroundImage: 'none' },
    validationError: {
      color: getStyle('--field-error', '--error'),
      fontFamily: getRawStyle('--font-family-body'),
      fontSize: getRawStyle('--font-size-xs'),
    },
    label: {
      color: getStyle('--label-light-text', '--contrast-500'),
      fontFamily: getRawStyle('--font-family-mono'),
      fontSize: getRawStyle('--font-size-xs'),
      textTransform: 'uppercase',
    },
    heading: {
      color: getStyle('--foreground'),
      fontFamily: getRawStyle('--font-family-heading'),
      fontWeight: semibold,
      marginBottom: headingMarginBottom,
    },
    submitButton: {
      backgroundColor: getStyle('--button-primary-background', '--primary'),
      borderColor: getStyle('--button-primary-border', '--primary'),
      color: getStyle('--button-primary-text', '--foreground'),
      borderRadius: roundedFull,
      fontFamily: buttonFontFamily,
      fontWeight: semibold,
      fontSize: getRawStyle('--font-size-sm'),
    },
    cancelButton: {
      backgroundColor: getStyle('--button-tertiary-background', '--background'),
      borderColor: getStyle('--button-tertiary-border', '--contrast-200'),
      color: getStyle('--button-tertiary-text', '--foreground'),
      borderRadius: roundedFull,
      fontFamily: buttonFontFamily,
      fontWeight: semibold,
      fontSize: getRawStyle('--font-size-sm'),
    },
    formRow: { display: 'flex', flexWrap: 'wrap', gap: formRowGap, justifyContent: 'flex-start' },
    formActions: {
      display: 'flex',
      gap: formActionsGap,
      marginTop: formActionsMarginTop,
      textAlign: 'left',
    },
  };
}
