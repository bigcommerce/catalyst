interface Props {
  title?: string;
  subtitle?: string;
}

export function NotFound({
  title = 'Not found',
  subtitle = "Take a look around if you're lost.",
}: Props) {
  return (
    <section className="@container pb-20">
      <div className="mx-auto max-w-3xl px-4 pt-10 @xl:px-6 @xl:pt-14 @4xl:px-8 @4xl:pt-20">
        <h1 className="font-heading mb-3 text-3xl leading-none font-medium @xl:text-4xl @4xl:text-5xl">
          {title}
        </h1>
        <p className="text-contrast-500 text-lg">{subtitle}</p>
      </div>
    </section>
  );
}
