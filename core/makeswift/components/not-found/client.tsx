import { forwardRef, type ReactNode, type Ref } from 'react';

export const MakeswiftNotFoundSection = forwardRef(
  (
    {
      children,
    }: {
      children?: ReactNode;
    },
    ref: Ref<HTMLDivElement>,
  ) => {
    return (
      <section className="@container" ref={ref}>
        {children}
      </section>
    );
  },
);
