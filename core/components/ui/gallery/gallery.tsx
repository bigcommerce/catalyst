import { useState, useRef, useEffect, useMemo } from 'react';
import { BcImage } from '~/components/bc-image';
import { cn } from '~/lib/utils';
import { GalleryModel } from './belami-gallery-view-all-model-pdp';
import { Banner } from './belami-banner-pdp';
import ProductImage from './product-zoom';

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
}: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(defaultImageIndex);
  const [viewAll, setViewAll] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const thumbnailRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const safeImages = useMemo(() => {
    return Array.isArray(images) ? images : [];
  }, [images]);

  const safeVideos = useMemo(() => {
    return Array.isArray(videos) ? videos : [];
  }, [videos]);

  const filteredImages = useMemo(() => {
    let filteredImages = safeImages;

    if (selectedVariantId) {
      filteredImages = safeImages.filter((image) => image.variantId === selectedVariantId);

      if (filteredImages.length === 0) {
        filteredImages = safeImages.filter((image) => !image.variantId);
      }
    }

    if (productMpn) {
      const mpnFilteredImages = filteredImages.filter((image) =>
        image.altText?.toLowerCase?.()?.includes?.(productMpn.toLowerCase()),
      );

      if (mpnFilteredImages.length > 0) {
        filteredImages = mpnFilteredImages;
      }
    }

    return filteredImages;
  }, [safeImages, selectedVariantId, productMpn]);

  const processedVideos = useMemo(() => {
    return safeVideos.map((video) => ({
      ...video,
      type: video.type || (isYoutubeUrl(video.url) ? 'youtube' : 'direct'),
    }));
  }, [safeVideos]);

  const mediaItems = useMemo(() => {
    return [
      ...filteredImages.map(
        (image): MediaItem => ({
          type: 'image',
          altText: image.altText,
          src: image.src,
          variantId: image.variantId,
        }),
      ),
      ...processedVideos.map(
        (video): MediaItem => ({
          type: 'video',
          title: video.title,
          url: video.url,
          videoType: video.type,
        }),
      ),
    ];
  }, [filteredImages, processedVideos]);

  const selectedItem = mediaItems[selectedIndex];
  const remainingItemsCount = Math.max(0, mediaItems.length - 4);

  if (mediaItems.length === 0) return null;

  useEffect(() => {
    const maxIndex = mediaItems.length - 1;
    if (selectedIndex > maxIndex) {
      setSelectedIndex(0);
    }
  }, [mediaItems, selectedIndex]);

  useEffect(() => {
    setIsPlaying(false);
    setVideoError(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [selectedVariantId]);

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
    }
    setViewAll(true);
  };

  const closePopup = () => {
    setViewAll(false);
  };

  const handleNextItem = () => {
    setSelectedIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const handlePrevItem = () => {
    setSelectedIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

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
      <div className="gallery-container relative flex flex-col-reverse xl:flex-row">
        <div className="gallery-items mr-0 mt-5 flex flex-col items-center xl:mr-4 xl:mt-0 xl:flex-col xl:space-y-4">
          <nav
            ref={thumbnailRef}
            aria-label="Thumbnail navigation"
            className="no-scrollbar flex flex-row space-x-4 overflow-x-auto xl:flex-col xl:space-x-0 xl:space-y-4"
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
                    'gallery-thumbnail relative h-12 w-12 flex-shrink-0 border-2 transition-colors duration-200 hover:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 xl:h-[6.4em] xl:w-[6.4em]',
                    isActive ? 'border-primary' : 'border-gray-200',
                  )}
                  key={`${isVideo ? item.url : item.src}-${index}`}
                  onClick={() => setSelectedIndex(index)}
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
                  <BcImage
                    alt={item.altText || ''}
                    className="absolute bottom-2 right-2 m-1 h-4 w-4 rounded-full bg-white object-fill p-1 opacity-70"
                    height={10}
                    priority={true}
                    src={galleryExpandIcon}
                    width={10}
                  />
                </button>
              );
            })}

            {!viewAll && mediaItems.length > 4 && (
              <button
                aria-label="View all items"
                className="gallery-thumbnail relative h-12 w-12 flex-shrink-0 border-2 border-gray-200 transition-colors duration-200 hover:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 xl:h-[6.4em] xl:w-[6.4em]"
                onClick={() => openPopup()}
              >
                {mediaItems[3]?.type === 'video' ? (
                  <div className="relative h-full w-full">
                    {isYoutubeUrl(mediaItems[3]?.url) ? (
                      <img
                        src={getYoutubeThumbnailUrl(mediaItems[3]?.url || '') || ''}
                        alt="Video thumbnail"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <video className="h-full w-full object-cover" preload="metadata">
                        <source src={mediaItems[3]?.url} type="video/mp4" />
                      </video>
                    )}
                  </div>
                ) : (
                  <BcImage
                    alt="View All"
                    className="flex h-full w-full cursor-pointer items-center justify-center object-fill"
                    height={94}
                    priority={true}
                    src={mediaItems[3]?.src || ''}
                    width={94}
                  />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
                  <span className="text-[0.625rem] xl:text-lg">View All</span>
                  <span className="mt-1 text-[0.625rem] xl:text-sm">{`(+${remainingItemsCount})`}</span>
                </div>
              </button>
            )}
          </nav>
        </div>

        <figure className="main-gallery group relative aspect-square h-full max-h-[100%] w-full">
          {selectedItem && (
            <>
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
                className="absolute bottom-4 right-4 m-1 h-6 w-6 cursor-pointer rounded-full bg-white object-cover p-1 opacity-70 transition-opacity hover:opacity-100"
                onClick={() => openPopup()}
              >
                <img
                  alt="Overlay"
                  className="h-full w-full object-cover"
                  height={24}
                  src={galleryExpandIcon}
                  width={24}
                />
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
          onSelectIndex={setSelectedIndex}
        />
      )}

      <Banner promoImages={promoImages} />
    </div>
  );
};

export { Gallery };
