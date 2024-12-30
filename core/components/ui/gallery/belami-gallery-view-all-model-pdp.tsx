import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { BcImage } from '~/components/bc-image';
import { useEffect, useRef, useState } from 'react';

interface MediaItem {
  type: 'image' | 'video';
  altText?: string;
  src?: string;
  url?: string;
  title?: string;
  videoType?: 'youtube' | 'direct';
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItems: MediaItem[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

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

const GalleryModel = ({
  isOpen,
  onClose,
  mediaItems,
  selectedIndex,
  onSelectIndex,
}: ModalProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const body = document.body;
    const originalPosition = body.style.position;

    if (isOpen) {
      body.classList.add('modal-open');
      body.style.position = 'fixed';
      body.style.overflow = 'hidden';
      body.style.width = '100%';
    } else {
      body.classList.remove('modal-open');
      body.style.position = originalPosition;
      body.style.overflow = '';
    }

    return () => {
      body.classList.remove('modal-open');
      body.style.position = originalPosition;
      body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    setIsPlaying(false);
    setVideoError(null);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const validIndex = Math.max(0, Math.min(selectedIndex, mediaItems.length - 1));
  const selectedItem = mediaItems[validIndex];

  if (!selectedItem) {
    return (
      <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-white p-4">
          <p>No media item selected</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    onSelectIndex(validIndex === 0 ? mediaItems.length - 1 : validIndex - 1);
  };

  const handleNext = () => {
    onSelectIndex(validIndex === mediaItems.length - 1 ? 0 : validIndex + 1);
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

  const handleRetryVideo = () => {
    setVideoError(null);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const renderMediaContent = () => {
    if (selectedItem.type === 'image') {
      return (
        <BcImage
          alt={selectedItem.altText || 'Image not available'}
          className="h-full w-[80%] object-contain"
          src={selectedItem.src || ''}
          width={800}
          height={600}
          priority={true}
        />
      );
    }

    if (isYoutubeUrl(selectedItem.url)) {
      const embedUrl = getYoutubeEmbedUrl(selectedItem.url || '');
      if (!embedUrl) return null;

      return (
        <iframe
          src={embedUrl}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={selectedItem.title || 'YouTube video'}
        />
      );
    }

    return (
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
              className="h-full w-full"
              controls
              playsInline
              preload="metadata"
              onError={handleVideoError}
            >
              <source src={selectedItem.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {!isPlaying && !videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <button
                  className="rounded-full bg-white p-4 shadow-lg transition-transform hover:scale-110"
                  onClick={handleVideoClick}
                  aria-label="Play video"
                >
                  <svg className="h-8 w-8 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="modal-content relative flex h-full w-full flex-col bg-white p-[30px] xl:flex-row">
        <div className="gallery-slider relative flex h-[65%] w-full items-center justify-center overflow-hidden sm:h-[100%] xl:h-full xl:w-[70%] xl:py-[20px]">
          <button
            aria-label="Previous item"
            className="absolute left-8 top-1/2 -translate-y-1/2 transform p-2 hover:bg-opacity-50 focus:outline-none"
            onClick={handlePrevious}
          >
            <ChevronLeft size={36} className="hover:text-gray-300" />
          </button>

          <div className="relative h-full w-[80%]">{renderMediaContent()}</div>

          <button
            aria-label="Next item"
            className="absolute right-8 top-1/2 -translate-y-1/2 transform p-2 hover:bg-opacity-50 focus:outline-none"
            onClick={handleNext}
          >
            <ChevronRight size={36} className="hover:text-gray-300" />
          </button>
        </div>

        <div className="gallery-thumbnails h-auto w-full overflow-y-auto p-4 xl:h-full xl:w-[25%]">
          <div className="grid grid-cols-6 gap-4 xl:grid-cols-3">
            {mediaItems.map((item, index) => (
              <div
                key={index}
                className={`relative cursor-pointer border-2 ${
                  index === validIndex ? 'border-[#03465C]' : 'border-transparent'
                }`}
                onClick={() => onSelectIndex(index)}
              >
                {item.type === 'video' ? (
                  <div className="relative h-12 w-full md:h-24">
                    {isYoutubeUrl(item.url) ? (
                      <img
                        src={getYoutubeThumbnailUrl(item.url || '') || ''}
                        alt={item.title || 'Video thumbnail'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <video className="h-full w-full object-cover">
                        <source src={item.url} type="video/mp4" />
                      </video>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
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
                    className="h-12 w-28 object-cover md:h-24"
                    src={item.src || ''}
                    width={96}
                    height={96}
                    loading="lazy"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          aria-label="Close gallery"
          className="absolute left-1/2 top-4 z-10 flex w-[10%] -translate-x-1/2 transform items-center justify-center p-2 text-black xl:-right-8 xl:left-auto xl:top-8 xl:transform-none"
          onClick={onClose}
        >
          <X className="w-[25px]" size={32} />
        </button>
      </div>
    </div>
  );
};

export { GalleryModel };
