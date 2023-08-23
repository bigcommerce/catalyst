import { Slot } from '@radix-ui/react-slot';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ComponentPropsWithRef,
  createContext,
  ElementRef,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { cs } from '../../utils/cs';

interface Image {
  url: string;
  altText: string;
}

const GalleryContext = createContext<{
  images: Image[];
  selectedImageIndex: number;
  setSelectedImageIndex: React.Dispatch<React.SetStateAction<number>>;
}>({
  images: [],
  selectedImageIndex: 0,
  setSelectedImageIndex: () => null,
});

const ThumbnailContext = createContext<{
  index: number;
}>({
  index: 0,
});

export const GalleryPreviousIndicator = forwardRef<
  ElementRef<'button'>,
  ComponentPropsWithRef<'button'>
>(({ children, className, onClick, ...props }, ref) => {
  const { images, selectedImageIndex, setSelectedImageIndex } = useContext(GalleryContext);
  const previousIndex = selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1;

  return (
    <button
      aria-label="Previous product image"
      className={cs('focus:ring-primary-blue/20 focus:outline-none focus:ring-4', className)}
      onClick={(e) => {
        setSelectedImageIndex(previousIndex);

        if (onClick) {
          onClick(e);
        }
      }}
      ref={ref}
      {...props}
    >
      {children || <ChevronLeft />}
    </button>
  );
});

export const GalleryNextIndicator = forwardRef<
  ElementRef<'button'>,
  ComponentPropsWithRef<'button'>
>(({ children, className, onClick, ...props }, ref) => {
  const { images, selectedImageIndex, setSelectedImageIndex } = useContext(GalleryContext);
  const nextIndex = selectedImageIndex + 1 < images.length ? selectedImageIndex + 1 : 0;

  return (
    <button
      aria-label="Next product image"
      className={cs('focus:ring-primary-blue/20 focus:outline-none focus:ring-4', className)}
      onClick={(e) => {
        setSelectedImageIndex(nextIndex);

        if (onClick) {
          onClick(e);
        }
      }}
      ref={ref}
      {...props}
    >
      {children || <ChevronRight />}
    </button>
  );
});

export const GalleryControls = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    const { images } = useContext(GalleryContext);

    if (images.length <= 1) {
      return null;
    }

    return (
      <div
        className={cs(
          'absolute top-1/2 flex w-full -translate-y-1/2 justify-between px-5 sm:px-0',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children || (
          <>
            <GalleryPreviousIndicator />
            <GalleryNextIndicator />
          </>
        )}
      </div>
    );
  },
);

interface GalleryImageProps extends Omit<ComponentPropsWithRef<'img'>, 'children'> {
  children?: (({ selectedImage }: { selectedImage: Image }) => React.ReactNode) | React.ReactNode;
}

export const GalleryImage = forwardRef<ElementRef<'img'>, GalleryImageProps>(
  ({ className, children, ...props }, ref) => {
    const { images, selectedImageIndex } = useContext(GalleryContext);

    if (typeof children === 'function') {
      return children({ selectedImage: images[selectedImageIndex] });
    }

    return (
      <img
        alt={images[selectedImageIndex].altText}
        className={cs('h-full w-full object-contain', className)}
        ref={ref}
        sizes="(min-width: 1024px) 50vw, 100vw"
        src={images[selectedImageIndex].url}
        {...props}
      />
    );
  },
);

export const GalleryContent = forwardRef<ElementRef<'figure'>, ComponentPropsWithRef<'figure'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <figure
        className={cs('relative aspect-square h-full max-h-[548px] w-full', className)}
        ref={ref}
        {...props}
      >
        {children}
      </figure>
    );
  },
);

export const GalleryThumbnailList = forwardRef<ElementRef<'ul'>, ComponentPropsWithRef<'ul'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <nav
        aria-label="Thumbnail navigation"
        className={cs(
          '-mx-1 mt-3 flex w-full flex-nowrap items-center gap-4 overflow-x-auto px-1 py-1 md:mt-5 md:gap-6',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </nav>
    );
  },
);

interface GalleryThumbnailItemProps extends ComponentPropsWithRef<'button'> {
  imageIndex: number;
}

export const GalleryThumbnailItem = forwardRef<ElementRef<'button'>, GalleryThumbnailItemProps>(
  ({ className, children, imageIndex, ...props }, ref) => {
    const { selectedImageIndex } = useContext(GalleryContext);
    const isActive = selectedImageIndex === imageIndex;

    return (
      <button
        aria-label="Enlarge product image"
        aria-pressed={isActive}
        className={cs(
          'focus:ring-primary-blue/20 inline-block h-24 w-24 flex-shrink-0 flex-grow-0 focus:outline-none focus:ring-4',
          className,
        )}
        ref={ref}
        type="button"
        {...props}
      >
        <ThumbnailContext.Provider value={{ index: imageIndex }}>
          {children}
        </ThumbnailContext.Provider>
      </button>
    );
  },
);

interface GalleryThumbnailProps extends ComponentPropsWithRef<'img'> {
  asChild?: boolean;
}

export const GalleryThumbnail = forwardRef<ElementRef<'img'>, GalleryThumbnailProps>(
  ({ asChild, className, ...props }, forwardedRef) => {
    const { selectedImageIndex, setSelectedImageIndex } = useContext(GalleryContext);
    const { index } = useContext(ThumbnailContext);

    const fallbackRef = useRef<HTMLImageElement | null>(null);
    const ref = forwardedRef ?? fallbackRef;

    const isActive = selectedImageIndex === index;

    useEffect(() => {
      if (isActive) {
        if (typeof ref !== 'function') {
          ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }, [isActive, ref]);

    const Comp = asChild ? Slot : 'img';

    return (
      <Comp
        className={cs(
          'flex cursor-pointer items-center justify-center border-2 hover:border-blue-primary',
          isActive && 'border-blue-primary',
          'h-full w-full object-contain',
          className,
        )}
        height={94}
        onClick={() => setSelectedImageIndex(index)}
        ref={ref}
        width={94}
        {...props}
      />
    );
  },
);

interface GalleryProps extends ComponentPropsWithRef<'div'> {
  images: Image[];
  defaultImageIndex?: number;
}

export const Gallery = forwardRef<ElementRef<'div'>, GalleryProps>(
  ({ className, children, images, defaultImageIndex = 0, ...props }, ref) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(defaultImageIndex);

    return (
      <GalleryContext.Provider value={{ images, selectedImageIndex, setSelectedImageIndex }}>
        <div aria-live="polite" className={cs(className)} ref={ref} {...props}>
          {children}
        </div>
      </GalleryContext.Provider>
    );
  },
);
