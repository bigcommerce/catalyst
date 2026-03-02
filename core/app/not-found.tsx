export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <h1 className="font-heading text-4xl font-medium">Page not found</h1>
      <p className="mt-4 text-lg text-[hsl(var(--contrast-400))]">
        The page you are looking for could not be found.
      </p>
      <a
        className="mt-6 inline-flex items-center text-[hsl(var(--foreground))] underline underline-offset-4 hover:no-underline"
        href="/"
      >
        Go to homepage
      </a>
    </div>
  );
}
