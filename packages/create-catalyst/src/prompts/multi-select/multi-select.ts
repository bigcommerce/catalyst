import {
  createPrompt,
  isBackspaceKey,
  isDownKey,
  isEnterKey,
  isNumberKey,
  isSpaceKey,
  isUpKey,
  makeTheme,
  Separator,
  type Status,
  useEffect,
  useKeypress,
  useMemo,
  usePagination,
  usePrefix,
  useRef,
  useState,
  ValidationError,
} from '@inquirer/core';
import ansiEscapes from 'ansi-escapes';

import { isChecked, isSelectable, normalizeChoices, selectTheme, toggle } from './helpers';
import { Item, MultiSelectConfig, SelectTheme } from './types';

export const multiSelect = createPrompt(
  <Value>(config: MultiSelectConfig<Value>, done: (value: Value[]) => void) => {
    const theme = makeTheme<SelectTheme>(selectTheme, config.theme);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const firstRender = useRef(true);
    const [items, setItems] = useState<ReadonlyArray<Item<Value>>>(
      normalizeChoices(config.choices),
    );
    const [status, setStatus] = useState<Status>('idle');
    const [errorMsg, setError] = useState<string>();
    const prefix = usePrefix({ status, theme });
    const { instructions, loop = true, pageSize = 7, required, validate = () => true } = config;

    const bounds = useMemo(() => {
      const first = items.findIndex(isSelectable);
      const last = items.findLastIndex(isSelectable);

      if (first === -1) {
        throw new ValidationError(
          '[multi select prompt] No selectable choices. All choices are disabled.',
        );
      }

      return { first, last };
    }, [items]);

    const [showHelpTip, setShowHelpTip] = useState(true);
    const [active, setActive] = useState(bounds.first);

    useEffect(
      () => () => {
        clearTimeout(searchTimeoutRef.current);
      },
      [],
    );

    // eslint-disable-next-line complexity
    useKeypress(async (key, rl) => {
      clearTimeout(searchTimeoutRef.current);

      if (isEnterKey(key)) {
        const selection = items.filter(isChecked);
        const isValid = await validate([...selection]);

        if (required && !items.some(isChecked)) {
          setError('At least one choice must be selected');
        } else if (isValid === true) {
          setStatus('done');
          done(selection.map((choice) => choice.value));
        } else {
          setError(isValid || 'You must select a valid value');
        }
      } else if (isUpKey(key) || isDownKey(key)) {
        rl.clearLine(0);

        if (
          loop ||
          (isUpKey(key) && active !== bounds.first) ||
          (isDownKey(key) && active !== bounds.last)
        ) {
          const offset = isUpKey(key) ? -1 : 1;
          let next = active;

          do {
            next = (next + offset + items.length) % items.length;
          } while (!isSelectable(items[next]));

          setActive(next);
        }
      } else if (isNumberKey(key)) {
        rl.clearLine(0);

        const position = Number(key.name) - 1;

        if (isSelectable(items[position])) {
          setActive(position);
        }
      } else if (isBackspaceKey(key)) {
        rl.clearLine(0);
      } else if (isSpaceKey(key)) {
        rl.clearLine(0);
        setShowHelpTip(false);

        const nextItems = items.map((choice, i) => (i === active ? toggle(choice) : choice));
        const selection = nextItems.filter(isChecked);
        const isValid = await validate([...selection]);

        if (isValid === true) {
          setError(undefined);
          setItems(nextItems);
        } else {
          setError(isValid || 'You must select a valid value');
        }
      } else {
        // Default to search
        const searchTerm = rl.line.toLowerCase();
        const matchIndex = items.findIndex((item) =>
          Separator.isSeparator(item) || !isSelectable(item)
            ? false
            : item.name.toLowerCase().startsWith(searchTerm),
        );

        if (matchIndex !== -1) {
          setActive(matchIndex);
        }

        searchTimeoutRef.current = setTimeout(() => {
          rl.clearLine(0);
        }, 700);
      }
    });

    const message = theme.style.message(config.message, status);

    let helpTipTop = '';
    let helpTipBottom = '';
    let description: string | undefined;

    if (
      theme.helpMode === 'always' ||
      (theme.helpMode === 'auto' && showHelpTip && (instructions === undefined || instructions))
    ) {
      if (typeof instructions === 'string') {
        helpTipTop = instructions;
      } else {
        const keys = [
          `${theme.style.key('space')} to select`,
          `${theme.style.key('enter')} to proceed`,
        ];

        helpTipTop = ` (Press ${keys.filter((key) => key !== '').join(', ')})`;
      }

      if (
        items.length > pageSize &&
        (theme.helpMode === 'always' ||
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          (theme.helpMode === 'auto' && firstRender.current))
      ) {
        helpTipBottom = `\n${theme.style.help('(Use arrow keys to reveal more choices)')}`;
        firstRender.current = false;
      }
    }

    const page = usePagination({
      items,
      active,
      renderItem({ item, isActive }) {
        if (Separator.isSeparator(item)) {
          return ` ${item.separator}`;
        }

        if (item.disabled) {
          return theme.style.disabledChoice(
            `${item.name} ${typeof item.disabled === 'string' ? item.disabled : '(disabled)'}`,
          );
        }

        if (isActive) {
          description = item.description;
        }

        const checkbox = item.checked ? theme.icon.checked : theme.icon.unchecked;
        const color = isActive ? theme.style.highlight : (x: string) => x;
        const cursor = isActive ? theme.icon.cursor : ` `;

        return color(`${cursor}${checkbox} ${item.name}`);
      },
      pageSize,
      loop,
    });

    if (status === 'done') {
      return `${prefix} ${message} ${theme.style.answer(theme.style.renderSelectedChoices(items.filter(isChecked), items))}`;
    }

    const selectedChoices =
      items.filter(isChecked).length > 0
        ? ` (${theme.style.answer(theme.style.renderSelectedChoices(items.filter(isChecked), items))})`
        : '';
    const choiceDescription = description ? `\n${theme.style.description(description)}` : ``;

    let error = '';

    if (errorMsg) {
      error = `\n${theme.style.error(errorMsg)}`;
    }

    return `${prefix} ${message}${selectedChoices}${helpTipTop}\n${page}${helpTipBottom}${choiceDescription}${error}${ansiEscapes.cursorHide}`;
  },
);

export { Separator } from '@inquirer/core';
