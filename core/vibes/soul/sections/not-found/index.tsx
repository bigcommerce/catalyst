interface Props {
  title?: string;
  subtitle?: string;
}

export function NotFound({
  title = 'Not found',
  subtitle = "Take a look around if you're lost.",
}: Props) {
  return (
    <section className="@container">
      <div className="mx-auto max-w-3xl px-4 pt-10 @xl:px-6 @xl:pt-14 @4xl:px-8 @4xl:pt-20">
        <h1 className="mb-3 font-heading text-3xl font-medium leading-none @xl:text-4xl @4xl:text-5xl">
          {title}
        </h1>
        <p className="text-lg text-contrast-500">{subtitle}</p>
      </div>
    </section>
  );
}
