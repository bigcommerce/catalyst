import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import {
  Children,
  cloneElement,
  ComponentPropsWithRef,
  ElementRef,
  forwardRef,
  isValidElement,
  ReactElement,
  useEffect,
  useReducer,
  useState,
} from 'react';

import { cs } from '../../utils/cs';

import { LinkedList, Node } from './LinkedList';

export interface CarouselLinkedListItemProps extends ComponentPropsWithRef<'li'> {
  inert?: boolean;
}

export const CarouselLinkedListItem = forwardRef<ElementRef<'li'>, CarouselLinkedListItemProps>(
  ({ className, children, inert }, ref) => {
    return (
      <li
        className={cs('absolute h-full w-full transform transition-all', className)}
        // @ts-expect-error https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60822
        inert={inert ? 'true' : null}
        ref={ref}
      >
        {children}
      </li>
    );
  },
);

interface CarouselLinkedListProps extends ComponentPropsWithRef<'ul'> {
  interval?: number;
  children:
    | ReactElement<CarouselLinkedListItemProps>
    | Array<ReactElement<CarouselLinkedListItemProps>>;
}

export const CarouselLinkedList = forwardRef<ElementRef<'ul'>, CarouselLinkedListProps>(
  ({ children, className, interval = 10_000 }, ref) => {
    const [paused, togglePause] = useReducer((state: boolean) => !state, false);
    const [hoverPaused, setHoverPaused] = useState(false);
    const [current, setCurrent] = useState<Node<ReactElement<CarouselLinkedListItemProps>> | null>(
      null,
    );

    useEffect(() => {
      const valid = Children.toArray(children).filter(
        (child): child is ReactElement<CarouselLinkedListItemProps> =>
          isValidElement<CarouselLinkedListItemProps>(child) &&
          typeof child !== 'string' &&
          typeof child !== 'number',
      );

      const linkedList = new LinkedList();

      Children.map(valid, (child) => linkedList.append(child));

      setCurrent(linkedList.head);
    }, [children]);

    useEffect(() => {
      const intervalId = setInterval(() => {
        if (!paused && !hoverPaused && Children.count(children) > 1 && current) {
          setCurrent(current.next);
        }
      }, interval);

      return () => {
        clearInterval(intervalId);
      };
    }, [hoverPaused, interval, paused, children, current]);

    if (!current) return <ul>!current</ul>;
    if (!current.prev) return <ul>!current.prev</ul>;
    if (!current.next) return <ul>!current.next</ul>;

    const left = cloneElement(current.prev.data, {
      className: cs(current.prev.data.props.className, 'z-10 -translate-x-full'),
      inert: true,
    });
    const middle = cloneElement(current.data, {
      className: cs(current.data.props.className, 'z-20 translate-x-0'),
    });
    const right = cloneElement(current.next.data, {
      className: cs(current.next.data.props.className, 'z-10 translate-x-full'),
      inert: true,
    });

    return (
      <ul
        className={cs(
          'relative inset-0 h-[640px] overflow-hidden md:h-[508px] lg:h-[600px]',
          className,
        )}
        onBlur={() => setHoverPaused(false)}
        onFocus={() => setHoverPaused(true)}
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => setHoverPaused(false)}
        ref={ref}
      >
        {[left, middle, right]}

        {Children.count(children) > 1 && (
          <ul className="absolute bottom-12 left-12 z-30 flex gap-8">
            <li>
              <button className="p-1" onClick={() => togglePause()}>
                {paused ? <Play /> : <Pause />}
              </button>
            </li>

            <li>
              <button className="p-1" onClick={() => setCurrent(current.prev)}>
                <ArrowLeft />
              </button>
            </li>

            <li aria-atomic="true" aria-live="polite" className="p-1 font-semibold">
              ? of ?
            </li>

            <li>
              <button className="p-1" onClick={() => setCurrent(current.next)}>
                <ArrowRight />
              </button>
            </li>
          </ul>
        )}
      </ul>
    );
  },
);
