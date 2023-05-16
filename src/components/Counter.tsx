import React, { ChangeEvent, ComponentPropsWithoutRef, KeyboardEvent, useState } from 'react';

import { Counter as ReactantCounter } from '@reactant/components/Counter';
import { FormGroup } from '@reactant/components/Input';

interface CounterProps extends ComponentPropsWithoutRef<'div'> {
  counterLabel?: string;
  icons: {
    DecreaseIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>>;
    IncreaseIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>>;
  };
  initValue: number;
}

type Counter = React.FC<CounterProps>;

export const Counter: Counter = ({ counterLabel, icons, initValue }) => {
  const [currValue, setValue] = useState<number>(initValue);
  const [focus, setFocus] = useState(false);
  const { DecreaseIcon, IncreaseIcon } = icons;
  const STEP = 1;

  const handleChange = (
    event: ChangeEvent<HTMLInputElement> & {
      target: HTMLInputElement;
    },
  ) => {
    const { value } = event.target;

    if (Number.isNaN(parseFloat(value))) {
      return setValue(0);
    }

    if (parseFloat(value) < 0) {
      return setValue(0);
    }

    setValue(parseFloat(value));
  };
  const handleIncrease = () => {
    return setValue(Math.round(currValue + STEP));
  };
  const handleDecrease = () => {
    if (currValue - STEP < 0) {
      return;
    }

    return setValue(Math.round(currValue - STEP));
  };
  const handleKeyPress = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        handleIncrease();
        break;

      case 'ArrowDown':
        handleDecrease();
        break;

      case 'Escape':
        setValue(currValue);
        break;

      default:
        break;
    }
  };
  const handleFocus = () => setFocus(true);
  const handleBlur = () => setFocus(false);

  return (
    <ReactantCounter>
      {Boolean(counterLabel) && (
        <ReactantCounter.Label className={`${ReactantCounter.Label.top.className} font-semibold`}>
          {counterLabel}
        </ReactantCounter.Label>
      )}
      <ReactantCounter.Wrapper
        className={`${ReactantCounter.Wrapper.container.className} ${
          focus ? ReactantCounter.Wrapper.focus.className : ''
        }`}
      >
        <ReactantCounter.Button
          className={`${ReactantCounter.Button.iconOnly.className} !px-2 my-0.5 ${ReactantCounter.Button.Icon.default.className}`}
          onClick={handleDecrease}
        >
          <DecreaseIcon className="inline-block h-6 w-6 fill-black stroke-black" key="onOpen" />
        </ReactantCounter.Button>
        <FormGroup>
          <ReactantCounter.Input
            className={ReactantCounter.Input.default.className}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyPress}
            type="text"
            value={currValue}
          />
        </FormGroup>
        <ReactantCounter.Button
          className={`${ReactantCounter.Button.iconOnly.className} !px-2 my-0.5 ${ReactantCounter.Button.Icon.default.className}`}
          onClick={handleIncrease}
        >
          <IncreaseIcon className="inline-block h-6 w-6 fill-black stroke-black" key="onOpen" />
        </ReactantCounter.Button>
      </ReactantCounter.Wrapper>
    </ReactantCounter>
  );
};
