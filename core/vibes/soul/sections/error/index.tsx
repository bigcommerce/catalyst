import { Button } from '@/vibes/soul/primitives/button';

interface Props {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaAction?: () => void | Promise<void>;
}

export function Error({ title, subtitle, ctaLabel, ctaAction }: Props) {
  return (
    <section className="@container">
      <div className="mx-auto max-w-3xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        <h1 className="font-heading mb-3 text-3xl leading-none font-medium @xl:text-4xl @4xl:text-5xl">
          {title}
        </h1>
        <p className="text-contrast-500 text-lg">{subtitle}</p>

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
