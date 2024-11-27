import { SubmissionResult } from '@conform-to/react'

export type Action<State, Payload> = (
  state: Awaited<State>,
  payload: Payload
) => State | Promise<State>

export type CartState = {
  lineItems: CartLineItem[]
  lastResult: SubmissionResult | null
}

export type CartLineItem = {
  id: string
  image: { alt: string; src: string }
  title: string
  subtitle: string
  quantity: number
  price: string
}

export type CartSummary = {
  title?: string
  caption?: string
  subtotalLabel?: string
  subtotal: string | Promise<string>
  shippingLabel?: string
  shipping?: string
  taxLabel?: string
  tax?: string | Promise<string>
  grandTotalLabel?: string
  grandTotal?: string | Promise<string>
  ctaLabel?: string
}

export type CartEmptyState = {
  title: string
  subtitle: string
  cta: {
    label: string
    href: string
  }
}
