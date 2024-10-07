export function subscribeOnBodlEvents(measurementId, consentModeEnabled) {
  if (!window || typeof window.bodlEvents === 'undefined') {
    return;
  }

  function addDestination(payload) {
    return Object.assign({}, payload, { send_to: measurementId });
  }

  // See docs with appropriate fields for each event here
  // https://developers.google.com/analytics/devguides/collection/ga4/reference/events
  function transformItem(item, index) {
    var transformed = {
      item_id:
        item.sku || item.variant_sku || item.product_sku || item.variant_id || item.product_id,
      item_name: item.product_name,
      currency: item.currency,
      discount: item.discount,
      index: typeof item.index !== 'undefined' ? item.index : index,
      item_brand: item.brand_name,
      item_variant: item.sku || item.variant_sku || item.product_sku || item.product_id,
      quantity: item.quantity,
    };

    var MAX_CATEGORIES_COUNT = 5;

    if (item.category_name) {
      transformed.item_category = item.category_name;
    } else if (item.category_names && Array.isArray(item.category_names)) {
      var categories = item.category_names.slice(0, MAX_CATEGORIES_COUNT);

      categories.forEach(function (category, index) {
        var key = 'item_category' + (index ? index + 1 : '');

        transformed[key] = category;
      });
    }

    if (item.purchase_price) {
      transformed.price = item.purchase_price;
    } else {
      transformed.price = item.sale_price > 0 ? item.sale_price : item.price;
    }

    if (item.coupon) {
      transformed.coupon = item.coupon;
    }

    return transformed;
  }

  function subscribeOnCheckoutEvents() {
    var GA_TO_BODL_CHECKOUT_EVENTS = {
      begin_checkout: 'begin_checkout',
      purchase: 'purchase',
      add_shipping_info: 'add_shipping_info',
      add_payment_info: 'add_payment_info',
    };

    function transformCommonCheckoutPayload(payload) {
      var coupon =
        Array.isArray(payload.coupon_codes) && payload.coupon_codes.length
          ? payload.coupon_codes[0]
          : payload.coupon;

      var transformed = {
        currency: payload.currency,
        value: payload.cart_value,
        items: payload.line_items.map(function (item, index) {
          if (coupon) {
            item.coupon = coupon;
          }
          return transformItem(item, index);
        }),
      };

      if (coupon) {
        transformed.coupon = coupon;
      }

      return addDestination(transformed);
    }

    function transformPurchasePayload(payload) {
      var commonPayload = transformCommonCheckoutPayload(payload);

      var purchasePayload = {
        transaction_id: payload.order_id || payload.transaction_id,
        shipping: payload.shipping_cost,
      };

      if (payload.tax) {
        purchasePayload.tax = payload.tax;
      }

      return addDestination(Object.assign(commonPayload, purchasePayload));
    }

    function transformBeginCheckoutPayload(payload) {
      return addDestination(transformCommonCheckoutPayload(payload));
    }

    function transformShippingDetailsProvidedPayload(payload) {
      var commonPayload = transformCommonCheckoutPayload(payload);
      var shippingDetailsProvidedPayload = {
        shipping_tier: payload.shipping_method,
      };

      return addDestination(Object.assign(commonPayload, shippingDetailsProvidedPayload));
    }

    function transformPaymentDetailsProvidedPayload(payload) {
      var commonPayload = transformCommonCheckoutPayload(payload);
      var paymentDetailsProvidedPayload = {
        payment_type: payload.payment_type,
      };

      return addDestination(Object.assign(commonPayload, paymentDetailsProvidedPayload));
    }

    if (typeof window.bodlEvents.checkout === 'undefined') {
      return;
    }

    if (typeof window.bodlEvents.checkout.checkoutBegin === 'function') {
      window.bodlEvents.checkout.checkoutBegin(function (payload) {
        gtag(
          'event',
          GA_TO_BODL_CHECKOUT_EVENTS.begin_checkout,
          transformBeginCheckoutPayload(payload),
        );
      });
    }
    if (typeof window.bodlEvents.checkout.orderPurchased === 'function') {
      window.bodlEvents.checkout.orderPurchased(function (payload) {
        gtag('event', GA_TO_BODL_CHECKOUT_EVENTS.purchase, transformPurchasePayload(payload));
      });
    }
    if (typeof window.bodlEvents.checkout.shippingDetailsProvided === 'function') {
      window.bodlEvents.checkout.shippingDetailsProvided(function (payload) {
        gtag(
          'event',
          GA_TO_BODL_CHECKOUT_EVENTS.add_shipping_info,
          transformShippingDetailsProvidedPayload(payload),
        );
      });
    }
    if (typeof window.bodlEvents.checkout.paymentDetailsProvided === 'function') {
      window.bodlEvents.checkout.paymentDetailsProvided(function (payload) {
        gtag(
          'event',
          GA_TO_BODL_CHECKOUT_EVENTS.add_payment_info,
          transformPaymentDetailsProvidedPayload(payload),
        );
      });
    }
  }

  function subscribeOnCartEvents() {
    if (typeof window.bodlEvents.cart === 'undefined') {
      return;
    }

    var GA_TO_BODL_CART_EVENTS = {
      view: 'view_cart',
      add: 'add_to_cart',
      remove: 'remove_from_cart',
    };

    function transformCartEventPayload(payload) {
      function calculateCartValue(items) {
        return items.reduce(function (total, item) {
          return total + item.price * item.quantity;
        }, 0);
      }

      var transformed = {
        currency: payload.currency,
        items: Array.isArray(payload.line_items) ? payload.line_items.map(transformItem) : [],
      };

      transformed.value =
        payload.product_value || payload.cart_value || calculateCartValue(transformed.items);

      return addDestination(transformed);
    }

    if (typeof window.bodlEvents.cart.viewed === 'function') {
      window.bodlEvents.cart.viewed(function (payload) {
        gtag('event', GA_TO_BODL_CART_EVENTS.view, transformCartEventPayload(payload));
      });
    }
    if (typeof window.bodlEvents.cart.addItem === 'function') {
      window.bodlEvents.cart.addItem(function (payload) {
        gtag('event', GA_TO_BODL_CART_EVENTS.add, transformCartEventPayload(payload));
      });
    }
    if (typeof window.bodlEvents.cart.removeItem === 'function') {
      window.bodlEvents.cart.removeItem(function (payload) {
        gtag('event', GA_TO_BODL_CART_EVENTS.remove, transformCartEventPayload(payload));
      });
    }
  }

  function subscribeOnProductEvents() {
    if (typeof window.bodlEvents.product === 'undefined') {
      return;
    }

    var GA_TO_BODL_PRODUCT_EVENTS = {
      product_viewed: 'view_item',
      category_viewed: 'view_item_list',
      search: 'search',
    };

    function transformProductViewedPayload(payload) {
      var items = payload.line_items && payload.line_items.map(transformItem);
      var item = (items && items[0]) || {};

      return addDestination({
        value: item.price,
        currency: item.currency,
        items: items,
      });
    }

    function trasnformCategoryViewedPayload(payload) {
      return addDestination({
        item_list_id: payload.category_id,
        item_list_name: payload.category_name,
        items: payload.line_items && payload.line_items.map(transformItem),
      });
    }

    function transformSearchPerformedPayload(payload) {
      return addDestination({
        search_term: payload.search_keyword,
      });
    }

    if (typeof window.bodlEvents.product.pageViewed === 'function') {
      window.bodlEvents.product.pageViewed(function (payload) {
        gtag(
          'event',
          GA_TO_BODL_PRODUCT_EVENTS.product_viewed,
          transformProductViewedPayload(payload),
        );
      });
    }
    if (typeof window.bodlEvents.product.categoryViewed === 'function') {
      window.bodlEvents.product.categoryViewed(function (payload) {
        gtag(
          'event',
          GA_TO_BODL_PRODUCT_EVENTS.category_viewed,
          trasnformCategoryViewedPayload(payload),
        );
      });
    }
    if (typeof window.bodlEvents.product.searchPerformed === 'function') {
      window.bodlEvents.product.searchPerformed(function (payload) {
        gtag('event', GA_TO_BODL_PRODUCT_EVENTS.search, transformSearchPerformedPayload(payload));
      });
    }
  }

  function subscribeOnPromotionEvents() {
    if (typeof window.bodlEvents.banner === 'undefined') {
      return;
    }

    var GA_TO_BODL_PROMOTION_EVENTS = {
      view: 'view_promotion',
    };

    function transformPromotionViewedPayload(payload) {
      return addDestination({
        promotion_id: 'banner_' + payload.banner_id,
        promotion_name: payload.banner_name,
      });
    }

    if (typeof window.bodlEvents.banner.viewed === 'function') {
      window.bodlEvents.banner.viewed(function (payload) {
        gtag('event', GA_TO_BODL_PROMOTION_EVENTS.view, transformPromotionViewedPayload(payload));
      });
    }
  }

  function subscribeOnEcommerceEvents() {
    subscribeOnCheckoutEvents();
    subscribeOnCartEvents();
    subscribeOnProductEvents();
    subscribeOnPromotionEvents();
  }

  subscribeOnEcommerceEvents();
}
