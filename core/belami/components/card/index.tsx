import { clsx } from 'clsx';
import { BcImage as Image } from '~/components/bc-image';
 
import chevronRight from '~/public/home/chevronRight.svg'
 
import { Link } from '~/components/link';
 
export type CardProps = {
  title: string;
  image?: { src: string; alt: string };
  href: string;
  classNames?: {
    root?: string,
    link?: string,
    figure?: string,
    image?: string,
    title?: string
  }
};
 
export function Card({ title, image, href, classNames }: CardProps) {
  return (
    <div className={classNames?.root}>
      <Link
        className="group relative flex cursor-pointer flex-col gap-2 focus-visible:outline-0 focus-visible:ring-2"
        href={href}
      >
        <figure className="relative aspect-[5/6] overflow-hidden rounded-[inherit] bg-contrast-100">
          {image != null ? (
            <Image
              alt={image.alt}
              className="w-full scale-100 select-none bg-contrast-100 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              fill
              sizes="(max-width: 768px) 70vw, 33vw"
              src={image.src}
            />
          ) : (
            <div className="pl-2 pt-3 text-7xl font-bold leading-[0.8] tracking-tighter text-contrast-300 transition-transform duration-500 ease-out group-hover:scale-105">
              {title}
            </div>
          )}
        </figure>
        <h3
          className={clsx(
            'line-clamp-1 text-base font-normal leading-[32px] tracking-[0.5px] text-foreground text-center flex justify-center gap-[5px]',
            '@4xl:text-foreground',
          )}
        >
          {title}
          <Image unoptimized={true} src={chevronRight} width={9} height={12} alt='chevron right' className='mr-1' />
        </h3>
      </Link>
    </div>
  );
}
 
export function CardSkeleton() {
  return (
    <div className="relative flex aspect-[3/4] w-full animate-pulse flex-col gap-2 @4xl:min-w-72">
      {/* Image */}
      <div className="h-full w-full overflow-hidden rounded-lg bg-contrast-100 @4xl:rounded-xl" />
      {/* Title */}
      <div className="mb-1 line-clamp-1 h-6 w-20 rounded-lg bg-contrast-100 @4xl:absolute @4xl:bottom-5 @4xl:left-5" />
    </div>
  );
}