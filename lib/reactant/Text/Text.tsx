import { Text as MakeswiftText } from '@makeswift/runtime/components';
import clsx from 'clsx';
import React, { ComponentPropsWithoutRef, ComponentRef, CSSProperties, forwardRef } from 'react';

type MakeswiftTextProps = ComponentPropsWithoutRef<typeof MakeswiftText>;

type Props = MakeswiftTextProps & {
  linkColor?: string;
  listMarkerColor?: string;
};

export const Text = forwardRef<ComponentRef<typeof MakeswiftText>, Props>(function Text(
  { linkColor, listMarkerColor, ...restOfProps },
  ref,
) {
  return (
    <div
      className={clsx(
        'custom-text w-full [&_a>span]:text-[var(--link-color)] [&_li::marker]:text-[var(--list-marker-color)]',
      )}
      style={
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        {
          '--link-color': linkColor,
          '--list-marker-color': listMarkerColor,
        } as CSSProperties
      }
    >
      <MakeswiftText {...restOfProps} ref={ref} />
    </div>
  );
});
