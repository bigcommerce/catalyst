import { Separator } from '@inquirer/core';
import figures from '@inquirer/figures';
import ansis from 'ansis';

import { Choice, Item, NormalizedChoice, SelectTheme } from './types';

export const selectTheme: SelectTheme = {
  helpMode: 'auto',
  icon: {
    checked: ansis.green(figures.circleFilled),
    unchecked: figures.circle,
    cursor: figures.pointer,
  },
  style: {
    description: (text: string) => ansis.cyan(text),
    disabledChoice: (text: string) => ansis.dim(`- ${text}`),
    renderSelectedChoices: (selectedChoices) =>
      selectedChoices.map((choice) => choice.short).join(', '),
  },
};

export const isSelectable = <Value>(item: Item<Value>): item is NormalizedChoice<Value> =>
  !Separator.isSeparator(item) && !item.disabled;

export const isChecked = <Value>(item: Item<Value>): item is NormalizedChoice<Value> =>
  isSelectable(item) && Boolean(item.checked);

export const toggle = <Value>(item: Item<Value>): Item<Value> =>
  isSelectable(item) ? { ...item, checked: !item.checked } : item;

export const normalizeChoices = <Value>(
  choices: ReadonlyArray<string | Choice<Value> | Separator>,
): Array<Item<Value>> =>
  choices.map((choice) => {
    if (Separator.isSeparator(choice)) {
      return choice;
    }

    if (typeof choice === 'string') {
      return {
        checked: false,
        disabled: false,
        name: choice,
        short: choice,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        value: choice as Value,
      };
    }

    const name = choice.name ?? String(choice.value);

    return {
      checked: choice.checked ?? false,
      description: choice.description,
      disabled: choice.disabled ?? false,
      name,
      short: choice.short ?? name,
      value: choice.value,
    };
  });
