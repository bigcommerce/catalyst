'use client';

import {
  ComponentProps,
  forwardRef,
  PropsWithChildren,
  ReactNode,
  useState,
  useEffect
} from 'react';

import { cn } from '~/lib/utils';

export type PanelProps = ComponentProps<'div'> &
  PropsWithChildren<{
    header?: string | ReactNode;
    footer?: string | ReactNode;
    classNames?: Partial<PanelClassNames>;
    collapsible?: boolean;
  }>;

export type PanelClassNames = {
  root: string;
  header: string;
  body: string;
  footer: string;
};

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ children, header, footer, className, classNames = {}, collapsible = false, ...props }, ref) => {

    const facetId = header ? header.toString().replace(/[^a-zA-Z0-9\s]/g, '') : '';
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
      if (typeof (Storage) !== 'undefined')
        setExpanded(localStorage.getItem('algolia-facet-' + facetId + '-panel-expanded') === '1' ? true : false);
    }, []);

    function toggleExpanded() {
      const currentValue = expanded;
      setExpanded(!currentValue);

      if (typeof (Storage) !== 'undefined')
        localStorage.setItem('algolia-facet-' + facetId + '-panel-expanded', currentValue ? '0' : '1');
    }

    return (
      <div
        {...props}
        className={cn('ais-Panel', classNames.root, className)}
        ref={ref}
      >
        {header && (
          collapsible 
          ? <div className={cn('ais-Panel-header', classNames.header)} onClick={() => toggleExpanded()}>
              <span>{header}</span><span>{ expanded ? '–' : '+'}</span>
            </div> 
          : <div className={cn('ais-Panel-header', classNames.header)}>
              {header}
            </div>
        )}
        <div className={expanded || !collapsible ? cn('ais-Panel-body', classNames.body) : 'hidden'}>{children}</div>
        {footer && (
          <div className={expanded || !collapsible ? cn('ais-Panel-footer', classNames.footer) : 'hidden'}>
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Panel.displayName = 'Panel';