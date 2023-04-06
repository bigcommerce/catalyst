import React, { ComponentPropsWithoutRef, createContext, useContext, useId } from 'react';

import { ComponentClasses } from './types';

const FormGroupAccessibilityContext = createContext<{ id: string | undefined }>({ id: undefined });

type InputProps = ComponentPropsWithoutRef<'input'>;
type Input = React.FC<InputProps> &
  ComponentClasses<'default'> & {
    Icon: ComponentClasses<'default' | 'position'>;
  };

export const Input: Input = ({ children, id, className, ...props }) => {
  const { id: formGroupId } = useContext(FormGroupAccessibilityContext);

  return (
    <div className={className}>
      {children}
      <input id={id ?? formGroupId} {...props} />
    </div>
  );
};

Input.default = {
  className:
    'inline-flex relative group/input-wrapper [&_input]:block [&_input]:w-64 [&_input]:h-12 [&_input]:px-12 [&_input]:text-sm [&_input]:border-2 [&_input]:border-[#CFD8DC] [&_input]:rounded-none [&_input]:hover:border-[#053FB0] [&_input:focus]:border-[#053FB0] [&_input:focus]:outline [&_input:focus]:outline-offset-0 [&_input:focus]:outline-4 [&_input:focus]:outline-[#cdd8ef]',
};

Input.Icon = {
  default: {
    className: 'fill-none stroke-[#000] group-hover/input-wrapper:stroke-[#053FB0]',
  },
  position: {
    className: 'absolute top-1/2 transform -translate-y-1/2 left-3',
  },
};

type LabelProps = ComponentPropsWithoutRef<'label'>;
type Label = React.FC<LabelProps> & ComponentClasses<'default' | 'left' | 'top'>;

export const Label: Label = ({ children, id, ...props }) => {
  const { id: formGroupId } = useContext(FormGroupAccessibilityContext);

  return (
    <label htmlFor={id ?? formGroupId} {...props}>
      {children}
    </label>
  );
};

Label.default = {
  className: 'text-m font-semibold',
};

Label.left = {
  className: 'inline-flex mr-2',
};

Label.top = {
  className: 'flex mb-2',
};

type FormGroupProps = ComponentPropsWithoutRef<'div'>;
type FormGroup = React.FC<FormGroupProps>;

export const FormGroup: FormGroup = ({ children, ...props }) => {
  const id = useId();

  return (
    <FormGroupAccessibilityContext.Provider value={{ id }}>
      <div {...props}>{children}</div>
    </FormGroupAccessibilityContext.Provider>
  );
};
