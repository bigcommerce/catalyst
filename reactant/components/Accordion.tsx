import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useId,
  useState,
} from 'react';

import { ComponentClasses } from './types';

const AccordionTogglerContext = createContext<{
  accordionId: string | undefined;
  accordionItemId: string | undefined;
  toggle: boolean | null;
  setToggle: Dispatch<SetStateAction<boolean>> | null;
}>({ toggle: null, setToggle: null, accordionId: undefined, accordionItemId: undefined });

interface AccordionProps extends PropsWithChildren<React.HTMLAttributes<HTMLDivElement>> {
  isExtended: boolean;
}

type Accordion = React.FC<AccordionProps> &
  ComponentClasses<'default'> & {
    Toggle: React.FC<ToggleProps> & ComponentClasses<'default'>;
    Content: React.FC<ContentProps> & ComponentClasses<'default'>;
  };

export const Accordion: Accordion = ({ children, isExtended, ...props }) => {
  const [toggle, setToggle] = useState(isExtended);
  const accordionId = useId();
  const accordionItemId = useId();

  return (
    <AccordionTogglerContext.Provider value={{ accordionId, accordionItemId, toggle, setToggle }}>
      <div {...props}>{children}</div>
    </AccordionTogglerContext.Provider>
  );
};

Accordion.default = {
  className: ' flex flex-col leading-7 gap-y-4',
};

interface ToggleProps extends PropsWithChildren<React.HTMLAttributes<HTMLDivElement>> {
  title: string;
  icons: React.ReactNode[];
}

const Toggle: Accordion['Toggle'] = ({ children, icons, title, ...props }) => {
  const { accordionId, accordionItemId, toggle, setToggle } = useContext(AccordionTogglerContext);
  const [IconA, IconB] = icons;
  const handleToggleAction = () => {
    if (setToggle) {
      return setToggle(!toggle);
    }
  };

  return (
    <div
      aria-controls={accordionItemId}
      aria-expanded={Boolean(toggle)}
      id={accordionId}
      role="button"
      {...props}
      onClick={handleToggleAction}
      onKeyDown={handleToggleAction}
      tabIndex={0}
    >
      <p className="font-bold">{title}</p>
      {toggle ? IconA : IconB}
    </div>
  );
};

Toggle.default = {
  className: 'flex items-center justify-between hover:cursor-pointer',
};

type ContentProps = PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>;

const Content: Accordion['Content'] = ({ children, ...props }) => {
  const { accordionId, accordionItemId, toggle } = useContext(AccordionTogglerContext);

  if (!toggle) {
    return null;
  }

  return (
    <div aria-labelledby={accordionId} id={accordionItemId} role="region" {...props}>
      {children}
    </div>
  );
};

Content.default = {
  className: 'inline-flex flex-col gap-y-4',
};

Accordion.Toggle = Toggle;
Accordion.Content = Content;
