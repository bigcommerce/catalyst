import { createContext, PropsWithChildren, useContext, useId } from 'react';

import { ComponentClasses } from './types';

const SwatchAccessibilityContext = createContext<{ id: string | undefined }>({ id: undefined });

type SwatchGroupProps = React.HTMLAttributes<HTMLDivElement> & PropsWithChildren;
type SwatchGroup = React.FC<SwatchGroupProps> &
  ComponentClasses<'default'> & {
    Label: React.FC<SwatchGroupLabelProps> & ComponentClasses<'default'>;
  };

export const SwatchGroup: SwatchGroup = ({ children, ...props }) => {
  return (
    <div role="radiogroup" {...props}>
      {children}
    </div>
  );
};

SwatchGroup.default = {
  className: 'flex flex-row flex-wrap justify-start items-center gap-3 pt-3 pb-2',
};

type SwatchGroupLabelProps = PropsWithChildren<React.HTMLAttributes<HTMLLabelElement>>;

const SwatchGroupLabel: SwatchGroup['Label'] = ({ children, ...props }) => {
  return <label {...props}>{children}</label>;
};

SwatchGroupLabel.default = {
  className:
    'basis-full inline-flex flex-row justify-start items-center gap-2 font-semibold h-6 my-1',
};

SwatchGroup.Label = SwatchGroupLabel;

type SwatchProps = PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>;
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type SwatchLabelProps = PropsWithChildren<React.HTMLAttributes<HTMLLabelElement>>;

interface SwatchVariantProps extends PropsWithChildren<React.HTMLAttributes<HTMLSpanElement>> {
  variantColor: string;
}

type Swatch = React.FC<SwatchProps> &
  ComponentClasses<'default'> & {
    Input: React.FC<InputProps> & ComponentClasses<'default'>;
    Label: React.FC<SwatchLabelProps> & ComponentClasses<'default'>;
    Variant: React.FC<SwatchVariantProps> & ComponentClasses<'default'>;
  };

export const Swatch: Swatch = ({ children, ...props }) => {
  const id = useId();

  return (
    <SwatchAccessibilityContext.Provider value={{ id }}>
      <div {...props}>{children}</div>
    </SwatchAccessibilityContext.Provider>
  );
};

Swatch.default = {
  className: 'relative',
};

const SwatchInput: Swatch['Input'] = ({ id, name, ...props }) => {
  const { id: swatchId } = useContext(SwatchAccessibilityContext);

  return <input id={id ?? swatchId} name={name ?? id} type="radio" {...props} />;
};

const SwatchLabel: Swatch['Label'] = ({ children, id, ...props }) => {
  const { id: swatchId } = useContext(SwatchAccessibilityContext);

  return (
    <label htmlFor={id ?? swatchId} {...props}>
      {children}
    </label>
  );
};
const SwatchVariant: Swatch['Variant'] = ({ children, variantColor, ...props }) => {
  return (
    <span
      {...props}
      style={{ backgroundColor: variantColor, backgroundImage: `url(${variantColor})` }}
    />
  );
};

SwatchInput.default = {
  className: 'absolute top-0.5 left-0.5 outline-none sr-only peer/input',
};

SwatchLabel.default = {
  className:
    'border-2 border-solid border-[#CFD8DC] cursor-pointer inline-flex flex-row items-stretch justify-evenly text-[0px] h-6 w-6 p-0.5 hover:border-2 hover:border-solid hover:border-[#053FB0] peer-checked/input:outline-[#053fb033] peer-checked/input:outline peer-checked/input:outline-4 peer-focus/input:outline-[#053fb033] peer-focus/input:outline-3 peer-focus/input:outline peer-disabled/input:border-2 peer-disabled/input:border-solid peer-disabled/input:border-[#F1F3F5] peer-disabled/input:pointer-events-none',
};

SwatchVariant.default = {
  className: 'h-4 w-4 bg-[#F1F3F5]',
};

Swatch.Input = SwatchInput;
Swatch.Label = SwatchLabel;
Swatch.Variant = SwatchVariant;
