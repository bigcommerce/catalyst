const getStyle = (name: string) =>
  `hsl(${getComputedStyle(document.documentElement).getPropertyValue(name).trim()})`;

export function buildMicroappStyles() {
  return {
    inputBase: { color: getStyle('--foreground'), borderColor: getStyle('--contrast-300') },
    inputValidationError: { borderColor: getStyle('--error') },
    submitButton: { backgroundColor: getStyle('--primary'), color: getStyle('--foreground') },
    label: { color: getStyle('--foreground') },
  };
}
