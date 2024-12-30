import {
  PropsWithChildren,
  useRef,
} from 'react';
import { Children, isValidElement, ReactNode } from 'react';
import type { SearchResults } from 'algoliasearch-helper';
import type {
  CurrentRefinementsConnectorParamsRefinement,
  CurrentRefinementsRenderState,
} from 'instantsearch.js/es/connectors/current-refinements/connectCurrentRefinements';
import type { UiState } from 'instantsearch.js';
import { useCurrentRefinements, useInstantSearch } from 'react-instantsearch';

import { Panel } from '~/belami/components/panel';

export type FacetProps = PropsWithChildren<{
  title?: string,
  classNames?: Partial<DropdownClassNames>
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

export function getFirstChildPropValue(
  children: ReactNode,
  propNameCb: (props: any) => string
): string | string[] | undefined {
  let propValue = undefined;

  Children.forEach(children, (element: any) => {
    if (!isValidElement(element)) return;
    const propName = propNameCb(element.props);
    if (propName in (element.props as any)) {
      propValue = (element.props as any)[propName] || null;
      return;
    }
  });

  return propValue;
}

function getAttributeRefinements(
  attribute: string,
  items: CurrentRefinementsRenderState['items']
) {
  const item = items.find((item) => item.attribute === attribute);
  return item?.refinements || [];
}

export function Facet({
  children,
  title, 
  classNames = {},
}: FacetProps) {

  //console.log('Facet');

  const { results, uiState } = useInstantSearch();
  const { items } = useCurrentRefinements(
    {},
    { $$widgetType: 'cmty.facet' }
  );
  const panelRef = useRef(null);

  // Get the attribute(s) of the first child widget
  const attributeProp = getFirstChildPropValue(children, (props) =>
    'attributes' in props ? 'attributes' : 'attribute'
  );

  if (!attributeProp) {
    throw new Error(
      '<Facet> widget only supports InstantSearch widgets with an `attribute` or `attributes` prop.'
    );
  }

  // Get the refinements for the attribute
  const attribute =
    typeof attributeProp === 'string' ? attributeProp : attributeProp[0];
  const refinements = getAttributeRefinements(attribute || '', items);
  const isRefined = refinements.length > 0;
  const isDisabled = results.hits.length === 0;

  //const refinementListData = useRefinementList({attribute: attribute});

  //return (refinementListData && refinementListData.items && refinementListData.items.length > 0 &&
  return (
    <Panel
      title={title}
      header={title}
      className={classNames.root}
      collapsible={true}
      ref={panelRef}
    >
      {children}
    </Panel>
  );
}