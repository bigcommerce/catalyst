import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useId,
  useState,
} from 'react';

interface ClassName {
  className: string;
}

const AccordionTogglerContext = createContext<{
  accordionId: string | undefined;
  accordionItemId: string | undefined;
  toggle: boolean | null;
  setToggle: Dispatch<SetStateAction<boolean>> | null;
}>({ toggle: null, setToggle: null, accordionId: undefined, accordionItemId: undefined });

type ComponentProps<Props, VariantKey extends string> = React.FC<Props> &
  Record<VariantKey, ClassName>;

type ContentProps = React.HTMLAttributes<HTMLDivElement> & PropsWithChildren;
type Content = ComponentProps<ContentProps, 'default'>;
type ToggleProps = React.HTMLAttributes<HTMLDivElement> &
  PropsWithChildren & {
    title: string;
    icons: React.ReactNode[];
  };
type Toggle = ComponentProps<ToggleProps, 'default'>;
type AccordionProps = React.HTMLAttributes<HTMLDivElement> &
  PropsWithChildren & {
    isExtended: boolean;
  };
type Accordion = ComponentProps<AccordionProps, 'default'> & {
  Toggle: Toggle;
  Content: Content;
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

const Toggle: Toggle = ({ children, icons, title, ...props }) => {
  const { accordionId, accordionItemId,  toggle, setToggle } = useContext(AccordionTogglerContext);
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

const Content: Content = ({ children, ...props }) => {
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
