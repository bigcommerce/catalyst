import { Skeleton } from '@bigcommerce/components/Skeleton';

export default function Loading() {
  return (
    <div className="mb-12 mt-4 lg:grid lg:grid-cols-2 lg:gap-8">
      <div className="mb-12 flex flex-col lg:mb-0">
        <div className="relative aspect-square w-full">
          <Skeleton className="aspect-square" />
        </div>
        <div className="-mx-1 mt-8 flex w-full flex-nowrap items-center gap-4 overflow-x-auto px-6 sm:-mx-1 sm:px-1 md:gap-6">
          <Skeleton className="inline-block aspect-square h-20 bg-gray-200 md:h-24" />
          <Skeleton className="inline-block aspect-square h-20 bg-gray-200 md:h-24" />
          <Skeleton className="inline-block aspect-square h-20 bg-gray-200 md:h-24" />
          <Skeleton className="inline-block aspect-square h-20 bg-gray-200 md:h-24" />
          <Skeleton className="inline-block aspect-square h-20 bg-gray-200 md:h-24" />
        </div>
      </div>
      <div className="flex flex-col gap-10">
        <div className="inline-flex flex-col gap-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="inline-flex flex-col gap-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="inline-flex flex-col gap-4 md:flex-row">
          <Skeleton className="h-12 w-full md:w-1/3" />
          <Skeleton className="h-12 w-full md:w-1/3" />
        </div>
      </div>
    </div>
  );
}
