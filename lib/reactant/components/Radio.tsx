import React, { ComponentPropsWithoutRef } from 'react';

import { Input, Label } from '@reactant/components/Input';

import { ComponentClasses } from './types';

type FieldsetProps = ComponentPropsWithoutRef<'fieldset'>;
type Fieldset = React.FC<FieldsetProps>;

export const Fieldset: Fieldset = ({ children, ...props }) => {
  return <fieldset {...props}>{children}</fieldset>;
};

type LegendProps = ComponentPropsWithoutRef<'legend'>;
type Legend = React.FC<LegendProps> & ComponentClasses<'default'>;

export const Legend: Legend = ({ children, ...props }) => {
  return <legend {...props}>{children}</legend>;
};

Legend.default = {
  className: 'mb-2 font-semibold leading-[1.7rem]',
};

interface RadioProps extends ComponentPropsWithoutRef<'input'> {
  label?: string;
  isChecked?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  handleChange: (event: { target: HTMLInputElement }) => string;
}

type Radio = React.FC<RadioProps> &
  ComponentClasses<'default'> & {
    CustomInput: ComponentClasses<'default'>;
  };

export const Radio: Radio = ({ handleChange, id, value, name, ...props }) => {
  return (
    <Input
      checked={props.isChecked}
      disabled={props.isDisabled}
      id={id}
      name={name}
      onChange={handleChange}
      required={props.isRequired}
      type="radio"
      value={value}
      {...props}
    >
      {!!props.label && (
        <Label className="order-2" id={id}>
          {props.label}
        </Label>
      )}
    </Input>
  );
};

Radio.default = {
  className: 'flex items-center w-fit py-2 font-normal leading-[1.7rem] last:mb-4',
};

Radio.CustomInput = {
  default: {
    className: `
    [&_input]:relative

    [&_input]:before:pointer-events-none [&_input]:before:absolute [&_input]:before:-top-0.5 [&_input]:before:-left-0.5 [&_input]:before:h-6 [&_input]:before:w-6 [&_input]:before:rounded-full [&_input]:before:opacity-0 [&_input]:before:scale-[0.98] [&_input]:before:shadow-[0_0_0_4px_#DBE3FE] [&_input]:before:content-['']

    [&_input]:appearance-none
    [&_input]:order-1
    [&_input]:h-6 [&_input]:w-6 [&_input]:mr-3
    [&_input]:border-2 [&_input]:border-[#CFD8DC]
    [&_input]:rounded-full

    [&_input]:hover:cursor-pointer [&_input]:hover:border-[#053FB0]

    [&_input:focus]:border-[#053FB0] [&_input:focus]:outline-none [&_input:focus]:before:opacity-[1]
    
    [&_input:checked:focus]:before:-top-2 [&_input:checked:focus]:before:-left-2 [&_input:checked:focus]:border-[#3071EF]

    [&_input:checked]:border-8 [&_input:checked]:border-[#053FB0]
    [&_input:checked]:before:-top-2 [&_input:checked]:before:-left-2

    [&_input:checked]:hover:border-[#3071EF]

    [&_input:disabled]:border-[#CFD8DC] [&_input:disabled]:bg-[#F1F3F5] [&_input:disabled]:cursor-default
    [&_input:checked:disabled]:border-[#90A4AE]
    
    [&_input]:transition duration-300`,
  },
};
