import { setRequestLocale } from 'next-intl/server';

import { Link } from '~/components/link';

interface Props {
  params: Promise<{ locale: string }>;
}

// POC: a fake "list payment methods" page.
//
// In the real implementation the provider list and stored instruments come from
// new Storefront GraphQL surfaces (see the vault-PROJECT-6074 design doc). Here we
// hardcode a single ECP (ACH) section whose Add link loads the
// storefront-account-payments microapp on /account/payment-methods/add.
export default async function PaymentMethodsPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <div>
      <h1 className="mb-8 font-[family-name:var(--font-family-heading)] text-4xl font-medium leading-none tracking-tight">
        Payment Methods
      </h1>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-medium">ACH Direct Debit</h2>

        <Link
          className="flex min-h-44 w-full max-w-sm flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[hsl(var(--contrast-200))] p-8 text-center transition-colors hover:border-[hsl(var(--foreground))] hover:bg-[hsl(var(--contrast-100))]"
          href="/account/payment-methods/add?method_type=ecp"
        >
          <span aria-hidden className="text-4xl leading-none">
            +
          </span>
          <span className="font-[family-name:var(--font-family-mono)] text-xs uppercase tracking-wide text-[hsl(var(--contrast-500))]">
            Add new payment method
          </span>
        </Link>
      </section>

      <p className="text-sm text-[hsl(var(--contrast-400))]">
        POC page with a fake provider list. Only the ECP (ACH) Add flow is wired, and it loads the
        storefront-account-payments microapp.
      </p>
    </div>
  );
}
