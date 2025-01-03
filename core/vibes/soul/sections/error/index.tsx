import { Button } from '@/vibes/soul/primitives/button';

interface Props {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaAction?: () => void | Promise<void>;
}

export function Error({
  title = 'Something went wrong!',
  subtitle = 'Please try again or contact our support team for assistance.',
  ctaLabel = 'Try again',
  ctaAction,
}: Props) {
  return (
    <section className="@container">
      <div className="mx-auto max-w-3xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        <h1 className="mb-3 font-heading text-3xl font-medium leading-none @xl:text-4xl @4xl:text-5xl">
          {title}
        </h1>
        <p className="text-lg text-contrast-500">{subtitle}</p>

        {ctaAction && (
          <form action={ctaAction}>
            <Button className="mt-8" size="large" type="submit" variant="primary">
              {ctaLabel}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
