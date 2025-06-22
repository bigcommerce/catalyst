import Image from 'next/image';

const aspectRatios = {
  '1:1': 'aspect-[1/1]',
  '5:6': 'aspect-[5/6]',
  '3:4': 'aspect-[3/4]',
};

interface ProductCardProps {
  className?: string;
  imageUrl: string;
  name: string;
  price?: string;
  salePrice?: string;
  rating: number;
  reviewCount: number;
  showBadge?: boolean;
  badgeText?: string;
  badgeColor?: string;
  imageAspectRatio: keyof typeof aspectRatios;
  showReviews?: boolean;
}

export const ProductCard = ({
  className,
  imageUrl,
  name,
  price,
  salePrice,
  rating,
  reviewCount,
  showBadge = false,
  badgeText = 'Best Seller',
  badgeColor = 'bg-yellow-400',
  imageAspectRatio,
  showReviews = true,
}: ProductCardProps) => {
  return (
    <div className={`max-w-xl overflow-hidden rounded-lg bg-white shadow-lg ${className}`}>
      <div className={`relative ${aspectRatios[imageAspectRatio]} overflow-hidden`}>
        {showBadge && (
          <span
            className={`absolute right-3 top-3 ${badgeColor} rounded px-2 py-1 text-xs font-bold text-white`}
          >
            {badgeText}
          </span>
        )}
        <Image src={imageUrl} alt={name} layout="fill" objectFit="cover" />
      </div>
      <div className="p-4">
        <h2 className="mb-1 text-xl font-bold text-gray-800">{name}</h2>
        {showReviews && (
          <div className="mb-2 flex items-center">
            <div className="text-yellow-400">
              {'★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {rating} ({reviewCount} reviews)
            </span>
          </div>
        )}

        {salePrice ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">${salePrice}</span>
            <span className="text-gray-400 line-through">${price}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">${price}</span>
          </div>
        )}
        <button className="mt-4 w-full rounded bg-gray-900 py-2 text-white transition hover:bg-gray-800">
          Shop Now →
        </button>
      </div>
    </div>
  );
};
