import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import { 
  useInstantSearch, 
  useSortBy, UseSortByProps
} from 'react-instantsearch';

import { Panel } from '../panel';
import { useCloseDropdown } from '../../hooks/use-close-dropdown';
import { useLockedBody } from '../../hooks/use-locked-body';
import { useMediaQuery } from '../../hooks/use-media-query';

import { cn } from '~/lib/utils';

type MiddlewareProps = {
  isOpened: boolean;
  close: () => void;
};

function DropdownMiddleware({
  isOpened,
  close,
}: MiddlewareProps) {
  const { addMiddlewares } = useInstantSearch();

  useEffect(() =>
    addMiddlewares(() => ({
      onStateChange() {
        // Close the dropdown if it's opened
        if (isOpened) {
          close();
        }
      },
    }))
  );

  return null;
}

export function SortBy(props: UseSortByProps & { label?: string }) {
  const { currentRefinement, options, refine } = useSortBy(props);
  const [isOpened, setIsOpened] = useState(false);
  const panelRef = useRef(null);

  // Close the dropdown when click outside or press the Escape key
  const close = useCallback(() => setIsOpened(false), []);
  useCloseDropdown(panelRef, close, isOpened);

  // Prevent scrolling on mobile when the dropdown is opened
  const isMobile = useMediaQuery('(max-width: 375px)');
  useLockedBody(isOpened && isMobile);

  const text = options.find((option: { label: string; value: string }) => option.value === currentRefinement)?.label || 'Select';

  const header = (
    <button
      type="button"
      className={cn(
        'ais-Dropdown-button',
        props.classNames.button
      )}
      onClick={() => setIsOpened((opened) => !opened)}
    >
      {props.label && <span className={cn('whitespace-nowrap flex-none text-left', props.classNames.buttonLabel)}>{props.label}: </span>}
      <span className={cn('flex-1 whitespace-nowrap truncate text-left', props.classNames.buttonText)}>{text}</span>
      <svg className="flex-none" width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.41 0.290039L6 4.88004L10.59 0.290039L12 1.71004L6 7.71004L0 1.71004L1.41 0.290039Z" fill="#353535" /></svg>
    </button>
  );

  return (
    <Panel
      header={header}
      classNames={{
        root: cn(
          'ais-Dropdown',
          isOpened && 'ais-Dropdown--opened',
          props.classNames.root
        ),
        body: 'overflow-y-auto min-w-[200px] max-h-[320px]'
      }}
      ref={panelRef}
    >
      <DropdownMiddleware
        isOpened={isOpened}
        close={close}
      />
      <h2 className={cn('ais-Dropdown-mobileTitle', props.classNames.mobileTitle)}>
        {props.label}
      </h2>
      <ul>
        {options.map((option: { label: string; value: string }) => (
          <li key={option.value} value={option.value} className={cn(
            'cursor-pointer', 
            props.classNames.item, 
            option.value === currentRefinement && props.classNames.active
          )} onClick={() => refine(option.value)}>
            {option.label}
          </li>
        ))}
      </ul>
    </Panel>
  );
}