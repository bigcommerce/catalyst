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

import { cn } from '~/lib/utils';

interface Image {
  url: string;
  altText: string;
}

const GalleryContext = createContext<{
  images: Image[] | [];
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

const GalleryPreviousIndicator = forwardRef<ElementRef<'button'>, ComponentPropsWithRef<'button'>>(
  ({ children, className, onClick, ...props }, ref) => {
    const { images, selectedImageIndex, setSelectedImageIndex } = useContext(GalleryContext);
    const previousIndex = selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1;

    return (
      <button
        aria-label="Previous product image"
        className={cn('focus:outline-none focus:ring-4 focus:ring-blue-primary/20', className)}
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
  },
);

GalleryPreviousIndicator.displayName = 'GalleryPreviousIndicator';

const GalleryNextIndicator = forwardRef<ElementRef<'button'>, ComponentPropsWithRef<'button'>>(
  ({ children, className, onClick, ...props }, ref) => {
    const { images, selectedImageIndex, setSelectedImageIndex } = useContext(GalleryContext);
    const nextIndex = selectedImageIndex + 1 < images.length ? selectedImageIndex + 1 : 0;

    return (
      <button
        aria-label="Next product image"
        className={cn('focus:outline-none focus:ring-4 focus:ring-blue-primary/20', className)}
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
  },
);

GalleryNextIndicator.displayName = 'GalleryNextIndicator';

const GalleryControls = forwardRef<ElementRef<'div'>, ComponentPropsWithRef<'div'>>(
  ({ children, className, ...props }, ref) => {
    const { images } = useContext(GalleryContext);

    if (images.length <= 1) {
      return null;
    }

    return (
      <div
        className={cn(
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

GalleryControls.displayName = 'GalleryControls';

interface GalleryImageProps extends Omit<ComponentPropsWithRef<'img'>, 'children'> {
  children?: (({ selectedImage }: { selectedImage?: Image }) => React.ReactNode) | React.ReactNode;
}

const GalleryImage = forwardRef<ElementRef<'img'>, GalleryImageProps>(
  ({ className, children, ...props }, ref) => {
    const { images, selectedImageIndex } = useContext(GalleryContext);
    const selectedImage = images.length > 0 ? images[selectedImageIndex] : undefined;

    if (typeof children === 'function') {
      return children({ selectedImage });
    }

    if (selectedImage) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={selectedImage.altText}
          className={cn('h-full w-full object-contain', className)}
          ref={ref}
          sizes="100vw"
          src={selectedImage.url}
          {...props}
        />
      );
    }
  },
);

GalleryImage.displayName = 'GalleryImage';

const GalleryContent = forwardRef<ElementRef<'figure'>, ComponentPropsWithRef<'figure'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <figure
        className={cn('relative aspect-square h-full max-h-[548px] w-full', className)}
        ref={ref}
        {...props}
      >
        {children}
      </figure>
    );
  },
);

GalleryContent.displayName = 'GalleryContent';

const GalleryThumbnailList = forwardRef<ElementRef<'nav'>, ComponentPropsWithRef<'nav'>>(
  ({ children, className, ...props }, ref) => {
    return (
      <nav
        aria-label="Thumbnail navigation"
        className={cn(
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

GalleryThumbnailList.displayName = 'GalleryThumbnailList';

interface GalleryThumbnailItemProps extends ComponentPropsWithRef<'button'> {
  imageIndex: number;
}

const GalleryThumbnailItem = forwardRef<ElementRef<'button'>, GalleryThumbnailItemProps>(
  ({ className, children, imageIndex, onClick, ...props }, ref) => {
    const { selectedImageIndex, setSelectedImageIndex } = useContext(GalleryContext);
    const isActive = selectedImageIndex === imageIndex;

    return (
      <button
        aria-label="Enlarge product image"
        aria-pressed={isActive}
        className={cn(
          'inline-block h-24 w-24 flex-shrink-0 flex-grow-0 focus:outline-none focus:ring-4 focus:ring-blue-primary/20',
          className,
        )}
        onClick={(e) => {
          setSelectedImageIndex(imageIndex);

          if (onClick) {
            onClick(e);
          }
        }}
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

GalleryThumbnailItem.displayName = 'GalleryThumbnailItem';

interface GalleryThumbnailProps extends ComponentPropsWithRef<'img'> {
  asChild?: boolean;
}

const GalleryThumbnail = forwardRef<ElementRef<'img'>, GalleryThumbnailProps>(
  ({ asChild, className, ...props }, forwardedRef) => {
    const { selectedImageIndex } = useContext(GalleryContext);
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
        className={cn(
          'flex cursor-pointer items-center justify-center border-2 hover:border-blue-primary',
          isActive && 'border-blue-primary',
          'h-full w-full object-contain',
          className,
        )}
        height={94}
        ref={ref}
        width={94}
        {...props}
      />
    );
  },
);

GalleryThumbnail.displayName = 'GalleryThumbnail';

interface GalleryProps extends ComponentPropsWithRef<'div'> {
  images: Image[] | [];
  defaultImageIndex?: number;
}

const Gallery = forwardRef<ElementRef<'div'>, GalleryProps>(
  ({ className, children, images, defaultImageIndex = 0, ...props }, ref) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(defaultImageIndex);

    useEffect(() => {
      setSelectedImageIndex(defaultImageIndex);
    }, [defaultImageIndex]);

    return (
      <GalleryContext.Provider value={{ images, selectedImageIndex, setSelectedImageIndex }}>
        <div aria-live="polite" className={cn(className)} ref={ref} {...props}>
          {children}
        </div>
      </GalleryContext.Provider>
    );
  },
);

Gallery.displayName = 'Gallery';

export {
  Gallery,
  GalleryThumbnail,
  GalleryThumbnailItem,
  GalleryThumbnailList,
  GalleryContent,
  GalleryImage,
  GalleryControls,
  GalleryNextIndicator,
  GalleryPreviousIndicator,
};
