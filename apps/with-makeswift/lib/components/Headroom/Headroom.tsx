import { ReactNode, Ref, forwardRef } from 'react';
import ReactHeadroom from 'react-headroom';

type Props = {
  upTolerance?: number;
  downTolerance?: number;
  pinStart?: number;
  children: ReactNode;
};

export const Headroom = forwardRef(function Headroom(
  { children, ...rest }: Props,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <div ref={ref} className="w-full">
      <ReactHeadroom {...rest}>{children}</ReactHeadroom>
    </div>
  );
});
