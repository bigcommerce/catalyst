import React, { ComponentPropsWithoutRef } from 'react';

import { Button, Button as CounterButtonType } from '@reactant/components/Button';
import { Label as CounterLabelType, Input, Label } from '@reactant/components/Input';
import { ComponentClasses } from '@reactant/components/types';

type CounterProps = ComponentPropsWithoutRef<'div'>;
type CounterWrapperProps = ComponentPropsWithoutRef<'div'>;
type CounterInputProps = ComponentPropsWithoutRef<'input'>;
type Counter = React.FC<CounterProps> & {
  Button: CounterButtonType;
  Input: React.FC<CounterInputProps> & ComponentClasses<'default'>;
  Label: CounterLabelType;
  Wrapper: React.FC<CounterWrapperProps> & ComponentClasses<'container' | 'focus'>;
};

const CounterWrapper: Counter['Wrapper'] = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

CounterWrapper.container = {
  className: 'inline-flex item-center border-2 border-[#CFD8DC]',
};
CounterWrapper.focus = {
  className: 'border-[#053FB0] outline outline-offset-0 outline-4 outline-[#cdd8ef]',
};

const CounterLabel: Counter['Label'] = Label;
const CounterInput: Counter['Input'] = Input;
const CounterButton: Counter['Button'] = Button;

CounterInput.default = {
  className:
    'inline-flex relative group/input-wrapper [&_input]:w-8 [&_input]:h-11 [&_input]:px-0 [&_input]:mx-0.5 [&_input]:text-base [&_input]:font-semibold [&_input]:text-center [&_input]:border-0 [&_input]:block [&_input:focus]:border-none [&_input:focus]:outline-none [&_input:focus]:outline-offset-0 [&_input:focus]:outline-0 [&_input:focus]:outline-none',
};

CounterButton.Icon = {
  default: {
    className: 'focus:outline focus:-outline-offset-8 focus:outline-4 focus:outline-[#cdd8ef]',
  },
};

export const Counter: Counter = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

Counter.Wrapper = CounterWrapper;
Counter.Label = CounterLabel;
Counter.Input = CounterInput;
Counter.Button = CounterButton;
