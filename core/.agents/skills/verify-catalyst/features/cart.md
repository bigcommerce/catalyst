# Cart

The cart lists line items with quantity controls and removal, a summary with subtotal, tax, shipping estimate, coupon code, and total, and hands off to BigCommerce checkout.

## Sub-features

- `cart-empty` shows the empty state with `Continue shopping`.
- `cart-lines` lists each item with price, quantity controls, and `Remove item`.
- `cart-quantity` updates totals when quantity changes; rapid clicks coalesce.
- `cart-shipping` estimates shipping from the summary's `Shipping` → `Add` form.
- `cart-coupon` applies a coupon code.
- `cart-checkout` sends the shopper to checkout via `Proceed to checkout`.

## How to get to it (user POV)

- Choose the `Cart` link in the header.
- Choose `your cart` in the toast after adding a product.
- Visit `/cart`.

## Driving it with verify.mjs

Preconditions:

- For anything except the empty state: add a product first, through the PDP flow in [product-detail.md](./product-detail.md). Do not seed the cart another way.

- **Empty state.** On a fresh context, `page.goto('/cart')`. The `heading` level 1 reads `Your cart is empty.` and a `link` `Continue shopping` points to the catalog.
- **Line items.** After adding a product, `page.goto('/cart')`. The `main` region contains a `list` whose `listitem` shows the product name and price. The level 1 `heading` reads `Cart` followed by the item count.
- **Quantity.** Choose `button` `Increase quantity` inside the line. The quantity text and the `Subtotal` and `Total` definitions in the summary update.
- **Remove.** Choose `button` `Remove item`. The line disappears; with no lines left, the empty state returns.
- **Coupon.** Fill `textbox` `Coupon code` and choose `Apply`. A valid code shows a discount line; an invalid code shows a field error.
- **Checkout handoff.** Choose `button` `Proceed to checkout`. The browser leaves Catalyst for the store's checkout domain. Stop the journey once the URL changes; checkout is not Catalyst UI.

## Gotchas

- The decrease button's accessible name is `Decrease count`, while the PDP uses `Decrease quantity`. Increase is `Increase quantity` in both places.
- `Decrease count` is disabled at quantity 1; use `Remove item` instead.
- Each browser context has its own cart cookie. Carts are per channel, so multi-channel storefronts keep a separate cart per channel.
- Checkout runs on BigCommerce. Cross-origin preflight can fail under headless Chromium on some stores; record that as a boundary, not as a Catalyst failure.
- Restore state: remove lines you added so later runs start from an empty cart.
