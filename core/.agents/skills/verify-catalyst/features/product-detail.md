# Product detail page

The product detail page (PDP) shows a product's gallery, price, options, quantity, add to cart, wishlist, description, specifications, related products, and reviews.

## Sub-features

- `pdp-gallery` swaps the main image from the thumbnail buttons, and follows variant images when options change.
- `pdp-options` selects variant options (swatches, radios, dropdowns, date pickers) and updates the price and stock.
- `pdp-quantity` changes quantity within stock limits.
- `pdp-add-to-cart` adds the configured item and confirms it with a toast.
- `pdp-wishlist` adds to a wish list (signed-in shoppers).
- `pdp-reviews` shows reviews and the `Write a review` form.

## How to get to it (user POV)

- Choose a product card on a category page, the home page, or search results.
- Visit the product's SEO URL directly (`/<product-slug>`). The `with-routes` proxy resolves it, so the path is not `/product/<id>`.

## Driving it with verify.mjs

Preconditions:

- A product URL discovered from the running store, for example via the search popup or a category page. For options or variant work, use a product with variants (`DEFAULT_COMPLEX_PRODUCT_ID` in `.env.test.local` names one when it is set).

- **Land on the PDP.** `page.goto(productPath)`. The `heading` level 1 is the product name.
- **Gallery.** Choose `button` `View image number 2`. The main image changes.
- **Quantity.** Use `button` `Increase quantity` and `Decrease quantity`. The `spinbutton` `Quantity` reflects the value.
- **Add to cart.** `page.getByRole('button', { name: 'Add to cart' }).click()`. An `alert` in the `Notifications` region reads `1 item added to your cart` with a `link` `your cart`. Prove the side effect with a read-only second view: `page.goto('/cart')` lists the product.
- **Wishlist.** `button` `Add to wish list` redirects signed-out shoppers to log in.
- **Reviews.** `button` `Scroll to reviews` jumps to the `heading` `Reviews <count>`.

## Gotchas

- Products with required options keep `Add to cart` disabled, or show field errors, until the options are chosen.
- Out-of-stock and backorder settings change the button label and messaging per store. Read them from the page; do not assume them.
- Adding to cart mutates the live cart. Remove the line on `/cart` at the end of the journey.
- Related products and reviews stream in after the main content. Assert them with `expect`, which waits.
- The toast disappears after a few seconds. Assert it right after the click, in the same step.
