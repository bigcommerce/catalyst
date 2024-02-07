import { Skeleton } from '@bigcommerce/components/skeleton';

export const SkeletonIU = () => (
  <div>
    <div className="mb-8 lg:flex lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col items-center gap-3 whitespace-nowrap md:flex-row">
        <div className="flex w-full flex-col gap-3 md:flex-row md:justify-between lg:hidden">
          <Skeleton className="h-12 w-full md:w-56" />
          <Skeleton className="h-12  w-full md:w-56" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-8">
      <div className="mb-8 hidden lg:block">
        <div className="mb-8 hidden flex-col gap-8 lg:flex">
          <div className="flex flex-wrap justify-between gap-y-3">
            <Skeleton className="h-10 w-2/5" />
            <Skeleton className="h-10 w-2/5" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-8 w-2/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-8 w-1/3" />
          </div>

          <div className="flex flex-col gap-3">
            <Skeleton className="mb-2 h-4 w-2/4" />

            <div className="inline-flex items-center gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="inline-flex items-center gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="inline-flex items-center gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Skeleton className="mb-2 h-4 w-2/4" />

            <div className="inline-flex items-center gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="inline-flex items-center gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="inline-flex items-center gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Skeleton className="mb-2 h-4 w-2/4" />

            <div className="inline-flex items-center gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="inline-flex items-center gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="inline-flex items-center gap-4">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>

      <section className="col-span-4 lg:col-span-3">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8">
          <div className="flex flex-col gap-3 sm:gap-4">
            <Skeleton className="h-24 w-full sm:h-52 md:h-52" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            <Skeleton className="h-24 w-full sm:h-52 md:h-52" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            <Skeleton className="h-24 w-full sm:h-52 md:h-52" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            <Skeleton className="h-24 w-full sm:h-52 md:h-52" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            <Skeleton className="h-24 w-full sm:h-52 md:h-52" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            <Skeleton className="h-24 w-full sm:h-52 md:h-52" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            <Skeleton className="h-24 w-full sm:h-52 md:h-52" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
          </div>
          <div className="flex flex-col gap-3 sm:gap-4">
            <Skeleton className="h-24 w-full sm:h-52 md:h-52" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
          </div>
          <div className="hidden flex-col gap-3 sm:flex sm:gap-4">
            <Skeleton className="h-24 w-full sm:h-52 md:h-52" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
            <Skeleton className="h-7 w-full sm:h-7 md:h-7" />
          </div>
        </div>
      </section>
    </div>
  </div>
);
