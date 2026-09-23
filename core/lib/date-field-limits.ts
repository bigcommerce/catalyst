import { type Matcher } from 'react-day-picker';

type LimitDateBy = 'EARLIEST_DATE' | 'LATEST_DATE' | 'NO_LIMIT' | 'RANGE';

interface DateBounds {
  minDate?: string;
  maxDate?: string;
}

export function getDateFieldBounds(
  limitDateBy: LimitDateBy,
  earliest?: string | null,
  latest?: string | null,
): DateBounds {
  switch (limitDateBy) {
    case 'RANGE':
      return { minDate: earliest ?? undefined, maxDate: latest ?? undefined };

    case 'EARLIEST_DATE':
      return { minDate: earliest ?? undefined };

    case 'LATEST_DATE':
      return { maxDate: latest ?? undefined };

    case 'NO_LIMIT':
      return {};
  }
}

export function getDisabledDates({ minDate, maxDate }: DateBounds): Matcher[] | undefined {
  const matchers: Matcher[] = [];

  if (minDate != null) {
    matchers.push({ before: new Date(minDate) });
  }

  if (maxDate != null) {
    matchers.push({ after: new Date(maxDate) });
  }

  return matchers.length > 0 ? matchers : undefined;
}
