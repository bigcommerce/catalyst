export default function Loading() {
  return (
    <section className="@container">
      <div className="mx-auto grid w-full max-w-screen-xl grid-cols-1 items-stretch gap-x-8 gap-y-10 px-4 py-10 @xl:px-6 @xl:py-14 @2xl:grid-cols-2 @4xl:px-8 @4xl:py-20 @5xl:gap-x-16">
        {/* Product Gallery */}
        <div className="hidden @2xl:block">
          <div className="@container">
            <div className="w-full overflow-hidden rounded-xl bg-contrast-100 @xl:rounded-2xl">
              <div className="flex">
                <div className="relative aspect-[4/5] w-full shrink-0 grow-0 basis-full">
                  <div className="h-full max-w-[768px] bg-contrast-100" />
                </div>
                <div className="relative aspect-[4/5] w-full shrink-0 grow-0 basis-full">
                  <div className="h-full max-w-[768px] bg-contrast-100" />
                </div>
                <div className="relative aspect-[4/5] w-full shrink-0 grow-0 basis-full">
                  <div className="h-full max-w-[768px] bg-contrast-100" />
                </div>
              </div>
            </div>

            <div className="mt-2 flex max-w-full gap-2 overflow-x-auto">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-contrast-100 transition-all duration-300 hover:opacity-100 @md:h-16 @md:w-16">
                <div className="h-full max-w-[768px] bg-contrast-100" />
              </div>
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-contrast-100 transition-all duration-300 hover:opacity-100 @md:h-16 @md:w-16">
                <div className="h-full max-w-[768px] bg-contrast-100" />
              </div>
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-contrast-100 transition-all duration-300 hover:opacity-100 @md:h-16 @md:w-16">
                <div className="h-full max-w-[768px] bg-contrast-100" />
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full">
          {/* Subtitle */}
          <div className="h-5 w-36 rounded-md bg-contrast-100" />

          {/* Title */}
          <div className="mb-4 mt-2 h-9 w-full rounded-md bg-contrast-100" />

          {/* Rating */}
          <div className="h-6 w-32 rounded-md bg-contrast-100" />

          {/* Price */}
          <div className="my-3 h-9 w-28 rounded-md bg-contrast-100" />

          {/* Description */}
          <div className="h-56 w-full rounded-md bg-contrast-100" />
        </div>
      </div>
    </section>
  );
}
