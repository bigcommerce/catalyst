import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BcImage } from '~/components/bc-image';
import { cn } from '~/lib/utils';
import { GalleryModel } from './belami-gallery-view-all-model-pdp';
import { Banner } from './belami-banner-pdp';
import ProductImage from './product-zoom';
import { useCommonContext } from '~/components/common-context/common-provider';
import WishlistAddToList from '~/app/[locale]/(default)/account/(tabs)/wishlists/wishlist-add-to-list/wishlist-add-to-list';
import { useWishlists } from '~/app/[locale]/(default)/account/(tabs)/wishlists/wishlist-add-to-list/hooks';
import { ProductItemFragment } from '~/client/fragments/product-item';
import { FragmentOf } from '~/client/graphql';

const isYoutubeUrl = (url?: string) => url?.includes('youtube.com') || url?.includes('youtu.be');

const getYoutubeEmbedUrl = (url: string) => {
  const videoId = url.match(
    /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/,
  )?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const getYoutubeThumbnailUrl = (url: string) => {
  const videoId = url.match(
    /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/,
  )?.[1];
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
};

interface ProductBrand {
  name: string;
  path: string;
}

interface ProductImage {
  url: string;
  altText: string;
  isDefault: boolean;
}

interface Image {
  altText: string;
  src: string;
  variantId?: string;
}

interface Video {
  title: string;
  url: string;
  type?: 'youtube' | 'direct';
}

interface MediaItem {
  type: 'image' | 'video';
  altText?: string;
  src?: string;
  url?: string;
  title?: string;
  videoType?: 'youtube' | 'direct';
  variantId?: string;
}

interface Props {
  className?: string;
  defaultImageIndex?: number;
  images: Image[];
  videos: Video[];
  bannerIcon: string;
  galleryExpandIcon: string;
  productMpn?: string | null;
  selectedVariantId?: string | null;
  product: FragmentOf<typeof ProductItemFragment>;
}

const Gallery = ({
  className,
  images = [],
  videos = [],
  defaultImageIndex = 0,
  bannerIcon,
  galleryExpandIcon,
  productMpn,
  selectedVariantId,
  product,
}: Props) => {
  const { wishlists } = useWishlists();
  const { setCurrentMainMedia } = useCommonContext();
  const [currentVariantId, setCurrentVariantId] = useState<number | undefined>();
  const [selectedIndex, setSelectedIndex] = useState(defaultImageIndex);
  const [viewAll, setViewAll] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const prevMediaRef = useRef<string | null>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const ExpandIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="h-full w-full"
    >
      <path
        d="M0 18V12H2V14.6L5.1 11.5L6.5 12.9L3.4 16H6V18H0ZM12.9 6.5L11.5 5.1L14.6 2H12V0H18V6H16V3.4L12.9 6.5Z"
        fill="#1C1B1F"
      />
    </svg>
  );

  useEffect(() => {
    const getVariantIdentifier = (sku: string) => {
      return sku.split('_')[1]?.toLowerCase();
    };

    const getVariantImage = (
      sku: string,
      images: Array<{
        url: string;
        altText?: string;
        isDefault?: boolean;
      }> = [],
    ) => {
      const variantId = getVariantIdentifier(sku);
      return images.find((img) =>
        img.altText?.toLowerCase().includes(variantId?.split('-')[1] || ''),
      );
    };

    const allImages = product?.images?.edges?.map((img) => img.node) || [];
    const currentVariant = product?.variants?.edges?.find((edge) => edge.node.sku === product.sku);

    if (product) {
      const selectedOptions = product.productOptions?.edges
        ?.map((edge) => {
          if (edge.node.__typename === 'MultipleChoiceOption') {
            const selectedValue = edge.node.values?.edges?.find(
              (valueEdge) => valueEdge.node.isSelected,
            );

            return {
              optionName: edge.node.displayName,
              selectedValue: selectedValue?.node.label,
              displayStyle: edge.node.displayStyle,
              isSelected: selectedValue?.node.isSelected,
            };
          }
          return null;
        })
        .filter(Boolean);

      if (currentVariant) {
        setCurrentVariantId(currentVariant.node.entityId);
      }
    }
  }, [product]);

  useEffect(() => {
    if (product?.variants?.edges) {
      const matchingVariant = product.variants.edges.find(
        (variant) => variant.node.sku === product.sku,
      );

      const variantImages = product?.images?.edges?.map((edge) => edge.node) || [];
      const currentVariantImage = variantImages.find((img) =>
        img.altText
          ?.toLowerCase()
          .includes(product.sku.split('_')[1]?.split('-')[1]?.toLowerCase() || ''),
      );

      setCurrentVariantId(matchingVariant?.node?.entityId);
    }
  }, [product?.sku, product?.variants?.edges]);

  const { mediaItems, selectedItem } = useMemo(() => {
    const filteredImages = (() => {
      let filtered = Array.isArray(images) ? images : [];
      if (selectedVariantId) {
        const variantImages = filtered.filter((img) => img.variantId === selectedVariantId);
        filtered =
          variantImages.length > 0 ? variantImages : filtered.filter((img) => !img.variantId);
      }
      if (productMpn) {
        const mpnImages = filtered.filter((img) =>
          img.altText?.toLowerCase()?.includes(productMpn.toLowerCase()),
        );
        if (mpnImages.length > 0) filtered = mpnImages;
      }
      return filtered;
    })();

    const processedVideos = (Array.isArray(videos) ? videos : []).map((video) => ({
      ...video,
      type: video.type || (isYoutubeUrl(video.url) ? 'youtube' : 'direct'),
    }));

    const items = [
      ...filteredImages.map((image) => ({
        type: 'image' as const,
        altText: image.altText,
        src: image.src,
        variantId: image.variantId,
      })),
      ...processedVideos.map((video) => ({
        type: 'video' as const,
        title: video.title,
        url: video.url,
        videoType: video.type,
      })),
    ];

    return {
      mediaItems: items,
      selectedItem: items[selectedIndex] || null,
    };
  }, [images, videos, selectedVariantId, productMpn, selectedIndex]);

  useEffect(() => {
    if (!selectedItem) return;

    const currentMediaKey = `${selectedItem.type}-${
      selectedItem.type === 'image' ? selectedItem.src : selectedItem.url
    }`;
    if (prevMediaRef.current !== currentMediaKey) {
      prevMediaRef.current = currentMediaKey;
      setCurrentMainMedia({
        type: selectedItem.type,
        src: selectedItem.type === 'image' ? selectedItem.src : undefined,
        url: selectedItem.type === 'video' ? selectedItem.url : undefined,
        altText: selectedItem.type === 'image' ? selectedItem.altText : undefined,
        title: selectedItem.type === 'video' ? selectedItem.title : undefined,
      });
    }
  }, [selectedItem, setCurrentMainMedia]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [selectedVariantId]);

  useEffect(() => {
    setIsPlaying(false);
    setVideoError(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [selectedIndex]);

  const handleThumbnailClick = (index: number) => {
    if (index !== selectedIndex) {
      setSelectedIndex(index);
      prevMediaRef.current = null;
    }
    openPopup(index);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setVideoError(null);
          })
          .catch((error) => {
            console.error('Error playing video:', error);
            setIsPlaying(false);
            setVideoError('Failed to play video');
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.target as HTMLVideoElement;
    let errorMessage = 'Unknown video error';

    if (videoElement.error) {
      switch (videoElement.error.code) {
        case 1:
          errorMessage = 'Video loading aborted';
          break;
        case 2:
          errorMessage = 'Network error while loading video';
          break;
        case 3:
          errorMessage = 'Video decoding failed';
          break;
        case 4:
          errorMessage = 'Video not supported';
          break;
      }
    }

    setVideoError(errorMessage);
    setIsPlaying(false);
  };

  const handleSourceError = (e: React.SyntheticEvent<HTMLSourceElement, Event>) => {
    console.error('Source Error Details:', {
      sourceElement: e.target,
      src: (e.target as HTMLSourceElement).src,
      type: (e.target as HTMLSourceElement).type,
    });
    setVideoError('Failed to load video source');
  };

  const handleRetryVideo = () => {
    setVideoError(null);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const openPopup = (index?: number) => {
    if (typeof index === 'number' && index >= 0 && index < mediaItems.length) {
      setSelectedIndex(index);
      prevMediaRef.current = null;
    }
    setViewAll(true);
  };

  const closePopup = () => {
    setViewAll(false);
  };

  const handleNextItem = () => {
    setSelectedIndex((prev) => {
      const next = (prev + 1) % mediaItems.length;
      prevMediaRef.current = null;
      return next;
    });
  };

  const handlePrevItem = () => {
    setSelectedIndex((prev) => {
      const next = prev === 0 ? mediaItems.length - 1 : prev - 1;
      prevMediaRef.current = null;
      return next;
    });
  };

  if (mediaItems.length === 0) return null;

  const remainingItemsCount = Math.max(0, mediaItems.length - 4);

  const promoImages = [
    {
      alt: 'Buy one get one Free Now through 8/24',
      msg: 'Buy one get one Free Now through 8/24',
      images: [{ filename: bannerIcon, width: '50w' }],
    },
    {
      alt: 'Save 20% on all items through 9/01',
      images: [
        { filename: bannerIcon, width: '50w' },
        { filename: bannerIcon, width: '50w' },
        { filename: bannerIcon, width: '50w' },
      ],
    },
    {
      alt: 'Save 20% on all items through 9/01',
      images: [],
      msg: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    },
  ];

  return (
    <div aria-live="polite" className={className}>
      <div className="gallery-container relative flex flex-col-reverse xl:h-[40em] xl:flex-row">
        <div className="gallery-items mr-0 mt-3 flex flex-col xl:mr-4 xl:mt-0 xl:items-center">
          <nav
            ref={thumbnailRef}
            aria-label="Thumbnail navigation"
            className="no-scrollbar xl:gap-x:0 flex flex-row justify-between gap-x-[15px] gap-y-[15px] overflow-x-auto xl:flex-col"
            style={{ maxHeight: '700px' }}
          >
            {(viewAll ? mediaItems : mediaItems.slice(0, 4)).map((item, index) => {
              const isActive = selectedIndex === index;
              const isVideo = item.type === 'video';
              const isYoutube = isVideo && isYoutubeUrl(item.url);

              return (
                <button
                  aria-label={isVideo ? 'Play video' : 'Enlarge product image'}
                  aria-pressed={isActive}
                  className={cn(
                    'gallery-thumbnail left-side relative h-[3.6em] w-[3.6em] flex-shrink-0 gap-y-8 border-2 transition-colors duration-200 hover:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 md:h-[8em] md:w-[8em] lg:h-[10em] lg:w-[10em] xl:h-[7.2em] xl:w-[7em]',
                    isActive ? 'border-primary' : 'border-gray-200',
                  )}
                  key={`${isVideo ? item.url : item.src}-${index}`}
                  onClick={() => handleThumbnailClick(index)}
                >
                  {isVideo ? (
                    <div className="relative h-full w-full">
                      {isYoutube ? (
                        <img
                          src={getYoutubeThumbnailUrl(item.url || '') || ''}
                          alt={item.title || 'Video thumbnail'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <video className="h-full w-full object-cover" preload="metadata">
                          <source src={item.url} type="video/mp4" onError={handleSourceError} />
                        </video>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <svg
                          className="h-6 w-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <BcImage
                      alt={item.altText || ''}
                      className="flex h-full w-full cursor-pointer items-center justify-center object-fill"
                      height={94}
                      priority={true}
                      src={item.src || ''}
                      width={94}
                    />
                  )}

                  <div
                    onClick={() => openPopup()}
                    className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-white bg-opacity-60 p-1 xl:bottom-2 xl:right-2 xl:m-1"
                  >
                    <ExpandIcon />
                  </div>
                </button>
              );
            })}

            {!viewAll && mediaItems.length > 4 && (
              <button
                aria-label="View all items"
                className="gallery-thumbnail relative h-[3.6em] w-[3.6em] flex-shrink-0 border-2 border-gray-200 transition-colors duration-200 hover:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 md:h-[8em] md:w-[8em] lg:h-[10em] lg:w-[10em] xl:h-[7.2em] xl:w-[7em]"
                onClick={() => openPopup(3)}
              >
                <div className="relative h-full w-full">
                  <BcImage
                    alt="View All"
                    className="h-full w-full object-cover brightness-50"
                    height={94}
                    priority={true}
                    src={mediaItems[3]?.src || ''}
                    width={94}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-[0.625rem] xl:text-lg">VIEW ALL</span>
                    <span className="mt-1 text-[0.625rem] xl:text-sm">{`(+${remainingItemsCount})`}</span>
                  </div>
                  <div className="absolute bottom-1 right-1 m-1 h-4 w-4 rounded-full bg-white bg-opacity-60 p-1 xl:bottom-2 xl:right-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      className="h-full w-full"
                    >
                      <path
                        d="M0 18V12H2V14.6L5.1 11.5L6.5 12.9L3.4 16H6V18H0ZM12.9 6.5L11.5 5.1L14.6 2H12V0H18V6H16V3.4L12.9 6.5Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            )}
          </nav>
        </div>

        <figure className="main-gallery group relative aspect-square h-full max-h-[100%] w-full">
          {selectedItem && (
            <>
              {product && (
                <div className="absolute right-4 top-4 z-10">
                  <WishlistAddToList
                    wishlists={wishlists}
                    hasPreviousPage={false}
                    product={{
                      entityId: product.entityId,
                      name: product.name,
                      path: product.path || '',
                      brand: product.brand
                        ? {
                            name: product.brand.name,
                            path: product.brand.path,
                          }
                        : undefined,
                      prices: product.prices,
                      images:
                        product.images?.edges
                          ?.filter((edge) =>
                            edge.node.altText
                              ?.toLowerCase()
                              .includes(product.mpn?.toLowerCase() || ''),
                          )
                          .map((edge) => ({
                            url: edge.node.url,
                            altText: edge.node.altText,
                            isDefault: edge.node.isDefault,
                          })) || [],
                      variantEntityId: currentVariantId,
                      mpn: product.mpn,
                      selectedOptions:
                        product.productOptions?.edges
                          ?.map((edge) => {
                            if (edge.node.__typename === 'MultipleChoiceOption') {
                              const selectedValue = edge.node.values?.edges?.find(
                                (valueEdge) => valueEdge.node.isSelected,
                              );
                              return {
                                optionName: edge.node.displayName,
                                selectedValue: selectedValue?.node.label,
                              };
                            }
                            return null;
                          })
                          .filter(Boolean) || [],
                    }}
                    onGuestClick={() => {
                      window.location.href = '/login';
                    }}
                  />
                </div>
              )}

              {selectedItem.type === 'image' ? (
                <div
                  className="product-img relative float-left h-full w-full overflow-hidden"
                  data-scale="2"
                >
                  <ProductImage size="original" scale={2} src={selectedItem.src || ''} />
                </div>
              ) : (
                <div className="relative h-full w-full">
                  {isYoutubeUrl(selectedItem.url) ? (
                    <div className="relative h-full w-full">
                      <iframe
                        src={getYoutubeEmbedUrl(selectedItem.url || '') || ''}
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={selectedItem.title || 'YouTube video'}
                      />
                    </div>
                  ) : (
                    <>
                      {videoError ? (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                          <div className="text-center">
                            <p className="text-red-500">{videoError}</p>
                            <button
                              className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                              onClick={handleRetryVideo}
                            >
                              Retry
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <video
                            ref={videoRef}
                            className="h-full w-full object-cover"
                            controls
                            playsInline
                            preload="metadata"
                            onError={handleVideoError}
                          >
                            <source
                              src={selectedItem.url}
                              type="video/mp4"
                              onError={handleSourceError}
                            />
                            Your browser does not support the video tag.
                          </video>
                          {!isPlaying && !videoError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                              <button
                                className="rounded-full bg-white p-4 shadow-lg transition-transform hover:scale-110"
                                onClick={handleVideoClick}
                                aria-label="Play video"
                              >
                                <svg
                                  className="h-8 w-8 text-gray-800"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              <div
                className="absolute bottom-4 right-4 h-6 w-6 cursor-pointer rounded-full bg-white bg-opacity-60 p-[6px] transition-opacity xl:m-1"
                onClick={() => openPopup()}
              >
                <ExpandIcon />
              </div>

              {mediaItems.length > 1 && (
                <>
                  <button
                    aria-label="Previous item"
                    className="absolute left-4 top-1/2 -translate-y-1/2 transform border border-gray-300 bg-white p-3 text-lg font-bold leading-[0.9] text-black opacity-0 transition-opacity duration-300 hover:bg-gray-200 group-hover:opacity-100"
                    onClick={handlePrevItem}
                  >
                    &#10094;
                  </button>
                  <button
                    aria-label="Next item"
                    className="absolute right-4 top-1/2 -translate-y-1/2 transform border border-gray-300 bg-white p-3 text-lg font-bold leading-[0.9] text-black opacity-0 transition-opacity duration-300 hover:bg-gray-200 group-hover:opacity-100"
                    onClick={handleNextItem}
                  >
                    &#10095;
                  </button>
                </>
              )}
            </>
          )}
        </figure>
      </div>

      {viewAll && selectedItem && (
        <GalleryModel
          isOpen={viewAll}
          onClose={closePopup}
          mediaItems={mediaItems}
          selectedIndex={selectedIndex}
          onSelectIndex={(index) => {
            setSelectedIndex(index);
            prevMediaRef.current = null;
          }}
        />
      )}

      <Banner promoImages={promoImages} />
    </div>
  );
};

export { Gallery };
