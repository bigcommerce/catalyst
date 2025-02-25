# BigCommerce Catalyst Client with Cache Policies

This module provides a BigCommerce GraphQL API client with integrated cache policy functionality for Catalyst applications.

## Cache Policies

The client supports three main types of cache policies:

1. **Anonymous Cache** - For data that is the same for all shoppers
2. **Do Not Cache** - For data that is different for each shopper or should not be cached, such as cart data
3. **Shopper Cache** - For data that is cacheable for guests, but not for logged-in customers (with an option to cache for customers)

## Usage Examples

### Basic Usage with Cache Policies

```typescript
import { client, anonymousCache, doNotCache, shopperCache, TAGS } from 'core/client';
import { getCustomerAccessToken } from 'core/auth';

// Example: Fetch layout data with anonymous caching
const fetchLayout = async () => {
  const result = await client.fetch({
    document: LayoutQuery,
    policy: anonymousCache(),
  });
  
  return result.data.site;
};

// Example: Fetch product data with anonymous caching and entity tags
const fetchProduct = async (productId: string) => {
  const result = await client.fetch({
    document: ProductQuery,
    variables: { productId },
    policy: anonymousCache({ 
      entityType: TAGS.product, 
      entityId: productId 
    }),
  });
  
  return result.data.product;
};

// Example: Fetch cart data with no caching
const fetchCart = async (cartId: string) => {
  const result = await client.fetch({
    document: CartQuery,
    variables: { cartId },
    policy: doNotCache({ 
      entityType: TAGS.cart, 
      entityId: cartId 
    }),
  });
  
  return result.data.cart;
};

// Example: Fetch customer-specific data with shopper caching
const fetchCustomerData = async () => {
  const customerAccessToken = await getCustomerAccessToken();
  
  const result = await client.fetch({
    document: CustomerQuery,
    customerAccessToken,
    policy: shopperCache({ 
      customerAccessToken,
      entityType: TAGS.customer
    }),
  });
  
  return result.data.customer;
};

// Example: Fetch customer-specific data that should be cached even for logged-in customers
// Use this strategy when you want to cache data even for a customer, for example data 
// that is used across many pages so there will be a decent hit rate during the customer's session
const fetchCustomerPreferences = async () => {
  const customerAccessToken = await getCustomerAccessToken();
  
  const result = await client.fetch({
    document: CustomerPreferencesQuery,
    customerAccessToken,
    policy: shopperCache({ 
      customerAccessToken,
      entityType: TAGS.customer,
      cacheForCustomer: true
    }),
  });
  
  return result.data.customerPreferences;
};
```

### Cache Policy Requirement

The client's `fetch` method requires an explicit cache policy for every request. This ensures that developers always consider the caching strategy for each API call, leading to more predictable and optimized performance.

### Cache Tags

Cache tags are automatically generated based on the entity type and ID. The following tags are generated:

- Store tag: `bc/store/{storeHash}`
- Channel tag: `{storeTag}/channel/{channelId}`
- Entity type tags: `{storeTag}/{entityType}` and `{channelTag}/{entityType}`
- Entity ID tags: `{storeTag}/{entityType}:{entityId}` and `{channelTag}/{entityType}:{entityId}`

These tags allow for cache invalidation of related resources when a single entity is updated.

## Available Entity Types

The following entity types are available as constants in `TAGS`:

- `cart` - Cart data
- `checkout` - Checkout data
- `customer` - Customer data
- `product` - Product data
- `category` - Category data
- `brand` - Brand data
- `page` - Page data

## Channel ID Handling

The cache policy functionality automatically uses the correct channel ID based on the locale, ensuring that cache tags are generated correctly on a per-channel basis.
