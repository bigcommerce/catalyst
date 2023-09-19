import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import {
  Children,
  ComponentPropsWithRef,
  createContext,
  ElementRef,
  forwardRef,
  isValidElement,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

import { cs } from '../../utils/cs';
import { Button } from '../Button';

const decrement = (index: number, items: ReactElement[]) =>
  index - 1 < 0 ? items.length - 1 : index - 1;

const increment = (index: number, items: ReactElement[]) =>
  index + 1 > items.length - 1 ? 0 : index + 1;

interface SlideshowSlidePositionState {
  slidePosition: number;
}

interface SlideshowState {
  currentIndex: number;
  items: ReactElement[];
}

const SlideshowContentContext = createContext<SlideshowState>({
  currentIndex: 0,
  items: [],
});

const SlideshowSlideContext = createContext<SlideshowSlidePositionState>({ slidePosition: 0 });

export const SlideshowSlide = forwardRef<ElementRef<'li'>, ComponentPropsWithRef<'li'>>(
  ({ className, children, ...props }, ref) => {
    const { currentIndex, items } = useContext(SlideshowContentContext);
    const { slidePosition } = useContext(SlideshowSlideContext);

    const leftIndex = decrement(currentIndex, items);
    const rightIndex = increment(currentIndex, items);

    const left = slidePosition === leftIndex;
    const right = slidePosition === rightIndex;
    const middle = slidePosition === currentIndex;

    return (
      <li
        className={cs(
          'absolute h-full w-full transform transition-all',
          className,
          left && 'z-10 -translate-x-full',
          right && 'z-10 translate-x-full',
          middle && 'z-20 translate-x-0',
        )}
        // @ts-expect-error https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60822
        inert={middle ? null : 'true'}
        ref={ref}
        {...props}
      >
        {children}
      </li>
    );
  },
);

interface NextAction {
  type: 'next';
}

interface PrevAction {
  type: 'prev';
}

type SlideshowNavAction = NextAction | PrevAction;

const slideshowReducer = (state: SlideshowState, action: SlideshowNavAction) => {
  switch (action.type) {
    case 'next':
      return {
        ...state,
        currentIndex: increment(state.currentIndex, state.items),
      };

    case 'prev':
      return {
        ...state,
        currentIndex: decrement(state.currentIndex, state.items),
      };

    default:
      return { ...state };
  }
};

interface SlideshowContentProps extends ComponentPropsWithRef<'ul'> {
  interval?: number;
}

export const SlideshowContent = forwardRef<ElementRef<'ul'>, SlideshowContentProps>(
  ({ children, className, interval = 10_000, ...props }, ref) => {
    const [paused, togglePause] = useReducer((isPaused: boolean) => !isPaused, false);
    const [hoverPaused, setHoverPaused] = useState(false);

    const validChildren = Children.toArray(children).filter(
      (child): child is ReactElement<ComponentPropsWithRef<'li'>> =>
        isValidElement<ComponentPropsWithRef<'li'>>(child) &&
        typeof child !== 'string' &&
        typeof child !== 'number',
    );

    /**
     * We must pad two-slide slideshow with two extra slides
     * so that we can navigate backwards if currentIndex is 0
     */
    const normalizedItems =
      Children.count(children) === 2 ? [...validChildren, ...validChildren] : validChildren;

    const [state, navigate] = useReducer(slideshowReducer, {
      currentIndex: 0,
      items: normalizedItems,
    });

    useEffect(() => {
      const autoplay = setInterval(() => {
        if (!paused && !hoverPaused && Children.count(children) > 1) {
          navigate({ type: 'next' });
        }
      }, interval);

      return () => {
        clearInterval(autoplay);
      };
    }, [children, hoverPaused, interval, paused]);

    const [indicatorTop, indicatorBottom] = useMemo(
      () => [
        state.currentIndex + 1 > Children.count(children)
          ? state.currentIndex + 1 - Children.count(children)
          : state.currentIndex + 1,
        Children.count(children),
      ],
      [state.currentIndex, children],
    );

    return (
      <SlideshowContentContext.Provider value={state}>
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
          {...props}
        >
          {state.items.map((item, index) => (
            <SlideshowSlideContext.Provider key={index} value={{ slidePosition: index }}>
              {item}
            </SlideshowSlideContext.Provider>
          ))}

          {state.items.length > 1 && (
            <li>
              <ul className="absolute bottom-12 start-12 z-30 flex gap-8">
                <li>
                  <Button
                    className="border-0 p-1 text-black hover:bg-transparent hover:text-black"
                    onClick={() => togglePause()}
                    variant="secondary"
                  >
                    {paused ? (
                      <Play>
                        <title>Play</title>
                      </Play>
                    ) : (
                      <Pause>
                        <title>Pause</title>
                      </Pause>
                    )}
                  </Button>
                </li>

                <li>
                  <Button
                    className="border-0 p-1 text-black hover:bg-transparent hover:text-black"
                    onClick={() => navigate({ type: 'prev' })}
                    variant="secondary"
                  >
                    <ArrowLeft>
                      <title>Previous slide</title>
                    </ArrowLeft>
                  </Button>
                </li>

                <li aria-atomic="true" aria-live="polite" className="p-1 font-semibold">
                  {indicatorTop} of {indicatorBottom}
                </li>

                <li>
                  <Button
                    className="border-0 p-1 text-black hover:bg-transparent hover:text-black"
                    onClick={() => navigate({ type: 'next' })}
                    variant="secondary"
                  >
                    <ArrowRight>
                      <title>Next slide</title>
                    </ArrowRight>
                  </Button>
                </li>
              </ul>
            </li>
          )}
        </ul>
      </SlideshowContentContext.Provider>
    );
  },
);

export const Slideshow = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        className={cs(
          'relative inset-0 -mx-6 h-[640px] overflow-hidden sm:-mx-10 md:h-[508px] lg:mx-0 lg:h-[600px]',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);
