import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Children, isValidElement, ReactNode } from 'react';
import type { SearchResults } from 'algoliasearch-helper';
import type {
  CurrentRefinementsConnectorParamsRefinement,
  CurrentRefinementsRenderState,
} from 'instantsearch.js/es/connectors/current-refinements/connectCurrentRefinements';
import type { UiState } from 'instantsearch.js';
import { useCurrentRefinements, useInstantSearch } from 'react-instantsearch';
import { useRefinementList } from 'react-instantsearch';

import { Panel } from '~/belami/components/panel';
import { useCloseDropdown } from '~/belami/hooks/use-close-dropdown';
import { useLockedBody } from '~/belami/hooks/use-locked-body';
import { useMediaQuery } from '~/belami/hooks/use-media-query';

import { cn } from '~/lib/utils';

export function capitalize(value: string) {
  if (typeof value !== 'string') return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getFirstChildPropValue(
  children: ReactNode,
  propNameCb: (props: any) => string
): string | string[] | undefined {
  let propValue = undefined;

  Children.forEach(children, (element) => {
    if (!isValidElement(element)) return;
    const propName = propNameCb(element.props);
    if (typeof element.props === 'object' && element.props !== null && propName in element.props) {
      propValue = (element.props as { [key: string]: any })[propName];
      return;
    }
  });

  return propValue;
}

export type DropdownProps = PropsWithChildren<{
  buttonText?: string | ((options: DropdownButtonTextOptions) => string);
  classNames?: Partial<DropdownClassNames>;
  closeOnChange?: boolean | (() => boolean);
}>;

export type DropdownButtonTextOptions = {
  results: SearchResults;
  uiState: UiState;
  refinements: CurrentRefinementsConnectorParamsRefinement[];
};

export type DropdownClassNames = {
  root: string;
  button: string;
  buttonRefined: string;
  closeButton: string;
  mobileTitle: string;
};

type MiddlewareProps = Pick<DropdownProps, 'closeOnChange'> & {
  isOpened: boolean;
  close: () => void;
};

function getAttributeRefinements(
  attribute: string,
  items: CurrentRefinementsRenderState['items']
) {
  const item = items.find((item) => item.attribute === attribute);
  return item?.refinements || [];
}

function DropdownMiddleware({
  isOpened,
  closeOnChange,
  close,
}: MiddlewareProps) {
  const { addMiddlewares } = useInstantSearch();

  useEffect(() =>
    addMiddlewares(() => ({
      onStateChange() {
        const shouldCloseOnChange =
          closeOnChange === true ||
          (typeof closeOnChange === 'function' && closeOnChange() === true);

        // Close the dropdown if it's opened and `closeOnChange` is true
        if (isOpened && shouldCloseOnChange) {
          close();
        }
      },
    }))
  );

  return null;
}

export function FacetDropdown({
  children,
  buttonText,
  closeOnChange,
  classNames = {},
}: DropdownProps) {

  const { results, uiState } = useInstantSearch();
  const { items } = useCurrentRefinements(
    {},
    { $$widgetType: 'cmty.facetDropdown' }
  );

  //console.log('Facet Dropdown');

  const [isOpened, setIsOpened] = useState(false);
  const panelRef = useRef(null);

  // Close the dropdown when click outside or press the Escape key
  const close = useCallback(() => setIsOpened(false), []);
  useCloseDropdown(panelRef, close, isOpened);

  // Prevent scrolling on mobile when the dropdown is opened
  const isMobile = useMediaQuery('(max-width: 375px)');
  useLockedBody(isOpened && isMobile);

  // Get the attribute(s) of the first child widget
  const attributeProp = getFirstChildPropValue(children, (props) =>
    'attributes' in props ? 'attributes' : 'attribute'
  );
  if (!attributeProp) {
    throw new Error(
      '<FacetDropdown> widget only supports InstantSearch widgets with an `attribute` or `attributes` prop.'
    );
  }

  // Get the refinements for the attribute
  const attribute =
    typeof attributeProp === 'string' ? attributeProp : attributeProp[0];
  const refinements = getAttributeRefinements(attribute || '', items);
  const isRefined = refinements.length > 0;
  const isDisabled = results.hits.length === 0;

  // Get the header button text
  let text;
  if (typeof buttonText === 'string') {
    text = buttonText;
  } else if (typeof buttonText === 'function') {
    text = buttonText({ results, uiState, refinements });
  } else if (typeof attribute === 'string') {
    text = isRefined
      ? `${capitalize(attribute)} (${refinements.length})`
      : capitalize(attribute);
  }

  const header = (
    <button
      type="button"
      className={cn(
        'ais-Dropdown-button',
        classNames.button,
        isRefined &&
          cn('ais-Dropdown-button--refined', classNames.buttonRefined),
        isDisabled && 'ais-Dropdown-button--disabled'
      )}
      disabled={isDisabled}
      onClick={() => setIsOpened((opened) => !opened)}
    >
      <span>{text}</span>
      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.41 0.290039L6 4.88004L10.59 0.290039L12 1.71004L6 7.71004L0 1.71004L1.41 0.290039Z" fill="#353535" /></svg>
    </button>
  );

  const footer = (
    <button
      className={cn(
        'ais-Dropdown-close ais-Dropdown-button',
        classNames.closeButton
      )}
      onClick={close}
    >
      Apply
    </button>
  );

  //const refinementListData = useRefinementList({attribute: attribute});

  //return (refinementListData && refinementListData.items && refinementListData.items.length > 0 &&
  return (
    <Panel
      header={header}
      footer={footer}
      classNames={{
        root: cn(
          'ais-Dropdown',
          isOpened && 'ais-Dropdown--opened',
          classNames.root
        ),
        body: 'overflow-y-auto max-h-[320px]'
      }}
      ref={panelRef}
    >
      <DropdownMiddleware
        isOpened={isOpened}
        closeOnChange={closeOnChange}
        close={close}
      />
      <h2 className={cn('ais-Dropdown-mobileTitle', classNames.mobileTitle)}>
        {text}
      </h2>
      {children}
    </Panel>
  );
}