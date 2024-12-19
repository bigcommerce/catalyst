interface Section {
  title?: string;
}

export function mergeSections<S extends Section>(
  defaultSections: S[],
  overrides: S[],
  mergeSection: (l: S, r: S) => S,
): S[] {
  const defaultKeys = new Set(defaultSections.map((section) => section.title));
  const overridesMap = new Map(overrides.map((section) => [section.title, section]));

  return [
    ...defaultSections.map((section) => {
      const override = overridesMap.get(section.title ?? '');

      return override ? mergeSection(section, override) : section;
    }),
    ...overrides.filter((section) => !defaultKeys.has(section.title ?? '')),
  ];
}
