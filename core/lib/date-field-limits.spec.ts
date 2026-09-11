import { describe, expect, it } from 'vitest';

import { getDateFieldBounds, getDisabledDates } from './date-field-limits';

describe('getDateFieldBounds', () => {
  const earliest = '2026-09-15T05:00:00Z';
  const latest = '2026-09-19T05:00:00Z';

  it('maps RANGE to both a min and a max bound', () => {
    expect(getDateFieldBounds('RANGE', earliest, latest)).toEqual({
      minDate: earliest,
      maxDate: latest,
    });
  });

  it('maps EARLIEST_DATE to a min bound only', () => {
    const bounds = getDateFieldBounds('EARLIEST_DATE', earliest, latest);

    expect(bounds.minDate).toBe(earliest);
    expect(bounds.maxDate).toBeUndefined();
  });

  it('maps LATEST_DATE to a max bound only', () => {
    const bounds = getDateFieldBounds('LATEST_DATE', earliest, latest);

    expect(bounds.maxDate).toBe(latest);
    expect(bounds.minDate).toBeUndefined();
  });

  it('maps NO_LIMIT to no bounds', () => {
    expect(getDateFieldBounds('NO_LIMIT', earliest, latest)).toEqual({});
  });

  it('does not invent a bound when the timestamp is null', () => {
    expect(getDateFieldBounds('RANGE', null, latest)).toEqual({
      minDate: undefined,
      maxDate: latest,
    });
  });
});

describe('getDisabledDates', () => {
  const minDate = '2026-09-15T05:00:00Z';
  const maxDate = '2026-09-19T05:00:00Z';

  it('disables days outside the range with separate before/after matchers', () => {
    expect(getDisabledDates({ minDate, maxDate })).toEqual([
      { before: new Date(minDate) },
      { after: new Date(maxDate) },
    ]);
  });

  it('disables only days before the min when there is no max', () => {
    expect(getDisabledDates({ minDate })).toEqual([{ before: new Date(minDate) }]);
  });

  it('disables only days after the max when there is no min', () => {
    expect(getDisabledDates({ maxDate })).toEqual([{ after: new Date(maxDate) }]);
  });

  it('returns undefined when there are no bounds', () => {
    expect(getDisabledDates({})).toBeUndefined();
  });
});
