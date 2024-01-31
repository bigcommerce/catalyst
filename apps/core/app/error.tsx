'use client';

export const metadata = {
  title: 'Error',
};

export default function Error() {
  return (
    <div className="h-full px-10 py-12 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-h3 lg:text-h2">There was a server error!</h1>
        <p className="text-base">Please try again later.</p>
      </div>
    </div>
  );
}
