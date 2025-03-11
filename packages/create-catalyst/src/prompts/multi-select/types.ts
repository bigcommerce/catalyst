import { Separator, type Theme } from '@inquirer/core';
import type { PartialDeep } from '@inquirer/type';

export interface SelectTheme {
  helpMode: 'always' | 'never' | 'auto';
  icon: {
    checked: string;
    unchecked: string;
    cursor: string;
  };
  style: {
    description: (text: string) => string;
    disabledChoice: (text: string) => string;
    renderSelectedChoices: <T>(
      selectedChoices: ReadonlyArray<NormalizedChoice<T>>,
      allChoices: ReadonlyArray<NormalizedChoice<T> | Separator>,
    ) => string;
  };
}

export interface Choice<Value> {
  checked?: boolean;
  description?: string;
  disabled?: boolean | string;
  name?: string;
  short?: string;
  type?: never;
  value: Value;
}

export interface NormalizedChoice<Value> {
  checked: boolean;
  description?: string;
  disabled: boolean | string;
  name: string;
  short: string;
  value: Value;
}

export interface MultiSelectConfig<
  Value,
  ChoicesObject = ReadonlyArray<string | Separator> | ReadonlyArray<Choice<Value> | Separator>,
> {
  choices: ChoicesObject extends ReadonlyArray<string | Separator>
    ? ChoicesObject
    : ReadonlyArray<Choice<Value> | Separator>;
  default?: unknown;
  instructions?: string | boolean;
  loop?: boolean;
  message: string;
  pageSize?: number;
  required?: boolean;
  theme?: PartialDeep<Theme<SelectTheme>>;
  validate?: (
    choices: ReadonlyArray<Choice<Value>>,
  ) => boolean | string | Promise<string | boolean>;
}

export type Item<Value> = NormalizedChoice<Value> | Separator;
