const getStyle = (name: string) =>
  `hsl(${getComputedStyle(document.documentElement).getPropertyValue(name).trim()})`;

const getRawStyle = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

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

export function buildMicroappStyles(): AppStyles {
  const roundedLg = getComputedClassStyles('rounded-lg', ['border-radius'])['border-radius'];
  const roundedFull = getComputedClassStyles('rounded-full', ['border-radius'])['border-radius'];
  const semibold = getComputedClassStyles('font-semibold', ['font-weight'])['font-weight'];
  const formRowGap = getComputedClassStyles('gap-4', ['gap']).gap;
  const formActionsGap = getComputedClassStyles('gap-1', ['gap']).gap;
  const formActionsMarginTop = getComputedClassStyles('mt-3', ['margin-top'])['margin-top'];
  const headingMarginBottom = getComputedClassStyles('mb-2', ['margin-bottom'])['margin-bottom'];

  return {
    inputBase: {
      backgroundColor: getStyle('--background'),
      color: getStyle('--foreground'),
      borderColor: getStyle('--contrast-100'),
      fontFamily: getRawStyle('--font-family-body'),
      fontSize: getRawStyle('--font-size-sm'),
      borderRadius: roundedLg,
    },
    inputValidationError: { borderColor: getStyle('--error') },
    inputValidationSuccess: { borderColor: getStyle('--contrast-100'), backgroundImage: 'none' },
    validationError: {
      color: getStyle('--error'),
      fontFamily: getRawStyle('--font-family-body'),
      fontSize: getRawStyle('--font-size-xs'),
    },
    label: {
      color: getStyle('--contrast-500'),
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
      backgroundColor: getStyle('--primary'),
      borderColor: getStyle('--primary'),
      color: getStyle('--foreground'),
      borderRadius: roundedFull,
      fontFamily: getRawStyle('--font-family-body'),
      fontWeight: semibold,
      fontSize: getRawStyle('--font-size-sm'),
    },
    cancelButton: {
      backgroundColor: getStyle('--background'),
      borderColor: getStyle('--contrast-200'),
      color: getStyle('--foreground'),
      borderRadius: roundedFull,
      fontFamily: getRawStyle('--font-family-body'),
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
