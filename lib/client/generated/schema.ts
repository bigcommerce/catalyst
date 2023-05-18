// @ts-nocheck
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Scalars = {
    BigDecimal: any,
    Boolean: boolean,
    DateTime: any,
    Float: number,
    ID: string,
    Int: number,
    Long: any,
    String: string,
}


/** Add cart line items result */
export interface AddCartLineItemsResult {
    /** The Cart that is updated as a result of mutation. */
    cart: (Cart | null)
    __typename: 'AddCartLineItemsResult'
}


/** Add wishlist items */
export interface AddWishlistItemsResult {
    /** The wishlist */
    result: Wishlist
    __typename: 'AddWishlistItemsResult'
}


/** Aggregated */
export interface Aggregated {
    /** Number of available products in stock. This can be 'null' if inventory is not set orif the store's Inventory Settings disable displaying stock levels on the storefront. */
    availableToSell: Scalars['Long']
    /** Indicates a threshold low-stock level.  This can be 'null' if the inventory warning level is not set or if the store's Inventory Settings disable displaying stock levels on the storefront. */
    warningLevel: Scalars['Int']
    __typename: 'Aggregated'
}


/** Aggregated Product Inventory */
export interface AggregatedInventory {
    /** Number of available products in stock. This can be 'null' if inventory is not set orif the store's Inventory Settings disable displaying stock levels on the storefront. */
    availableToSell: Scalars['Int']
    /** Indicates a threshold low-stock level. This can be 'null' if the inventory warning level is not set or if the store's Inventory Settings disable displaying stock levels on the storefront. */
    warningLevel: Scalars['Int']
    __typename: 'AggregatedInventory'
}


/** Assign cart to the customer result. */
export interface AssignCartToCustomerResult {
    /** The Cart that is updated as a result of mutation. */
    cart: (Cart | null)
    __typename: 'AssignCartToCustomerResult'
}


/** Author */
export interface Author {
    /** Author name. */
    name: Scalars['String']
    __typename: 'Author'
}


/** Banner details. */
export interface Banner {
    /** The content of the Banner. */
    content: Scalars['String']
    /** The id of the Banner. */
    entityId: Scalars['Long']
    /** The id of the object. */
    id: Scalars['ID']
    /** The location of the Banner. */
    location: BannerLocation
    /** The name of the Banner. */
    name: Scalars['String']
    __typename: 'Banner'
}


/** A connection to a list of items. */
export interface BannerConnection {
    /** A list of edges. */
    edges: ((BannerEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'BannerConnection'
}


/** An edge in a connection. */
export interface BannerEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Banner
    __typename: 'BannerEdge'
}


/** Banner location */
export type BannerLocation = 'BOTTOM' | 'TOP'


/** Banners details. */
export interface Banners {
    /** List of brand page banners. */
    brandPage: BrandPageBannerConnection
    /** List of category page banners. */
    categoryPage: CategoryPageBannerConnection
    /** List of home page banners. */
    homePage: BannerConnection
    /** List of search page banners. */
    searchPage: BannerConnection
    __typename: 'Banners'
}


/** Blog details. */
export interface Blog {
    /** The description of the Blog. */
    description: Scalars['String']
    /** The ID of an object */
    id: Scalars['ID']
    /** Whether or not the blog should be visible in the navigation menu. */
    isVisibleInNavigation: Scalars['Boolean']
    /** The name of the Blog. */
    name: Scalars['String']
    /** The path of the Blog. */
    path: Scalars['String']
    /** Blog post details. */
    post: (BlogPost | null)
    /** Details of the Blog posts. */
    posts: BlogPostConnection
    /** The rendered regions for the blog index. */
    renderedRegions: RenderedRegionsByPageType
    __typename: 'Blog'
}


/** A blog index page. */
export interface BlogIndexPage {
    /** Unique ID for the web page. */
    entityId: Scalars['Int']
    /** Whether or not the page should be visible in the navigation menu. */
    isVisibleInNavigation: Scalars['Boolean']
    /** Page name. */
    name: Scalars['String']
    /** Unique ID for the parent page. */
    parentEntityId: (Scalars['Int'] | null)
    /** The URL path of the page. */
    path: Scalars['String']
    /** The rendered regions for the web page. */
    renderedRegions: RenderedRegionsByPageType
    /** Page SEO details. */
    seo: SeoDetails
    __typename: 'BlogIndexPage'
}


/** Blog post details. */
export interface BlogPost {
    /** Blog post author. */
    author: (Scalars['String'] | null)
    /** Unique ID for the blog post. */
    entityId: Scalars['Int']
    /** The body of the Blog post. */
    htmlBody: Scalars['String']
    /** The ID of an object */
    id: Scalars['ID']
    /** Blog post name. */
    name: Scalars['String']
    /** Blog post path. */
    path: Scalars['String']
    /** The plain text summary of the Blog post. */
    plainTextSummary: Scalars['String']
    /** Blog post published date. */
    publishedDate: DateTimeExtended
    /** The rendered regions for the blog post. */
    renderedRegions: RenderedRegionsByPageType
    /** Blog post SEO details. */
    seo: SeoDetails
    /** Blog post tags. */
    tags: Scalars['String'][]
    /** Blog post thumbnail image. */
    thumbnailImage: (Image | null)
    __typename: 'BlogPost'
}


/** A connection to a list of items. */
export interface BlogPostConnection {
    /** Collection info */
    collectionInfo: (CollectionInfo | null)
    /** A list of edges. */
    edges: ((BlogPostEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'BlogPostConnection'
}


/** An edge in a connection. */
export interface BlogPostEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: BlogPost
    __typename: 'BlogPostEdge'
}


/** Brand */
export interface Brand {
    /** Default image for brand. */
    defaultImage: (Image | null)
    /** Id of the brand. */
    entityId: Scalars['Int']
    /** The ID of an object */
    id: Scalars['ID']
    /**
     * @deprecated Use SEO details instead.
     * Meta description for the brand.
     */
    metaDesc: Scalars['String']
    /**
     * @deprecated Use SEO details instead.
     * Meta keywords for the brand.
     */
    metaKeywords: Scalars['String'][]
    /** Metafield data related to a brand. */
    metafields: MetafieldConnection
    /** Name of the brand. */
    name: Scalars['String']
    /**
     * @deprecated Use SEO details instead.
     * Page title for the brand.
     */
    pageTitle: Scalars['String']
    /** Path for the brand page. */
    path: Scalars['String']
    /** List of products associated with the brand. */
    products: ProductConnection
    /** Search keywords for the brand. */
    searchKeywords: Scalars['String'][]
    /** Brand SEO details. */
    seo: SeoDetails
    __typename: 'Brand'
}


/** A connection to a list of items. */
export interface BrandConnection {
    /** A list of edges. */
    edges: ((BrandEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'BrandConnection'
}


/** An edge in a connection. */
export interface BrandEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Brand
    __typename: 'BrandEdge'
}


/** A connection to a list of items. */
export interface BrandPageBannerConnection {
    /** A list of edges. */
    edges: ((BrandPageBannerEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'BrandPageBannerConnection'
}


/** An edge in a connection. */
export interface BrandPageBannerEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Banner
    __typename: 'BrandPageBannerEdge'
}


/** Brand Filter */
export interface BrandSearchFilter {
    /** List of available brands. */
    brands: BrandSearchFilterItemConnection
    /** Indicates whether to display product count next to the filter. */
    displayProductCount: Scalars['Boolean']
    /** Indicates whether filter is collapsed by default. */
    isCollapsedByDefault: Scalars['Boolean']
    /** Display name for the filter. */
    name: Scalars['String']
    __typename: 'BrandSearchFilter'
}


/** Specific brand filter item */
export interface BrandSearchFilterItem {
    /** Brand ID. */
    entityId: Scalars['Int']
    /** Indicates whether brand is selected. */
    isSelected: Scalars['Boolean']
    /** Brand name. */
    name: Scalars['String']
    /** Indicates how many products available for this filter. */
    productCount: Scalars['Int']
    __typename: 'BrandSearchFilterItem'
}


/** A connection to a list of items. */
export interface BrandSearchFilterItemConnection {
    /** A list of edges. */
    edges: ((BrandSearchFilterItemEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'BrandSearchFilterItemConnection'
}


/** An edge in a connection. */
export interface BrandSearchFilterItemEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: BrandSearchFilterItem
    __typename: 'BrandSearchFilterItemEdge'
}


/** Breadcrumb */
export interface Breadcrumb {
    /** Category id. */
    entityId: Scalars['Int']
    /** Name of the category. */
    name: Scalars['String']
    __typename: 'Breadcrumb'
}


/** A connection to a list of items. */
export interface BreadcrumbConnection {
    /** A list of edges. */
    edges: ((BreadcrumbEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'BreadcrumbConnection'
}


/** An edge in a connection. */
export interface BreadcrumbEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Breadcrumb
    __typename: 'BreadcrumbEdge'
}


/** Bulk pricing tier that sets a fixed price for the product or variant. */
export interface BulkPricingFixedPriceDiscount {
    /** Maximum item quantity that applies to this bulk pricing tier - if not defined then the tier does not have an upper bound. */
    maximumQuantity: (Scalars['Int'] | null)
    /** Minimum item quantity that applies to this bulk pricing tier. */
    minimumQuantity: Scalars['Int']
    /** This price will override the current product price. */
    price: Scalars['BigDecimal']
    __typename: 'BulkPricingFixedPriceDiscount'
}


/** Bulk pricing tier that reduces the price of the product or variant by a percentage. */
export interface BulkPricingPercentageDiscount {
    /** Maximum item quantity that applies to this bulk pricing tier - if not defined then the tier does not have an upper bound. */
    maximumQuantity: (Scalars['Int'] | null)
    /** Minimum item quantity that applies to this bulk pricing tier. */
    minimumQuantity: Scalars['Int']
    /** The percentage that will be removed from the product price. */
    percentOff: Scalars['BigDecimal']
    __typename: 'BulkPricingPercentageDiscount'
}


/** Bulk pricing tier that will subtract an amount from the price of the product or variant. */
export interface BulkPricingRelativePriceDiscount {
    /** Maximum item quantity that applies to this bulk pricing tier - if not defined then the tier does not have an upper bound. */
    maximumQuantity: (Scalars['Int'] | null)
    /** Minimum item quantity that applies to this bulk pricing tier. */
    minimumQuantity: Scalars['Int']
    /** The price of the product/variant will be reduced by this priceAdjustment. */
    priceAdjustment: Scalars['BigDecimal']
    __typename: 'BulkPricingRelativePriceDiscount'
}


/** A set of bulk pricing tiers that define price discounts which apply when purchasing specified quantities of a product or variant. */
export type BulkPricingTier = (BulkPricingFixedPriceDiscount | BulkPricingPercentageDiscount | BulkPricingRelativePriceDiscount) & { __isUnion?: true }


/** A cart */
export interface Cart {
    /** Sum of line-items amounts, minus cart-level discounts and coupons. This amount includes taxes (where applicable). */
    amount: Money
    /** Cost of cart's contents, before applying discounts. */
    baseAmount: Money
    /** Time when the cart was created. */
    createdAt: DateTimeExtended
    /** ISO-4217 currency code. */
    currencyCode: Scalars['String']
    /** Discounted amount. */
    discountedAmount: Money
    /** List of discounts applied to this cart. */
    discounts: CartDiscount[]
    /** Cart ID. */
    entityId: Scalars['String']
    /** The ID of an object */
    id: Scalars['ID']
    /** Whether this item is taxable. */
    isTaxIncluded: Scalars['Boolean']
    /** List of line items. */
    lineItems: CartLineItems
    /** Locale of the cart. */
    locale: Scalars['String']
    /** Time when the cart was last updated. */
    updatedAt: DateTimeExtended
    __typename: 'Cart'
}


/** Cart custom item. */
export interface CartCustomItem {
    /** ID of the custom item. */
    entityId: Scalars['String']
    /** Item's list price multiplied by the quantity. */
    extendedListPrice: Money
    /** Price of the item. With or without tax depending on your stores set up. */
    listPrice: Money
    /** Custom item name. */
    name: Scalars['String']
    /** Quantity of this item. */
    quantity: Scalars['Int']
    /** Custom item sku. */
    sku: (Scalars['String'] | null)
    __typename: 'CartCustomItem'
}


/** Cart digital item. */
export interface CartDigitalItem {
    /** The product brand. */
    brand: (Scalars['String'] | null)
    /** The total value of all coupons applied to this item. */
    couponAmount: Money
    /** The total value of all discounts applied to this item (excluding coupon). */
    discountedAmount: Money
    /** List of discounts applied to this item. */
    discounts: CartDiscount[]
    /** The line-item ID. */
    entityId: Scalars['String']
    /** Item's list price multiplied by the quantity. */
    extendedListPrice: Money
    /** Item's sale price multiplied by the quantity. */
    extendedSalePrice: Money
    /** URL of an image of this item, accessible on the internet. */
    imageUrl: (Scalars['String'] | null)
    /** Whether the item is taxable. */
    isTaxable: Scalars['Boolean']
    /** The net item price before discounts and coupons. It is based on the product default price or sale price (if set) configured in BigCommerce Admin. */
    listPrice: Money
    /** The item's product name. */
    name: Scalars['String']
    /** An item’s original price is the same as the product default price in the admin panel. */
    originalPrice: Money
    /** The product is part of a bundle such as a product pick list, then the parentId or the main product id will populate. */
    parentEntityId: (Scalars['String'] | null)
    /** ID of the product. */
    productEntityId: Scalars['Int']
    /** Quantity of this item. */
    quantity: Scalars['Int']
    /** Item's price after all discounts are applied. (The final price before tax calculation). */
    salePrice: Money
    /** The list of selected options for this product. */
    selectedOptions: CartSelectedOption[]
    /** SKU of the variant. */
    sku: (Scalars['String'] | null)
    /** The product URL. */
    url: Scalars['String']
    /** ID of the variant. */
    variantEntityId: (Scalars['Int'] | null)
    __typename: 'CartDigitalItem'
}


/** Discount applied to the cart. */
export interface CartDiscount {
    /** The discounted amount applied within a given context. */
    discountedAmount: Money
    /** ID of the applied discount. */
    entityId: Scalars['String']
    __typename: 'CartDiscount'
}


/** Cart gift certificate */
export interface CartGiftCertificate {
    /** Value must be between 1.00 and 1,000.00 in the store's default currency. */
    amount: Money
    /** ID of this gift certificate. */
    entityId: Scalars['String']
    /** Whether or not the gift certificate is taxable. */
    isTaxable: Scalars['Boolean']
    /** Message that will be sent to the gift certificate's recipient. Limited to 200 characters. */
    message: (Scalars['String'] | null)
    /** GiftCertificate-provided name that will appear in the control panel. */
    name: Scalars['String']
    /** Recipient of the gift certificate. */
    recipient: CartGiftCertificateRecipient
    /** Sender of the gift certificate. */
    sender: CartGiftCertificateSender
    /** Currently supports Birthday, Boy, Celebration, Christmas, General, and Girl. */
    theme: CartGiftCertificateTheme
    __typename: 'CartGiftCertificate'
}


/** Cart gift certificate recipient */
export interface CartGiftCertificateRecipient {
    /** Contact's email address. */
    email: Scalars['String']
    /** Contact's name. */
    name: Scalars['String']
    __typename: 'CartGiftCertificateRecipient'
}


/** Cart gift certificate sender */
export interface CartGiftCertificateSender {
    /** Contact's email address. */
    email: Scalars['String']
    /** Contact's name. */
    name: Scalars['String']
    __typename: 'CartGiftCertificateSender'
}


/** Cart gift certificate theme */
export type CartGiftCertificateTheme = 'BIRTHDAY' | 'BOY' | 'CELEBRATION' | 'CHRISTMAS' | 'GENERAL' | 'GIRL'


/** Gift wrapping for the item */
export interface CartGiftWrapping {
    /** Gift-wrapping price per product. */
    amount: Money
    /** Custom gift message along with items wrapped in this wrapping option. */
    message: (Scalars['String'] | null)
    /** Name of the gift-wrapping option. */
    name: Scalars['String']
    __typename: 'CartGiftWrapping'
}


/** Cart line items */
export interface CartLineItems {
    /** List of custom items. */
    customItems: CartCustomItem[]
    /** List of digital items. */
    digitalItems: CartDigitalItem[]
    /** List of gift certificates. */
    giftCertificates: CartGiftCertificate[]
    /** List of physical items. */
    physicalItems: CartPhysicalItem[]
    /** Total number of line items. */
    totalQuantity: Scalars['Int']
    __typename: 'CartLineItems'
}


/** Cart mutations */
export interface CartMutations {
    /** Adds line item(s) to the cart. */
    addCartLineItems: (AddCartLineItemsResult | null)
    /** Assign cart to the customer. */
    assignCartToCustomer: (AssignCartToCustomerResult | null)
    /** Creates a cart and generates a cart ID. */
    createCart: (CreateCartResult | null)
    /** Deletes a Cart. */
    deleteCart: (DeleteCartResult | null)
    /** Delete line item in the cart. Removing the last line item in the Cart deletes the Cart. */
    deleteCartLineItem: (DeleteCartLineItemResult | null)
    /** Unassign cart from the customer. */
    unassignCartFromCustomer: (UnassignCartFromCustomerResult | null)
    /** Update currency of the cart. */
    updateCartCurrency: (UpdateCartCurrencyResult | null)
    /** Updates line item in the cart. */
    updateCartLineItem: (UpdateCartLineItemResult | null)
    __typename: 'CartMutations'
}


/** Cart physical item. */
export interface CartPhysicalItem {
    /** The product brand. */
    brand: (Scalars['String'] | null)
    /** The total value of all coupons applied to this item. */
    couponAmount: Money
    /** The total value of all discounts applied to this item (excluding coupon). */
    discountedAmount: Money
    /** List of discounts applied to this item. */
    discounts: CartDiscount[]
    /** The line-item ID. */
    entityId: Scalars['String']
    /** Item's list price multiplied by the quantity. */
    extendedListPrice: Money
    /** Item's sale price multiplied by the quantity. */
    extendedSalePrice: Money
    /** Gift wrapping for this item. */
    giftWrapping: (CartGiftWrapping | null)
    /** URL of an image of this item, accessible on the internet. */
    imageUrl: (Scalars['String'] | null)
    /** Whether this item requires shipping to a physical address. */
    isShippingRequired: Scalars['Boolean']
    /** Whether the item is taxable. */
    isTaxable: Scalars['Boolean']
    /** The net item price before discounts and coupons. It is based on the product default price or sale price (if set) configured in BigCommerce Admin. */
    listPrice: Money
    /** The item's product name. */
    name: Scalars['String']
    /** An item’s original price is the same as the product default price in the admin panel. */
    originalPrice: Money
    /** The product is part of a bundle such as a product pick list, then the parentId or the main product id will populate. */
    parentEntityId: (Scalars['String'] | null)
    /** ID of the product. */
    productEntityId: Scalars['Int']
    /** Quantity of this item. */
    quantity: Scalars['Int']
    /** Item's price after all discounts are applied. (The final price before tax calculation). */
    salePrice: Money
    /** The list of selected options for this item. */
    selectedOptions: CartSelectedOption[]
    /** SKU of the variant. */
    sku: (Scalars['String'] | null)
    /** The product URL. */
    url: Scalars['String']
    /** ID of the variant. */
    variantEntityId: (Scalars['Int'] | null)
    __typename: 'CartPhysicalItem'
}


/** Selected checkbox option. */
export interface CartSelectedCheckboxOption {
    /** The product option ID. */
    entityId: Scalars['Int']
    /** The product option name. */
    name: Scalars['String']
    /** The product option value. */
    value: Scalars['String']
    /** The product option value ID. */
    valueEntityId: Scalars['Int']
    __typename: 'CartSelectedCheckboxOption'
}


/** Selected date field option. */
export interface CartSelectedDateFieldOption {
    /** Date value. */
    date: DateTimeExtended
    /** The product option ID. */
    entityId: Scalars['Int']
    /** The product option name. */
    name: Scalars['String']
    __typename: 'CartSelectedDateFieldOption'
}


/** Selected file upload option. */
export interface CartSelectedFileUploadOption {
    /** The product option ID. */
    entityId: Scalars['Int']
    /** Uploaded file name. */
    fileName: Scalars['String']
    /** The product option name. */
    name: Scalars['String']
    __typename: 'CartSelectedFileUploadOption'
}


/** Selected multi-line text field option. */
export interface CartSelectedMultiLineTextFieldOption {
    /** The product option ID. */
    entityId: Scalars['Int']
    /** The product option name. */
    name: Scalars['String']
    /** Text value. */
    text: Scalars['String']
    __typename: 'CartSelectedMultiLineTextFieldOption'
}


/** Selected multiple choice option. */
export interface CartSelectedMultipleChoiceOption {
    /** The product option ID. */
    entityId: Scalars['Int']
    /** The product option name. */
    name: Scalars['String']
    /** The product option value. */
    value: Scalars['String']
    /** The product option value ID. */
    valueEntityId: Scalars['Int']
    __typename: 'CartSelectedMultipleChoiceOption'
}


/** Selected number field option. */
export interface CartSelectedNumberFieldOption {
    /** The product option ID. */
    entityId: Scalars['Int']
    /** The product option name. */
    name: Scalars['String']
    /** Number value. */
    number: Scalars['Float']
    __typename: 'CartSelectedNumberFieldOption'
}


/** Selected option for the item. */
export type CartSelectedOption = (CartSelectedCheckboxOption | CartSelectedDateFieldOption | CartSelectedFileUploadOption | CartSelectedMultiLineTextFieldOption | CartSelectedMultipleChoiceOption | CartSelectedNumberFieldOption | CartSelectedTextFieldOption) & { __isUnion?: true }


/** Selected text field option. */
export interface CartSelectedTextFieldOption {
    /** The product option ID. */
    entityId: Scalars['Int']
    /** The product option name. */
    name: Scalars['String']
    /** Text value. */
    text: Scalars['String']
    __typename: 'CartSelectedTextFieldOption'
}


/** Storefront catalog settings. */
export interface Catalog {
    /** Product comparisons enabled. */
    productComparisonsEnabled: (Scalars['Boolean'] | null)
    __typename: 'Catalog'
}


/** Product Option */
export type CatalogProductOption = (CheckboxOption | DateFieldOption | FileUploadFieldOption | MultiLineTextFieldOption | MultipleChoiceOption | NumberFieldOption | TextFieldOption) & { __isUnion?: true }


/** Product Option Value */
export type CatalogProductOptionValue = (MultipleChoiceOptionValue | ProductPickListOptionValue | SwatchOptionValue) & { __isUnion?: true }


/** Category */
export interface Category {
    /** Category breadcrumbs. */
    breadcrumbs: BreadcrumbConnection
    /** Default image for the category. */
    defaultImage: (Image | null)
    /** Category default product sort. */
    defaultProductSort: (CategoryProductSort | null)
    /** Category description. */
    description: Scalars['String']
    /** Unique ID for the category. */
    entityId: Scalars['Int']
    /** The ID of an object */
    id: Scalars['ID']
    /** Metafield data related to a category. */
    metafields: MetafieldConnection
    /** Category name. */
    name: Scalars['String']
    /** Category path. */
    path: Scalars['String']
    /** List of products associated with category */
    products: ProductConnection
    /** Category SEO details. */
    seo: SeoDetails
    /**
     * @deprecated Alpha version. Do not use in production.
     * Category shop by price money ranges.
     */
    shopByPriceRanges: ShopByPriceConnection
    __typename: 'Category'
}


/** A connection to a list of items. */
export interface CategoryConnection {
    /** A list of edges. */
    edges: ((CategoryEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'CategoryConnection'
}


/** An edge in a connection. */
export interface CategoryEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Category
    __typename: 'CategoryEdge'
}


/** A connection to a list of items. */
export interface CategoryPageBannerConnection {
    /** A list of edges. */
    edges: ((CategoryPageBannerEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'CategoryPageBannerConnection'
}


/** An edge in a connection. */
export interface CategoryPageBannerEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Banner
    __typename: 'CategoryPageBannerEdge'
}


/** Product sorting by categories. */
export type CategoryProductSort = 'A_TO_Z' | 'BEST_REVIEWED' | 'BEST_SELLING' | 'DEFAULT' | 'FEATURED' | 'HIGHEST_PRICE' | 'LOWEST_PRICE' | 'NEWEST' | 'Z_TO_A'


/** Category Filter */
export interface CategorySearchFilter {
    /** List of available categories. */
    categories: CategorySearchFilterItemConnection
    /** Indicates whether to display product count next to the filter. */
    displayProductCount: Scalars['Boolean']
    /** Indicates whether filter is collapsed by default. */
    isCollapsedByDefault: Scalars['Boolean']
    /** Display name for the filter. */
    name: Scalars['String']
    __typename: 'CategorySearchFilter'
}


/** Specific category filter item */
export interface CategorySearchFilterItem {
    /** Category ID. */
    entityId: Scalars['Int']
    /** Indicates whether category is selected. */
    isSelected: Scalars['Boolean']
    /** Category name. */
    name: Scalars['String']
    /** Indicates how many products available for this filter. */
    productCount: Scalars['Int']
    /** List of available sub-categories. */
    subCategories: SubCategorySearchFilterItemConnection
    __typename: 'CategorySearchFilterItem'
}


/** A connection to a list of items. */
export interface CategorySearchFilterItemConnection {
    /** A list of edges. */
    edges: ((CategorySearchFilterItemEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'CategorySearchFilterItemConnection'
}


/** An edge in a connection. */
export interface CategorySearchFilterItemEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: CategorySearchFilterItem
    __typename: 'CategorySearchFilterItemEdge'
}


/** An item in a tree of categories. */
export interface CategoryTreeItem {
    /** Subcategories of this category */
    children: CategoryTreeItem[]
    /** The description of this category. */
    description: Scalars['String']
    /** The id category. */
    entityId: Scalars['Int']
    /** If a category has children. */
    hasChildren: Scalars['Boolean']
    /** The category image. */
    image: (Image | null)
    /** The name of category. */
    name: Scalars['String']
    /** Path assigned to this category */
    path: Scalars['String']
    /** The number of products in this category. */
    productCount: Scalars['Int']
    __typename: 'CategoryTreeItem'
}


/** The Channel */
export interface Channel {
    /** The ID of the channel. */
    entityId: Scalars['Long']
    /** Metafield data related to a channel. */
    metafields: MetafieldConnection
    __typename: 'Channel'
}


/** A simple yes/no question represented by a checkbox. */
export interface CheckboxOption {
    /** Indicates the default checked status. */
    checkedByDefault: Scalars['Boolean']
    /** Display name for the option. */
    displayName: Scalars['String']
    /** Unique ID for the option. */
    entityId: Scalars['Int']
    /** One of the option values is required to be selected for the checkout. */
    isRequired: Scalars['Boolean']
    /** Indicates whether it is a variant option or modifier. */
    isVariantOption: Scalars['Boolean']
    /** Label of the checkbox option. */
    label: Scalars['String']
    __typename: 'CheckboxOption'
}


/** Checkout settings. */
export interface CheckoutSettings {
    /** Indicates whether ReCaptcha is enabled on checkout. */
    reCaptchaEnabled: Scalars['Boolean']
    __typename: 'CheckoutSettings'
}


/** Additional information about the collection. */
export interface CollectionInfo {
    /** Total items in the collection despite pagination. */
    totalItems: (Scalars['Long'] | null)
    __typename: 'CollectionInfo'
}


/** Contact field */
export interface ContactField {
    /** Store address line. */
    address: Scalars['String']
    /** Store address type. */
    addressType: Scalars['String']
    /** Store country. */
    country: Scalars['String']
    /** Store email. */
    email: Scalars['String']
    /** Store phone number. */
    phone: Scalars['String']
    __typename: 'ContactField'
}


/** A contact page. */
export interface ContactPage {
    /** The contact fields that should be used on the page. */
    contactFields: Scalars['String'][]
    /** Unique ID for the web page. */
    entityId: Scalars['Int']
    /** The body of the page. */
    htmlBody: Scalars['String']
    /** The ID of an object */
    id: Scalars['ID']
    /** Whether or not the page should be visible in the navigation menu. */
    isVisibleInNavigation: Scalars['Boolean']
    /** Page name. */
    name: Scalars['String']
    /** Unique ID for the parent page. */
    parentEntityId: (Scalars['Int'] | null)
    /** The URL path of the page. */
    path: Scalars['String']
    /** The plain text summary of the page body. */
    plainTextSummary: Scalars['String']
    /** The rendered regions for the web page. */
    renderedRegions: RenderedRegionsByPageType
    /** Page SEO details. */
    seo: SeoDetails
    __typename: 'ContactPage'
}


/** The page content. */
export interface Content {
    /** Banners details. */
    banners: (Banners | null)
    /** Blog details. */
    blog: (Blog | null)
    /** Page details. */
    page: (WebPage | null)
    /** Details of the pages. */
    pages: PageConnection
    /** The rendered regions by specific page. */
    renderedRegionsByPageType: RenderedRegionsByPageType
    /** The rendered regions by specific page and id. */
    renderedRegionsByPageTypeAndEntityId: RenderedRegionsByPageType
    __typename: 'Content'
}


/** Create cart result */
export interface CreateCartResult {
    /** The Cart that is created as a result of mutation. */
    cart: (Cart | null)
    __typename: 'CreateCartResult'
}


/** Create wishlist */
export interface CreateWishlistResult {
    /** The newly created wishlist */
    result: Wishlist
    __typename: 'CreateWishlistResult'
}


/** Currency details. */
export interface Currency {
    /** Currency code. */
    code: currencyCode
    /** Currency display settings. */
    display: CurrencyDisplay
    /** Currency ID. */
    entityId: Scalars['Int']
    /** Exchange rate relative to default currency. */
    exchangeRate: Scalars['Float']
    /** Flag image URL. */
    flagImage: (Scalars['String'] | null)
    /** Indicates whether this currency is active. */
    isActive: Scalars['Boolean']
    /** Indicates whether this currency is transactional. */
    isTransactional: Scalars['Boolean']
    /** Currency name. */
    name: Scalars['String']
    __typename: 'Currency'
}


/** A connection to a list of items. */
export interface CurrencyConnection {
    /** A list of edges. */
    edges: ((CurrencyEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'CurrencyConnection'
}


/** Currency display settings. */
export interface CurrencyDisplay {
    /** Currency decimal places. */
    decimalPlaces: Scalars['Int']
    /** Currency decimal token. */
    decimalToken: Scalars['String']
    /** Currency symbol. */
    symbol: Scalars['String']
    /** Currency symbol. */
    symbolPlacement: CurrencySymbolPosition
    /** Currency thousands token. */
    thousandsToken: Scalars['String']
    __typename: 'CurrencyDisplay'
}


/** An edge in a connection. */
export interface CurrencyEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Currency
    __typename: 'CurrencyEdge'
}


/** Currency symbol position */
export type CurrencySymbolPosition = 'LEFT' | 'RIGHT'


/** Custom field */
export interface CustomField {
    /** Custom field id. */
    entityId: Scalars['Int']
    /** Name of the custom field. */
    name: Scalars['String']
    /** Value of the custom field. */
    value: Scalars['String']
    __typename: 'CustomField'
}


/** A connection to a list of items. */
export interface CustomFieldConnection {
    /** A list of edges. */
    edges: ((CustomFieldEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'CustomFieldConnection'
}


/** An edge in a connection. */
export interface CustomFieldEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: CustomField
    __typename: 'CustomFieldEdge'
}


/** A customer that shops on a store */
export interface Customer {
    /** Customer addresses count. */
    addressCount: Scalars['Int']
    /** Customer attributes count. */
    attributeCount: Scalars['Int']
    /** Customer attributes. */
    attributes: CustomerAttributes
    /** The company name of the customer. */
    company: Scalars['String']
    /** The customer group id of the customer. */
    customerGroupId: Scalars['Int']
    /** The email address of the customer. */
    email: Scalars['String']
    /** The ID of the customer. */
    entityId: Scalars['Int']
    /** The first name of the customer. */
    firstName: Scalars['String']
    /** The last name of the customer. */
    lastName: Scalars['String']
    /** The notes of the customer. */
    notes: Scalars['String']
    /** The phone number of the customer. */
    phone: Scalars['String']
    /** Customer store credit. */
    storeCredit: Money[]
    /** The tax exempt category of the customer. */
    taxExemptCategory: Scalars['String']
    /** Customer wishlists. */
    wishlists: WishlistConnection
    __typename: 'Customer'
}


/** A custom, store-specific attribute for a customer */
export interface CustomerAttribute {
    /** The ID of the custom customer attribute */
    entityId: Scalars['Int']
    /** The name of the custom customer attribute */
    name: Scalars['String']
    /** The value of the custom customer attribute */
    value: (Scalars['String'] | null)
    __typename: 'CustomerAttribute'
}


/** Custom, store-specific customer attributes */
export interface CustomerAttributes {
    /** A custom, store-specific attribute for a customer */
    attribute: CustomerAttribute
    __typename: 'CustomerAttributes'
}


/** A calendar for allowing selection of a date. */
export interface DateFieldOption {
    /** The default timestamp of date option. */
    defaultValue: (Scalars['DateTime'] | null)
    /** Display name for the option. */
    displayName: Scalars['String']
    /** The earliest timestamp of date option. */
    earliest: (Scalars['DateTime'] | null)
    /** Unique ID for the option. */
    entityId: Scalars['Int']
    /** One of the option values is required to be selected for the checkout. */
    isRequired: Scalars['Boolean']
    /** Indicates whether it is a variant option or modifier. */
    isVariantOption: Scalars['Boolean']
    /** The latest timestamp of date option. */
    latest: (Scalars['DateTime'] | null)
    /** Limit date by */
    limitDateBy: LimitDateOption
    __typename: 'DateFieldOption'
}


/** Date Time Extended */
export interface DateTimeExtended {
    /** ISO-8601 formatted date in UTC */
    utc: Scalars['DateTime']
    __typename: 'DateTimeExtended'
}


/** Delete cart lien item result */
export interface DeleteCartLineItemResult {
    /** The Cart that is updated as a result of mutation. */
    cart: (Cart | null)
    /** The ID of the Cart if it is deleted as a result of mutation. */
    deletedCartEntityId: (Scalars['String'] | null)
    /** The ID of the line item that is deleted as a result of mutation. */
    deletedLineItemEntityId: (Scalars['String'] | null)
    __typename: 'DeleteCartLineItemResult'
}


/** Delete cart result */
export interface DeleteCartResult {
    /** The ID of the Cart that is deleted as a result of mutation. */
    deletedCartEntityId: (Scalars['String'] | null)
    __typename: 'DeleteCartResult'
}


/** Delete wishlist items */
export interface DeleteWishlistItemsResult {
    /** The wishlist */
    result: Wishlist
    __typename: 'DeleteWishlistItemsResult'
}


/** Delete wishlist */
export interface DeleteWishlistResult {
    /** The result of the operation */
    result: Scalars['String']
    __typename: 'DeleteWishlistResult'
}


/** Display field */
export interface DisplayField {
    /** Extended date format. */
    extendedDateFormat: Scalars['String']
    /** Short date format. */
    shortDateFormat: Scalars['String']
    __typename: 'DisplayField'
}


/** Distance */
export interface Distance {
    /** Length unit */
    lengthUnit: LengthUnit
    /** Distance in specified length unit */
    value: Scalars['Float']
    __typename: 'Distance'
}


/** Entity page type */
export type EntityPageType = 'BLOG_POST' | 'BRAND' | 'CATEGORY' | 'CONTACT_US' | 'PAGE' | 'PRODUCT'


/** An external link page. */
export interface ExternalLinkPage {
    /** Unique ID for the web page. */
    entityId: Scalars['Int']
    /** Whether or not the page should be visible in the navigation menu. */
    isVisibleInNavigation: Scalars['Boolean']
    /** The URL that the page links to. */
    link: Scalars['String']
    /** Page name. */
    name: Scalars['String']
    /** Unique ID for the parent page. */
    parentEntityId: (Scalars['Int'] | null)
    /** Page SEO details. */
    seo: SeoDetails
    __typename: 'ExternalLinkPage'
}


/** A form allowing selection and uploading of a file from the user's local computer. */
export interface FileUploadFieldOption {
    /** Display name for the option. */
    displayName: Scalars['String']
    /** Unique ID for the option. */
    entityId: Scalars['Int']
    /** All possible file extensions. Empty means that all files allowed. */
    fileTypes: Scalars['String'][]
    /** One of the option values is required to be selected for the checkout. */
    isRequired: Scalars['Boolean']
    /** Indicates whether it is a variant option or modifier. */
    isVariantOption: Scalars['Boolean']
    /** The maximum size of the file in kilobytes */
    maxFileSize: Scalars['Int']
    __typename: 'FileUploadFieldOption'
}


/** Gift wrapping for product */
export interface GiftWrapping {
    /** Indicates whether commenting is allowed for the gift wrapping. */
    allowComments: Scalars['Boolean']
    /** Gift wrapping id. */
    entityId: Scalars['Int']
    /** Gift wrapping name. */
    name: Scalars['String']
    /** Gift wrapping preview image url. */
    previewImageUrl: (Scalars['String'] | null)
    __typename: 'GiftWrapping'
}


/** A connection to a list of items. */
export interface GiftWrappingConnection {
    /** A list of edges. */
    edges: ((GiftWrappingEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'GiftWrappingConnection'
}


/** An edge in a connection. */
export interface GiftWrappingEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: GiftWrapping
    __typename: 'GiftWrappingEdge'
}


/** Image */
export interface Image {
    /** Text description of an image that can be used for SEO and/or accessibility purposes. */
    altText: Scalars['String']
    /** Indicates whether this is the primary image. */
    isDefault: Scalars['Boolean']
    /** Absolute path to image using store CDN. */
    url: Scalars['String']
    /** Absolute path to original image using store CDN. */
    urlOriginal: Scalars['String']
    __typename: 'Image'
}


/** A connection to a list of items. */
export interface ImageConnection {
    /** A list of edges. */
    edges: ((ImageEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'ImageConnection'
}


/** An edge in a connection. */
export interface ImageEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Image
    __typename: 'ImageEdge'
}


/** An inventory */
export interface Inventory {
    /** Locations */
    locations: InventoryLocationConnection
    __typename: 'Inventory'
}


/** Address */
export interface InventoryAddress {
    /** Address line1. */
    address1: Scalars['String']
    /** Address line2. */
    address2: Scalars['String']
    /** Address city. */
    city: Scalars['String']
    /** Address code. */
    code: Scalars['String']
    /** Country code. */
    countryCode: Scalars['String']
    /** Address description. */
    description: (Scalars['String'] | null)
    /** Address email. */
    email: Scalars['String']
    /** Address id. */
    entityId: Scalars['Int']
    /** Address label. */
    label: Scalars['String']
    /** Address latitude. */
    latitude: (Scalars['Float'] | null)
    /** Address longitude. */
    longitude: (Scalars['Float'] | null)
    /** Address phone. */
    phone: Scalars['String']
    /** Address zip. */
    postalCode: Scalars['String']
    /** Address state. */
    stateOrProvince: Scalars['String']
    __typename: 'InventoryAddress'
}


/** Inventory By Locations */
export interface InventoryByLocations {
    /** Number of available products in stock. */
    availableToSell: Scalars['Long']
    /** Indicates whether this product is in stock. */
    isInStock: Scalars['Boolean']
    /** Distance between location and specified longitude and latitude */
    locationDistance: (Distance | null)
    /** Location code. */
    locationEntityCode: Scalars['String']
    /** Location id. */
    locationEntityId: Scalars['Long']
    /**
     * @deprecated Deprecated. Will be substituted with pickup methods.
     * Location service type ids.
     */
    locationEntityServiceTypeIds: Scalars['String'][]
    /** Location type id. */
    locationEntityTypeId: (Scalars['String'] | null)
    /** Indicates a threshold low-stock level. */
    warningLevel: Scalars['Int']
    __typename: 'InventoryByLocations'
}


/** Location */
export interface InventoryLocation {
    /** Location address */
    address: (InventoryAddress | null)
    /**
     * @deprecated Deprecated. Use specialHours instead
     * Upcoming events
     */
    blackoutHours: SpecialHour[]
    /** Location code. */
    code: Scalars['String']
    /** Location description. */
    description: (Scalars['String'] | null)
    /** Distance between location and specified longitude and latitude */
    distance: (Distance | null)
    /** Location id. */
    entityId: Scalars['Int']
    /** Location label. */
    label: Scalars['String']
    /** Metafield data related to a location. */
    metafields: MetafieldConnection
    /** Location OperatingHours */
    operatingHours: (OperatingHours | null)
    /**
     * @deprecated Deprecated. Will be substituted with pickup methods.
     * Location service type ids.
     */
    serviceTypeIds: Scalars['String'][]
    /** Upcoming events */
    specialHours: SpecialHour[]
    /** Time zone of location */
    timeZone: (Scalars['String'] | null)
    /** Location type id. */
    typeId: (Scalars['String'] | null)
    __typename: 'InventoryLocation'
}


/** A connection to a list of items. */
export interface InventoryLocationConnection {
    /** A list of edges. */
    edges: ((InventoryLocationEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'InventoryLocationConnection'
}


/** An edge in a connection. */
export interface InventoryLocationEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: InventoryLocation
    __typename: 'InventoryLocationEdge'
}


/** Inventory settings from control panel. */
export interface InventorySettings {
    /** Out of stock message. */
    defaultOutOfStockMessage: Scalars['String']
    /** Flag to show or not on product filtering when option is out of stock */
    hideInProductFiltering: Scalars['Boolean']
    /** The option out of stock behavior. */
    optionOutOfStockBehavior: (OptionOutOfStockBehavior | null)
    /** The product out of stock behavior. */
    productOutOfStockBehavior: (ProductOutOfStockBehavior | null)
    /** Show out of stock message on product listing pages */
    showOutOfStockMessage: Scalars['Boolean']
    /** Show pre-order inventory */
    showPreOrderStockLevels: Scalars['Boolean']
    /** Hide or show inventory node for product */
    stockLevelDisplay: (StockLevelDisplay | null)
    __typename: 'InventorySettings'
}


/** length unit */
export type LengthUnit = 'Kilometres' | 'Miles'


/** Limit date by */
export type LimitDateOption = 'EARLIEST_DATE' | 'LATEST_DATE' | 'NO_LIMIT' | 'RANGE'


/** Limit numbers by several options. */
export type LimitInputBy = 'HIGHEST_VALUE' | 'LOWEST_VALUE' | 'NO_LIMIT' | 'RANGE'


/** A connection to a list of items. */
export interface LocationConnection {
    /** A list of edges. */
    edges: ((LocationEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'LocationConnection'
}


/** An edge in a connection. */
export interface LocationEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: InventoryByLocations
    __typename: 'LocationEdge'
}


/** Login result */
export interface LoginResult {
    /** The currently logged in customer. */
    customer: (Customer | null)
    /**
     * @deprecated Use customer node instead.
     * The result of a login
     */
    result: Scalars['String']
    __typename: 'LoginResult'
}


/** Logo field */
export interface LogoField {
    /** Store logo image. */
    image: Image
    /** Logo title. */
    title: Scalars['String']
    __typename: 'LogoField'
}


/** Logout result */
export interface LogoutResult {
    /** The result of a logout */
    result: Scalars['String']
    __typename: 'LogoutResult'
}


/** Measurement */
export interface Measurement {
    /** Unit of measurement. */
    unit: Scalars['String']
    /** Unformatted weight measurement value. */
    value: Scalars['Float']
    __typename: 'Measurement'
}


/** A connection to a list of items. */
export interface MetafieldConnection {
    /** A list of edges. */
    edges: ((MetafieldEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'MetafieldConnection'
}


/** An edge in a connection. */
export interface MetafieldEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Metafields
    __typename: 'MetafieldEdge'
}


/** Key/Value pairs of data attached tied to a resource entity (product, brand, category, etc.) */
export interface Metafields {
    /** The ID of the metafield when referencing via our backend API. */
    entityId: Scalars['Int']
    /** The ID of an object */
    id: Scalars['ID']
    /** A label for identifying a metafield data value. */
    key: Scalars['String']
    /** A metafield value. */
    value: Scalars['String']
    __typename: 'Metafields'
}


/** A money object - includes currency code and a money amount */
export interface Money {
    /** Currency code of the current money. */
    currencyCode: Scalars['String']
    /**
     * @deprecated Deprecated. Don't use - it will be removed soon.
     * The formatted currency string for the current money.
     */
    formatted: (Scalars['String'] | null)
    /** The amount of money. */
    value: Scalars['BigDecimal']
    __typename: 'Money'
}


/** A min and max pair of money objects */
export interface MoneyRange {
    /** Maximum money object. */
    max: Money
    /** Minimum money object. */
    min: Money
    __typename: 'MoneyRange'
}


/** A multi-line text input field, aka a text box. */
export interface MultiLineTextFieldOption {
    /** Default value of the multiline text field option. */
    defaultValue: (Scalars['String'] | null)
    /** Display name for the option. */
    displayName: Scalars['String']
    /** Unique ID for the option. */
    entityId: Scalars['Int']
    /** One of the option values is required to be selected for the checkout. */
    isRequired: Scalars['Boolean']
    /** Indicates whether it is a variant option or modifier. */
    isVariantOption: Scalars['Boolean']
    /** The maximum number of characters. */
    maxLength: (Scalars['Int'] | null)
    /** The maximum number of lines. */
    maxLines: (Scalars['Int'] | null)
    /** The minimum number of characters. */
    minLength: (Scalars['Int'] | null)
    __typename: 'MultiLineTextFieldOption'
}


/** An option type that has a fixed list of values. */
export interface MultipleChoiceOption {
    /** Display name for the option. */
    displayName: Scalars['String']
    /** The chosen display style for this multiple choice option. */
    displayStyle: Scalars['String']
    /** Unique ID for the option. */
    entityId: Scalars['Int']
    /** One of the option values is required to be selected for the checkout. */
    isRequired: Scalars['Boolean']
    /** Indicates whether it is a variant option or modifier. */
    isVariantOption: Scalars['Boolean']
    /** List of option values. */
    values: ProductOptionValueConnection
    __typename: 'MultipleChoiceOption'
}


/** A simple multiple choice value comprised of an id and a label. */
export interface MultipleChoiceOptionValue {
    /** Unique ID for the option value. */
    entityId: Scalars['Int']
    /** Indicates whether this value is the chosen default selected value. */
    isDefault: Scalars['Boolean']
    /** Indicates whether this value is selected based on sku/variantEntityId/optionValueIds overlay requested on the product node level. */
    isSelected: (Scalars['Boolean'] | null)
    /** Label for the option value. */
    label: Scalars['String']
    __typename: 'MultipleChoiceOptionValue'
}

export interface Mutation {
    /** The Cart mutations. */
    cart: CartMutations
    /** Customer login */
    login: LoginResult
    /** Customer logout */
    logout: LogoutResult
    /** The wishlist mutations. */
    wishlist: WishlistMutations
    __typename: 'Mutation'
}


/** An object with an ID */
export type Node = (Banner | Blog | BlogPost | Brand | Cart | Category | ContactPage | NormalPage | Product | RawHtmlPage | Variant) & { __isUnion?: true }


/** A normal page. */
export interface NormalPage {
    /** Unique ID for the web page. */
    entityId: Scalars['Int']
    /** The body of the page. */
    htmlBody: Scalars['String']
    /** The ID of an object */
    id: Scalars['ID']
    /** Whether or not the page should be visible in the navigation menu. */
    isVisibleInNavigation: Scalars['Boolean']
    /** Page name. */
    name: Scalars['String']
    /** Unique ID for the parent page. */
    parentEntityId: (Scalars['Int'] | null)
    /** The URL path of the page. */
    path: Scalars['String']
    /** The plain text summary of the page body. */
    plainTextSummary: Scalars['String']
    /** The rendered regions for the web page. */
    renderedRegions: RenderedRegionsByPageType
    /** Page SEO details. */
    seo: SeoDetails
    __typename: 'NormalPage'
}


/** A single line text input field that only accepts numbers. */
export interface NumberFieldOption {
    /** Default value of the text field option. */
    defaultValue: (Scalars['Float'] | null)
    /** Display name for the option. */
    displayName: Scalars['String']
    /** Unique ID for the option. */
    entityId: Scalars['Int']
    /** The top limit of possible numbers. */
    highest: (Scalars['Float'] | null)
    /** Allow whole numbers only. */
    isIntegerOnly: Scalars['Boolean']
    /** One of the option values is required to be selected for the checkout. */
    isRequired: Scalars['Boolean']
    /** Indicates whether it is a variant option or modifier. */
    isVariantOption: Scalars['Boolean']
    /** Limit numbers by several options. */
    limitNumberBy: LimitInputBy
    /** The bottom limit of possible numbers. */
    lowest: (Scalars['Float'] | null)
    __typename: 'NumberFieldOption'
}


/** Operating day */
export interface OperatingDay {
    /** Closing. */
    closing: Scalars['String']
    /** Open. */
    open: Scalars['Boolean']
    /** Opening. */
    opening: Scalars['String']
    __typename: 'OperatingDay'
}


/** Operating hours */
export interface OperatingHours {
    /** Friday. */
    friday: (OperatingDay | null)
    /** Monday. */
    monday: (OperatingDay | null)
    /** Saturday. */
    saturday: (OperatingDay | null)
    /** Sunday. */
    sunday: (OperatingDay | null)
    /** Thursday. */
    thursday: (OperatingDay | null)
    /** Tuesday. */
    tuesday: (OperatingDay | null)
    /** Wednesday. */
    wednesday: (OperatingDay | null)
    __typename: 'OperatingHours'
}


/** A connection to a list of items. */
export interface OptionConnection {
    /** A list of edges. */
    edges: ((OptionEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'OptionConnection'
}


/** An edge in a connection. */
export interface OptionEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: ProductOption
    __typename: 'OptionEdge'
}


/** Behavior of the variant when stock is equal to 0 */
export type OptionOutOfStockBehavior = 'DO_NOTHING' | 'HIDE_OPTION' | 'LABEL_OPTION'


/** A connection to a list of items. */
export interface OptionValueConnection {
    /** A list of edges. */
    edges: ((OptionValueEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'OptionValueConnection'
}


/** An edge in a connection. */
export interface OptionValueEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: ProductOptionValue
    __typename: 'OptionValueEdge'
}


/** Other Filter */
export interface OtherSearchFilter {
    /** Indicates whether to display product count next to the filter. */
    displayProductCount: Scalars['Boolean']
    /** Free shipping filter. */
    freeShipping: (OtherSearchFilterItem | null)
    /** Indicates whether filter is collapsed by default. */
    isCollapsedByDefault: Scalars['Boolean']
    /** Is Featured filter. */
    isFeatured: (OtherSearchFilterItem | null)
    /** Is In Stock filter. */
    isInStock: (OtherSearchFilterItem | null)
    /** Display name for the filter. */
    name: Scalars['String']
    __typename: 'OtherSearchFilter'
}


/** Other Filter Item */
export interface OtherSearchFilterItem {
    /** Indicates whether this filter is selected. */
    isSelected: Scalars['Boolean']
    /** Indicates how many products available for this filter. */
    productCount: Scalars['Int']
    __typename: 'OtherSearchFilterItem'
}


/** A connection to a list of items. */
export interface PageConnection {
    /** A list of edges. */
    edges: ((PageEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'PageConnection'
}


/** An edge in a connection. */
export interface PageEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: WebPage
    __typename: 'PageEdge'
}


/** Information about pagination in a connection. */
export interface PageInfo {
    /** When paginating forwards, the cursor to continue. */
    endCursor: (Scalars['String'] | null)
    /** When paginating forwards, are there more items? */
    hasNextPage: Scalars['Boolean']
    /** When paginating backwards, are there more items? */
    hasPreviousPage: Scalars['Boolean']
    /** When paginating backwards, the cursor to continue. */
    startCursor: (Scalars['String'] | null)
    __typename: 'PageInfo'
}


/** Page type */
export type PageType = 'ACCOUNT_ADDRESS' | 'ACCOUNT_ADD_ADDRESS' | 'ACCOUNT_ADD_RETURN' | 'ACCOUNT_ADD_WISHLIST' | 'ACCOUNT_DOWNLOAD_ITEM' | 'ACCOUNT_EDIT' | 'ACCOUNT_INBOX' | 'ACCOUNT_ORDERS_ALL' | 'ACCOUNT_ORDERS_COMPLETED' | 'ACCOUNT_ORDERS_DETAILS' | 'ACCOUNT_ORDERS_INVOICE' | 'ACCOUNT_RECENT_ITEMS' | 'ACCOUNT_RETURNS' | 'ACCOUNT_RETURN_SAVED' | 'ACCOUNT_WISHLISTS' | 'ACCOUNT_WISHLIST_DETAILS' | 'AUTH_ACCOUNT_CREATED' | 'AUTH_CREATE_ACC' | 'AUTH_FORGOT_PASS' | 'AUTH_LOGIN' | 'AUTH_NEW_PASS' | 'BLOG' | 'BRANDS' | 'CART' | 'COMPARE' | 'GIFT_CERT_BALANCE' | 'GIFT_CERT_PURCHASE' | 'GIFT_CERT_REDEEM' | 'HOME' | 'ORDER_INFO' | 'SEARCH' | 'SITEMAP' | 'SUBSCRIBED' | 'UNSUBSCRIBE'


/** A connection to a list of items. */
export interface PopularBrandConnection {
    /** A list of edges. */
    edges: ((PopularBrandEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'PopularBrandConnection'
}


/** An edge in a connection. */
export interface PopularBrandEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: PopularBrandType
    __typename: 'PopularBrandEdge'
}


/** PopularBrandType */
export interface PopularBrandType {
    /** Brand count */
    count: Scalars['Int']
    /** Brand id */
    entityId: Scalars['Int']
    /** Brand name */
    name: Scalars['String']
    /** Brand URL as a relative path */
    path: (Scalars['String'] | null)
    __typename: 'PopularBrandType'
}


/** The min and max range of prices that apply to this product. */
export interface PriceRanges {
    /** Product price min/max range. */
    priceRange: MoneyRange
    /** Product retail price min/max range. */
    retailPriceRange: (MoneyRange | null)
    __typename: 'PriceRanges'
}


/** Price Filter */
export interface PriceSearchFilter {
    /** Indicates whether filter is collapsed by default. */
    isCollapsedByDefault: Scalars['Boolean']
    /** Display name for the filter. */
    name: Scalars['String']
    /** Selected price filters. */
    selected: (PriceSearchFilterItem | null)
    __typename: 'PriceSearchFilter'
}


/** Price filter range */
export interface PriceSearchFilterItem {
    /** Maximum price of the product. */
    maxPrice: (Scalars['Float'] | null)
    /** Minimum price of the product. */
    minPrice: (Scalars['Float'] | null)
    __typename: 'PriceSearchFilterItem'
}


/** The various prices that can be set on a product. */
export interface Prices {
    /** Original price of the product. */
    basePrice: (Money | null)
    /** List of bulk pricing tiers applicable to a product or variant. */
    bulkPricing: BulkPricingTier[]
    /** Minimum advertised price of the product. */
    mapPrice: (Money | null)
    /** Calculated price of the product.  Calculated price takes into account basePrice, salePrice, rules (modifier, option, option set) that apply to the product configuration, and customer group discounts.  It represents the in-cart price for a product configuration without bulk pricing rules. */
    price: Money
    /** Product price min/max range. */
    priceRange: MoneyRange
    /** Retail price of the product. */
    retailPrice: (Money | null)
    /** Product retail price min/max range. */
    retailPriceRange: (MoneyRange | null)
    /** Sale price of the product. */
    salePrice: (Money | null)
    /** The difference between the retail price (MSRP) and the current price, which can be presented to the shopper as their savings. */
    saved: (Money | null)
    __typename: 'Prices'
}


/** Product */
export interface Product {
    /** Absolute URL path for adding a product to cart. */
    addToCartUrl: Scalars['String']
    /**
     * @deprecated Deprecated.
     * Absolute URL path for adding a product to customer's wishlist.
     */
    addToWishlistUrl: Scalars['String']
    /**
     * @deprecated Use status inside availabilityV2 instead.
     * The availability state of the product.
     */
    availability: Scalars['String']
    /**
     * @deprecated Use description inside availabilityV2 instead.
     * A few words telling the customer how long it will normally take to ship this product, such as 'Usually ships in 24 hours'.
     */
    availabilityDescription: Scalars['String']
    /** The availability state of the product. */
    availabilityV2: ProductAvailability
    /** Brand associated with the product. */
    brand: (Brand | null)
    /** List of categories associated with the product. */
    categories: CategoryConnection
    /** Product condition */
    condition: (ProductConditionType | null)
    /**
     * @deprecated Alpha version. Do not use in production.
     * Product creation date
     */
    createdAt: DateTimeExtended
    /** Custom fields of the product. */
    customFields: CustomFieldConnection
    /** Default image for a product. */
    defaultImage: (Image | null)
    /** Depth of the product. */
    depth: (Measurement | null)
    /** Description of the product. */
    description: Scalars['String']
    /** Id of the product. */
    entityId: Scalars['Int']
    /** Gift wrapping options available for the product. */
    giftWrappingOptions: GiftWrappingConnection
    /** Global trade item number. */
    gtin: (Scalars['String'] | null)
    /** Height of the product. */
    height: (Measurement | null)
    /** The ID of an object */
    id: Scalars['ID']
    /** A list of the images for a product. */
    images: ImageConnection
    /** Inventory information of the product. */
    inventory: ProductInventory
    /** Maximum purchasable quantity for this product in a single order. */
    maxPurchaseQuantity: (Scalars['Int'] | null)
    /** Metafield data related to a product. */
    metafields: MetafieldConnection
    /** Minimum purchasable quantity for this product in a single order. */
    minPurchaseQuantity: (Scalars['Int'] | null)
    /** Manufacturer part number. */
    mpn: (Scalars['String'] | null)
    /** Name of the product. */
    name: Scalars['String']
    /**
     * @deprecated Use productOptions instead.
     * Product options.
     */
    options: OptionConnection
    /** Relative URL path to product page. */
    path: Scalars['String']
    /** Description of the product in plain text. */
    plainTextDescription: Scalars['String']
    /**
     * @deprecated Use priceRanges inside prices node instead.
     * The minimum and maximum price of this product based on variant pricing and/or modifier price rules.
     */
    priceRanges: (PriceRanges | null)
    /** Prices object determined by supplied product ID, variant ID, and selected option IDs. */
    prices: (Prices | null)
    /** Product options. */
    productOptions: ProductOptionConnection
    /** Related products for this product. */
    relatedProducts: RelatedProductsConnection
    /** Summary of the product reviews, includes the total number of reviews submitted and summation of the ratings on the reviews (ratings range from 0-5 per review). */
    reviewSummary: Reviews
    /** Reviews associated with the product. */
    reviews: ReviewConnection
    /** Product SEO details. */
    seo: SeoDetails
    /** Whether or not the cart call to action should be visible for this product. */
    showCartAction: Scalars['Boolean']
    /** Default product variant when no options are selected. */
    sku: Scalars['String']
    /** Type of product, ex: physical, digital */
    type: Scalars['String']
    /** Universal product code. */
    upc: (Scalars['String'] | null)
    /** Variants associated with the product. */
    variants: VariantConnection
    /** Warranty information of the product. */
    warranty: Scalars['String']
    /** Weight of the product. */
    weight: (Measurement | null)
    /** Width of the product. */
    width: (Measurement | null)
    __typename: 'Product'
}


/** Product Attribute Filter */
export interface ProductAttributeSearchFilter {
    /** List of available product attributes. */
    attributes: ProductAttributeSearchFilterItemConnection
    /** Indicates whether to display product count next to the filter. */
    displayProductCount: Scalars['Boolean']
    /** Indicates whether filter is collapsed by default. */
    isCollapsedByDefault: Scalars['Boolean']
    /** Display name for the filter. */
    name: Scalars['String']
    __typename: 'ProductAttributeSearchFilter'
}


/** Specific product attribute filter item */
export interface ProductAttributeSearchFilterItem {
    /** Indicates whether product attribute is selected. */
    isSelected: Scalars['Boolean']
    /** Indicates how many products available for this filter. */
    productCount: Scalars['Int']
    /** Product attribute value. */
    value: Scalars['String']
    __typename: 'ProductAttributeSearchFilterItem'
}


/** A connection to a list of items. */
export interface ProductAttributeSearchFilterItemConnection {
    /** A list of edges. */
    edges: ((ProductAttributeSearchFilterItemEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'ProductAttributeSearchFilterItemConnection'
}


/** An edge in a connection. */
export interface ProductAttributeSearchFilterItemEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: ProductAttributeSearchFilterItem
    __typename: 'ProductAttributeSearchFilterItemEdge'
}


/** Product availability */
export type ProductAvailability = (ProductAvailable | ProductPreOrder | ProductUnavailable) & { __isUnion?: true }


/** Product availability status */
export type ProductAvailabilityStatus = 'Available' | 'Preorder' | 'Unavailable'


/** Available Product */
export interface ProductAvailable {
    /** A few words telling the customer how long it will normally take to ship this product, such as 'Usually ships in 24 hours'. */
    description: Scalars['String']
    /** The availability state of the product. */
    status: ProductAvailabilityStatus
    __typename: 'ProductAvailable'
}


/** Product condition */
export type ProductConditionType = 'NEW' | 'REFURBISHED' | 'USED'


/** A connection to a list of items. */
export interface ProductConnection {
    /** Collection info */
    collectionInfo: (CollectionInfo | null)
    /** A list of edges. */
    edges: ((ProductEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'ProductConnection'
}


/** An edge in a connection. */
export interface ProductEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Product
    __typename: 'ProductEdge'
}


/** Product Inventory Information */
export interface ProductInventory {
    /** Aggregated product inventory information. This data may not be available if not set or if the store's Inventory Settings have disabled displaying stock levels on the storefront. */
    aggregated: (AggregatedInventory | null)
    /** Indicates whether this product's inventory is being tracked on variant level. If true, you may wish to check the variants node to understand the true inventory of each individual variant, rather than relying on this product-level aggregate to understand how many items may be added to cart. */
    hasVariantInventory: Scalars['Boolean']
    /** Indicates whether this product is in stock. */
    isInStock: Scalars['Boolean']
    __typename: 'ProductInventory'
}


/** Product Option */
export interface ProductOption {
    /** Display name for the option. */
    displayName: Scalars['String']
    /** Unique ID for the option. */
    entityId: Scalars['Int']
    /** One of the option values is required to be selected for the checkout. */
    isRequired: Scalars['Boolean']
    /** Option values. */
    values: OptionValueConnection
    __typename: 'ProductOption'
}


/** A connection to a list of items. */
export interface ProductOptionConnection {
    /** A list of edges. */
    edges: ((ProductOptionEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'ProductOptionConnection'
}


/** An edge in a connection. */
export interface ProductOptionEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: CatalogProductOption
    __typename: 'ProductOptionEdge'
}


/** Product Option Value */
export interface ProductOptionValue {
    /** Unique ID for the option value. */
    entityId: Scalars['Int']
    /** Label for the option value. */
    label: Scalars['String']
    __typename: 'ProductOptionValue'
}


/** A connection to a list of items. */
export interface ProductOptionValueConnection {
    /** A list of edges. */
    edges: ((ProductOptionValueEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'ProductOptionValueConnection'
}


/** An edge in a connection. */
export interface ProductOptionValueEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: CatalogProductOptionValue
    __typename: 'ProductOptionValueEdge'
}


/** Behavior of the product when stock is equal to 0 */
export type ProductOutOfStockBehavior = 'DO_NOTHING' | 'HIDE_PRODUCT' | 'HIDE_PRODUCT_AND_ACCESSIBLE' | 'HIDE_PRODUCT_AND_REDIRECT'


/** A Product PickList Value - a product to be mapped to the base product if selected. */
export interface ProductPickListOptionValue {
    /** Default image for a pick list product. */
    defaultImage: (Image | null)
    /** Unique ID for the option value. */
    entityId: Scalars['Int']
    /** Indicates whether this value is the chosen default selected value. */
    isDefault: Scalars['Boolean']
    /** Indicates whether this value is selected based on sku/variantEntityId/optionValueIds overlay requested on the product node level. */
    isSelected: (Scalars['Boolean'] | null)
    /** Label for the option value. */
    label: Scalars['String']
    /** The ID of the product associated with this option value. */
    productId: Scalars['Int']
    __typename: 'ProductPickListOptionValue'
}


/** PreOrder Product */
export interface ProductPreOrder {
    /** A few words telling the customer how long it will normally take to ship this product, such as 'Usually ships in 24 hours'. */
    description: Scalars['String']
    /** The message to be shown in the store when a product is put into the pre-order availability state, e.g. "Expected release date is %%DATE%%" */
    message: (Scalars['String'] | null)
    /** The availability state of the product. */
    status: ProductAvailabilityStatus
    /** Product release date */
    willBeReleasedAt: (DateTimeExtended | null)
    __typename: 'ProductPreOrder'
}


/** Product reviews sorting. */
export type ProductReviewsSortInput = 'HIGHEST_RATING' | 'LOWEST_RATING' | 'NEWEST' | 'OLDEST'


/** Unavailable Product */
export interface ProductUnavailable {
    /** A few words telling the customer how long it will normally take to ship this product, such as 'Usually ships in 24 hours'. */
    description: Scalars['String']
    /** The message to be shown in the store when "Call for pricing" is enabled for this product, e.g. "Contact us at 555-5555" */
    message: (Scalars['String'] | null)
    /** The availability state of the product. */
    status: ProductAvailabilityStatus
    __typename: 'ProductUnavailable'
}


/** Public Wishlist */
export interface PublicWishlist {
    /** The wishlist id. */
    entityId: Scalars['Int']
    /** A list of the wishlist items */
    items: WishlistItemConnection
    /** The wishlist name. */
    name: Scalars['String']
    /** The wishlist token. */
    token: Scalars['String']
    __typename: 'PublicWishlist'
}

export interface Query {
    /** The current channel. */
    channel: Channel
    /** The currently logged in customer. */
    customer: (Customer | null)
    /** An inventory */
    inventory: Inventory
    /** Fetches an object given its ID */
    node: (Node | null)
    /** A site */
    site: Site
    __typename: 'Query'
}


/** Rating Filter */
export interface RatingSearchFilter {
    /** Indicates whether filter is collapsed by default. */
    isCollapsedByDefault: Scalars['Boolean']
    /** Display name for the filter. */
    name: Scalars['String']
    /** List of available ratings. */
    ratings: RatingSearchFilterItemConnection
    __typename: 'RatingSearchFilter'
}


/** Specific rating filter item */
export interface RatingSearchFilterItem {
    /** Indicates whether rating is selected. */
    isSelected: Scalars['Boolean']
    /** Indicates how many products available for this filter. */
    productCount: Scalars['Int']
    /** Rating value. */
    value: Scalars['String']
    __typename: 'RatingSearchFilterItem'
}


/** A connection to a list of items. */
export interface RatingSearchFilterItemConnection {
    /** A list of edges. */
    edges: ((RatingSearchFilterItemEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'RatingSearchFilterItemConnection'
}


/** An edge in a connection. */
export interface RatingSearchFilterItemEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: RatingSearchFilterItem
    __typename: 'RatingSearchFilterItemEdge'
}


/** A raw HTML page. */
export interface RawHtmlPage {
    /** Unique ID for the web page. */
    entityId: Scalars['Int']
    /** The body of the page. */
    htmlBody: Scalars['String']
    /** The ID of an object */
    id: Scalars['ID']
    /** Whether or not the page should be visible in the navigation menu. */
    isVisibleInNavigation: Scalars['Boolean']
    /** Page name. */
    name: Scalars['String']
    /** Unique ID for the parent page. */
    parentEntityId: (Scalars['Int'] | null)
    /** The URL path of the page. */
    path: Scalars['String']
    /** The plain text summary of the page body. */
    plainTextSummary: Scalars['String']
    /** Page SEO details. */
    seo: SeoDetails
    __typename: 'RawHtmlPage'
}


/** ReCaptcha settings. */
export interface ReCaptchaSettings {
    /** ReCaptcha site key. */
    siteKey: Scalars['String']
    __typename: 'ReCaptchaSettings'
}


/** The region object */
export interface Region {
    /** The rendered HTML content targeted at the region. */
    html: Scalars['String']
    /** The name of a region. */
    name: Scalars['String']
    __typename: 'Region'
}


/** A connection to a list of items. */
export interface RelatedProductsConnection {
    /** A list of edges. */
    edges: ((RelatedProductsEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'RelatedProductsConnection'
}


/** An edge in a connection. */
export interface RelatedProductsEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Product
    __typename: 'RelatedProductsEdge'
}


/** The rendered regions by specific page. */
export interface RenderedRegionsByPageType {
    /** List of regions */
    regions: Region[]
    __typename: 'RenderedRegionsByPageType'
}


/** Review */
export interface Review {
    /** Product review author. */
    author: Author
    /** Product review creation date. */
    createdAt: DateTimeExtended
    /** Unique ID for the product review. */
    entityId: Scalars['Long']
    /** Product review rating. */
    rating: Scalars['Int']
    /** Product review text. */
    text: Scalars['String']
    /** Product review title. */
    title: Scalars['String']
    __typename: 'Review'
}


/** A connection to a list of items. */
export interface ReviewConnection {
    /** A list of edges. */
    edges: ((ReviewEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'ReviewConnection'
}


/** An edge in a connection. */
export interface ReviewEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Review
    __typename: 'ReviewEdge'
}


/** Review Rating Summary */
export interface Reviews {
    /**
     * @deprecated Alpha version. Do not use in production.
     * Average rating of the product.
     */
    averageRating: Scalars['Float']
    /** Total number of reviews on product. */
    numberOfReviews: Scalars['Int']
    /** Summation of rating scores from each review. */
    summationOfRatings: Scalars['Int']
    __typename: 'Reviews'
}


/** route */
export interface Route {
    /** Node */
    node: (Node | null)
    __typename: 'Route'
}


/** Store search settings. */
export interface Search {
    /** Product filtering enabled. */
    productFilteringEnabled: Scalars['Boolean']
    __typename: 'Search'
}


/** Search Product Filter */
export type SearchProductFilter = (BrandSearchFilter | CategorySearchFilter | OtherSearchFilter | PriceSearchFilter | ProductAttributeSearchFilter | RatingSearchFilter) & { __isUnion?: true }


/** A connection to a list of items. */
export interface SearchProductFilterConnection {
    /** A list of edges. */
    edges: ((SearchProductFilterEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'SearchProductFilterConnection'
}


/** An edge in a connection. */
export interface SearchProductFilterEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: SearchProductFilter
    __typename: 'SearchProductFilterEdge'
}


/** Container for catalog search results, which may contain both products as well as a list of search filters for further refinement. */
export interface SearchProducts {
    /** Available product filters. */
    filters: SearchProductFilterConnection
    /** Details of the products. */
    products: ProductConnection
    __typename: 'SearchProducts'
}


/** Sort to use for the product results. Relevance is the default for textual search terms, and “Featured” is the default for category page contexts without a search term. */
export type SearchProductsSortInput = 'A_TO_Z' | 'BEST_REVIEWED' | 'BEST_SELLING' | 'FEATURED' | 'HIGHEST_PRICE' | 'LOWEST_PRICE' | 'NEWEST' | 'RELEVANCE' | 'Z_TO_A'


/** The Search queries. */
export interface SearchQueries {
    /** Details of the products and facets matching given search criteria. */
    searchProducts: SearchProducts
    __typename: 'SearchQueries'
}


/** Seo Details */
export interface SeoDetails {
    /** Meta description. */
    metaDescription: Scalars['String']
    /** Meta keywords. */
    metaKeywords: Scalars['String']
    /** Page title. */
    pageTitle: Scalars['String']
    __typename: 'SeoDetails'
}


/** Store settings information from the control panel. */
export interface Settings {
    /** Channel ID. */
    channelId: Scalars['Long']
    /** Checkout settings. */
    checkout: (CheckoutSettings | null)
    /** Contact information for the store. */
    contact: (ContactField | null)
    /** Store display format information. */
    display: DisplayField
    /** Inventory settings. */
    inventory: (InventorySettings | null)
    /**
     * @deprecated Use `logoV2` instead.
     * Logo information for the store.
     */
    logo: LogoField
    /** Logo information for the store. */
    logoV2: StoreLogo
    /** ReCaptcha settings. */
    reCaptcha: ReCaptchaSettings
    /** Store search settings. */
    search: Search
    /** The social media links of connected platforms to the storefront. */
    socialMediaLinks: SocialMediaLink[]
    /** The current store status. */
    status: StorefrontStatusType
    /** The hash of the store. */
    storeHash: Scalars['String']
    /** The name of the store. */
    storeName: Scalars['String']
    /** Storefront settings. */
    storefront: Storefront
    /** The tax display settings object */
    tax: (TaxDisplaySettings | null)
    /** Store urls. */
    url: UrlField
    __typename: 'Settings'
}


/** A connection to a list of items. */
export interface ShopByPriceConnection {
    /** A list of edges. */
    edges: ((ShopByPriceEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'ShopByPriceConnection'
}


/** An edge in a connection. */
export interface ShopByPriceEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: ShopByPriceRange
    __typename: 'ShopByPriceEdge'
}


/** Category shop by price money ranges */
export interface ShopByPriceRange {
    /** Category shop by price range. */
    ranges: MoneyRange
    __typename: 'ShopByPriceRange'
}


/** A site */
export interface Site {
    /** Details of the best selling products. */
    bestSellingProducts: ProductConnection
    /** Details of the brand. */
    brands: BrandConnection
    /** The Cart of the current customer. */
    cart: (Cart | null)
    /** Retrieve a category object by the id. */
    category: (Category | null)
    /** A tree of categories. */
    categoryTree: CategoryTreeItem[]
    /** The page content. */
    content: Content
    /** Store Currencies. */
    currencies: CurrencyConnection
    /** Currency details. */
    currency: (Currency | null)
    /** Details of the featured products. */
    featuredProducts: ProductConnection
    /** Details of the newest products. */
    newestProducts: ProductConnection
    /** List of brands sorted by product count. */
    popularBrands: PopularBrandConnection
    /** A single product object with variant pricing overlay capabilities. */
    product: (Product | null)
    /** Details of the products. */
    products: ProductConnection
    /** Public Wishlist */
    publicWishlist: (PublicWishlist | null)
    /** Route for a node */
    route: Route
    /** The Search queries. */
    search: SearchQueries
    /** Store settings. */
    settings: (Settings | null)
    __typename: 'Site'
}


/** The social media link. */
export interface SocialMediaLink {
    /** The name of the social media link. */
    name: Scalars['String']
    /** The url of the social media link. */
    url: Scalars['String']
    __typename: 'SocialMediaLink'
}


/** Special hour */
export interface SpecialHour {
    /** Closing time */
    closing: (Scalars['DateTime'] | null)
    /** Upcoming event name */
    label: Scalars['String']
    /** Is open */
    open: Scalars['Boolean']
    /** Opening time */
    opening: (Scalars['DateTime'] | null)
    __typename: 'SpecialHour'
}


/** Stock level display setting */
export type StockLevelDisplay = 'DONT_SHOW' | 'SHOW' | 'SHOW_WHEN_LOW'


/** Store logo as image. */
export interface StoreImageLogo {
    /** Logo image. */
    image: Image
    __typename: 'StoreImageLogo'
}


/** Store logo. */
export type StoreLogo = (StoreImageLogo | StoreTextLogo) & { __isUnion?: true }


/** Store logo as text. */
export interface StoreTextLogo {
    /** Logo text. */
    text: Scalars['String']
    __typename: 'StoreTextLogo'
}


/** Storefront settings. */
export interface Storefront {
    /** Storefront catalog settings. */
    catalog: (Catalog | null)
    __typename: 'Storefront'
}


/** Storefront Mode */
export type StorefrontStatusType = 'HIBERNATION' | 'LAUNCHED' | 'MAINTENANCE' | 'PRE_LAUNCH'


/** Specific sub-category filter item */
export interface SubCategorySearchFilterItem {
    /** Category ID. */
    entityId: Scalars['Int']
    /** Indicates whether category is selected. */
    isSelected: Scalars['Boolean']
    /** Category name. */
    name: Scalars['String']
    /** Indicates how many products available for this filter. */
    productCount: Scalars['Int']
    /** List of available sub-categories. */
    subCategories: SubCategorySearchFilterItemConnection
    __typename: 'SubCategorySearchFilterItem'
}


/** A connection to a list of items. */
export interface SubCategorySearchFilterItemConnection {
    /** A list of edges. */
    edges: ((SubCategorySearchFilterItemEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'SubCategorySearchFilterItemConnection'
}


/** An edge in a connection. */
export interface SubCategorySearchFilterItemEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: SubCategorySearchFilterItem
    __typename: 'SubCategorySearchFilterItemEdge'
}


/** A swatch option value - swatch values can be associated with a list of hexidecimal colors or an image. */
export interface SwatchOptionValue {
    /** Unique ID for the option value. */
    entityId: Scalars['Int']
    /** List of up to 3 hex encoded colors to associate with a swatch value. */
    hexColors: Scalars['String'][]
    /** Absolute path of a swatch texture image. */
    imageUrl: (Scalars['String'] | null)
    /** Indicates whether this value is the chosen default selected value. */
    isDefault: Scalars['Boolean']
    /** Indicates whether this value is selected based on sku/variantEntityId/optionValueIds overlay requested on the product node level. */
    isSelected: (Scalars['Boolean'] | null)
    /** Label for the option value. */
    label: Scalars['String']
    __typename: 'SwatchOptionValue'
}


/** The tax display settings object */
export interface TaxDisplaySettings {
    /** Tax display setting for Product Details Page. */
    pdp: TaxPriceDisplay
    /** Tax display setting for Product List Page. */
    plp: TaxPriceDisplay
    __typename: 'TaxDisplaySettings'
}


/** Tax setting can be set included or excluded (Tax setting can also be set to both on PDP/PLP). */
export type TaxPriceDisplay = 'BOTH' | 'EX' | 'INC'


/** A single line text input field. */
export interface TextFieldOption {
    /** Default value of the text field option. */
    defaultValue: (Scalars['String'] | null)
    /** Display name for the option. */
    displayName: Scalars['String']
    /** Unique ID for the option. */
    entityId: Scalars['Int']
    /** One of the option values is required to be selected for the checkout. */
    isRequired: Scalars['Boolean']
    /** Indicates whether it is a variant option or modifier. */
    isVariantOption: Scalars['Boolean']
    /** The maximum number of characters. */
    maxLength: (Scalars['Int'] | null)
    /** The minimum number of characters. */
    minLength: (Scalars['Int'] | null)
    __typename: 'TextFieldOption'
}


/** Unassign cart from the customer result. */
export interface UnassignCartFromCustomerResult {
    /** The Cart that is updated as a result of mutation. */
    cart: (Cart | null)
    __typename: 'UnassignCartFromCustomerResult'
}


/** Update cart currency result */
export interface UpdateCartCurrencyResult {
    /** The Cart that is updated as a result of mutation. */
    cart: (Cart | null)
    __typename: 'UpdateCartCurrencyResult'
}


/** Update cart line item result */
export interface UpdateCartLineItemResult {
    /** The Cart that is updated as a result of mutation. */
    cart: (Cart | null)
    __typename: 'UpdateCartLineItemResult'
}


/** Update wishlist */
export interface UpdateWishlistResult {
    /** The wishlist */
    result: Wishlist
    __typename: 'UpdateWishlistResult'
}


/** Url field */
export interface UrlField {
    /** CDN url to fetch assets. */
    cdnUrl: Scalars['String']
    /** Checkout url. */
    checkoutUrl: (Scalars['String'] | null)
    /** Store url. */
    vanityUrl: Scalars['String']
    __typename: 'UrlField'
}


/** Variant */
export interface Variant {
    /** Default image for a variant. */
    defaultImage: (Image | null)
    /** The variant's depth. If a depth was not explicitly specified on the variant, this will be the product's depth. */
    depth: (Measurement | null)
    /** Id of the variant. */
    entityId: Scalars['Int']
    /** Global trade item number. */
    gtin: (Scalars['String'] | null)
    /** The variant's height. If a height was not explicitly specified on the variant, this will be the product's height. */
    height: (Measurement | null)
    /** The ID of an object */
    id: Scalars['ID']
    /** Variant inventory */
    inventory: (VariantInventory | null)
    /** Whether the product can be purchased */
    isPurchasable: Scalars['Boolean']
    /** Metafield data related to a variant. */
    metafields: MetafieldConnection
    /** Manufacturer part number. */
    mpn: (Scalars['String'] | null)
    /** The options which define a variant. */
    options: OptionConnection
    /** Variant prices */
    prices: (Prices | null)
    /** Product options that compose this variant. */
    productOptions: ProductOptionConnection
    /** Sku of the variant. */
    sku: Scalars['String']
    /** Universal product code. */
    upc: (Scalars['String'] | null)
    /** The variant's weight. If a weight was not explicitly specified on the variant, this will be the product's weight. */
    weight: (Measurement | null)
    /** The variant's width. If a width was not explicitly specified on the variant, this will be the product's width. */
    width: (Measurement | null)
    __typename: 'Variant'
}


/** A connection to a list of items. */
export interface VariantConnection {
    /** A list of edges. */
    edges: ((VariantEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'VariantConnection'
}


/** An edge in a connection. */
export interface VariantEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Variant
    __typename: 'VariantEdge'
}


/** Variant Inventory */
export interface VariantInventory {
    /** Aggregated product variant inventory information. This data may not be available if not set or if the store's Inventory Settings have disabled displaying stock levels on the storefront. */
    aggregated: (Aggregated | null)
    /** Inventory by locations. */
    byLocation: (LocationConnection | null)
    /** Indicates whether this product is in stock. */
    isInStock: Scalars['Boolean']
    __typename: 'VariantInventory'
}


/** WebPage details. */
export type WebPage = (BlogIndexPage | ContactPage | ExternalLinkPage | NormalPage | RawHtmlPage) & { __isUnion?: true }


/** Web page type */
export type WebPageType = 'BLOG' | 'CONTACT' | 'LINK' | 'NORMAL' | 'RAW'


/** A wishlist */
export interface Wishlist {
    /** The wishlist id. */
    entityId: Scalars['Int']
    /** Is the wishlist public? */
    isPublic: Scalars['Boolean']
    /** A list of the wishlist items */
    items: WishlistItemConnection
    /** The wishlist name. */
    name: Scalars['String']
    /** The wishlist token. */
    token: Scalars['String']
    __typename: 'Wishlist'
}


/** A connection to a list of items. */
export interface WishlistConnection {
    /** A list of edges. */
    edges: ((WishlistEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'WishlistConnection'
}


/** An edge in a connection. */
export interface WishlistEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: Wishlist
    __typename: 'WishlistEdge'
}


/** The wishlist item */
export interface WishlistItem {
    /** Wishlist item id. */
    entityId: Scalars['Int']
    /** A product included in the wishlist. */
    product: Product
    /** An id of the product from the wishlist. */
    productEntityId: Scalars['Int']
    /** An id of the specific product variant from the wishlist. */
    variantEntityId: (Scalars['Int'] | null)
    __typename: 'WishlistItem'
}


/** A connection to a list of items. */
export interface WishlistItemConnection {
    /** A list of edges. */
    edges: ((WishlistItemEdge | null)[] | null)
    /** Information to aid in pagination. */
    pageInfo: PageInfo
    __typename: 'WishlistItemConnection'
}


/** An edge in a connection. */
export interface WishlistItemEdge {
    /** A cursor for use in pagination. */
    cursor: Scalars['String']
    /** The item at the end of the edge. */
    node: WishlistItem
    __typename: 'WishlistItemEdge'
}


/** The wishlist mutations. */
export interface WishlistMutations {
    /** Add wishlist items */
    addWishlistItems: (AddWishlistItemsResult | null)
    /** Create wishlist */
    createWishlist: (CreateWishlistResult | null)
    /** Delete wishlist items */
    deleteWishlistItems: (DeleteWishlistItemsResult | null)
    /** Delete wishlist */
    deleteWishlists: (DeleteWishlistResult | null)
    /** Update wishlist */
    updateWishlist: (UpdateWishlistResult | null)
    __typename: 'WishlistMutations'
}


/** Country Code */
export type countryCode = 'AD' | 'AE' | 'AF' | 'AG' | 'AI' | 'AL' | 'AM' | 'AO' | 'AQ' | 'AR' | 'AS' | 'AT' | 'AU' | 'AW' | 'AX' | 'AZ' | 'BA' | 'BB' | 'BD' | 'BE' | 'BF' | 'BG' | 'BH' | 'BI' | 'BJ' | 'BL' | 'BM' | 'BN' | 'BO' | 'BQ' | 'BR' | 'BS' | 'BT' | 'BV' | 'BW' | 'BY' | 'BZ' | 'CA' | 'CC' | 'CD' | 'CF' | 'CG' | 'CH' | 'CI' | 'CK' | 'CL' | 'CM' | 'CN' | 'CO' | 'CR' | 'CU' | 'CV' | 'CW' | 'CX' | 'CY' | 'CZ' | 'DE' | 'DJ' | 'DK' | 'DM' | 'DO' | 'DZ' | 'EC' | 'EE' | 'EG' | 'EH' | 'ER' | 'ES' | 'ET' | 'FI' | 'FJ' | 'FK' | 'FM' | 'FO' | 'FR' | 'GA' | 'GB' | 'GD' | 'GE' | 'GF' | 'GG' | 'GH' | 'GI' | 'GL' | 'GM' | 'GN' | 'GP' | 'GQ' | 'GR' | 'GS' | 'GT' | 'GU' | 'GW' | 'GY' | 'HK' | 'HM' | 'HN' | 'HR' | 'HT' | 'HU' | 'ID' | 'IE' | 'IL' | 'IM' | 'IN' | 'IO' | 'IQ' | 'IR' | 'IS' | 'IT' | 'JE' | 'JM' | 'JO' | 'JP' | 'KE' | 'KG' | 'KH' | 'KI' | 'KM' | 'KN' | 'KP' | 'KR' | 'KW' | 'KY' | 'KZ' | 'LA' | 'LB' | 'LC' | 'LI' | 'LK' | 'LR' | 'LS' | 'LT' | 'LU' | 'LV' | 'LY' | 'MA' | 'MC' | 'MD' | 'ME' | 'MF' | 'MG' | 'MH' | 'MK' | 'ML' | 'MM' | 'MN' | 'MO' | 'MP' | 'MQ' | 'MR' | 'MS' | 'MT' | 'MU' | 'MV' | 'MW' | 'MX' | 'MY' | 'MZ' | 'NA' | 'NC' | 'NE' | 'NF' | 'NG' | 'NI' | 'NL' | 'NO' | 'NP' | 'NR' | 'NU' | 'NZ' | 'OM' | 'PA' | 'PE' | 'PF' | 'PG' | 'PH' | 'PK' | 'PL' | 'PM' | 'PN' | 'PR' | 'PS' | 'PT' | 'PW' | 'PY' | 'QA' | 'RE' | 'RO' | 'RS' | 'RU' | 'RW' | 'SA' | 'SB' | 'SC' | 'SD' | 'SE' | 'SG' | 'SH' | 'SI' | 'SJ' | 'SK' | 'SL' | 'SM' | 'SN' | 'SO' | 'SR' | 'SS' | 'ST' | 'SV' | 'SX' | 'SY' | 'SZ' | 'TC' | 'TD' | 'TF' | 'TG' | 'TH' | 'TJ' | 'TK' | 'TL' | 'TM' | 'TN' | 'TO' | 'TR' | 'TT' | 'TV' | 'TW' | 'TZ' | 'UA' | 'UG' | 'UM' | 'US' | 'UY' | 'UZ' | 'VA' | 'VC' | 'VE' | 'VG' | 'VI' | 'VN' | 'VU' | 'WF' | 'WS' | 'YE' | 'YT' | 'ZA' | 'ZM' | 'ZW'


/** Currency Code */
export type currencyCode = 'ADP' | 'AED' | 'AFA' | 'AFN' | 'ALK' | 'ALL' | 'AMD' | 'ANG' | 'AOA' | 'AOK' | 'AON' | 'AOR' | 'ARA' | 'ARL' | 'ARM' | 'ARP' | 'ARS' | 'ATS' | 'AUD' | 'AWG' | 'AZM' | 'AZN' | 'BAD' | 'BAM' | 'BAN' | 'BBD' | 'BDT' | 'BEC' | 'BEF' | 'BEL' | 'BGL' | 'BGM' | 'BGN' | 'BGO' | 'BHD' | 'BIF' | 'BMD' | 'BND' | 'BOB' | 'BOL' | 'BOP' | 'BOV' | 'BRB' | 'BRC' | 'BRE' | 'BRL' | 'BRN' | 'BRR' | 'BRZ' | 'BSD' | 'BTN' | 'BUK' | 'BWP' | 'BYB' | 'BYN' | 'BYR' | 'BZD' | 'CAD' | 'CDF' | 'CHE' | 'CHF' | 'CHW' | 'CLE' | 'CLF' | 'CLP' | 'CNX' | 'CNY' | 'COP' | 'COU' | 'CRC' | 'CSD' | 'CSK' | 'CUC' | 'CUP' | 'CVE' | 'CYP' | 'CZK' | 'DDM' | 'DEM' | 'DJF' | 'DKK' | 'DOP' | 'DZD' | 'ECS' | 'ECV' | 'EEK' | 'EGP' | 'ERN' | 'ESA' | 'ESB' | 'ESP' | 'ETB' | 'EUR' | 'FIM' | 'FJD' | 'FKP' | 'FRF' | 'GBP' | 'GEK' | 'GEL' | 'GHC' | 'GHS' | 'GIP' | 'GMD' | 'GNF' | 'GNS' | 'GQE' | 'GRD' | 'GTQ' | 'GWE' | 'GWP' | 'GYD' | 'HKD' | 'HNL' | 'HRD' | 'HRK' | 'HTG' | 'HUF' | 'IDR' | 'IEP' | 'ILP' | 'ILR' | 'ILS' | 'INR' | 'IQD' | 'IRR' | 'ISJ' | 'ISK' | 'ITL' | 'JMD' | 'JOD' | 'JPY' | 'KES' | 'KGS' | 'KHR' | 'KMF' | 'KPW' | 'KRH' | 'KRO' | 'KRW' | 'KWD' | 'KYD' | 'KZT' | 'LAK' | 'LBP' | 'LKR' | 'LRD' | 'LSL' | 'LTL' | 'LTT' | 'LUC' | 'LUF' | 'LUL' | 'LVL' | 'LVR' | 'LYD' | 'MAD' | 'MAF' | 'MCF' | 'MDC' | 'MDL' | 'MGA' | 'MGF' | 'MKD' | 'MKN' | 'MLF' | 'MMK' | 'MNT' | 'MOP' | 'MRO' | 'MTL' | 'MTP' | 'MUR' | 'MVP' | 'MVR' | 'MWK' | 'MXN' | 'MXP' | 'MXV' | 'MYR' | 'MZE' | 'MZM' | 'MZN' | 'NAD' | 'NGN' | 'NIC' | 'NIO' | 'NLG' | 'NOK' | 'NPR' | 'NZD' | 'OMR' | 'PAB' | 'PEI' | 'PEN' | 'PES' | 'PGK' | 'PHP' | 'PKR' | 'PLN' | 'PLZ' | 'PTE' | 'PYG' | 'QAR' | 'RHD' | 'ROL' | 'RON' | 'RSD' | 'RUB' | 'RUR' | 'RWF' | 'SAR' | 'SBD' | 'SCR' | 'SDD' | 'SDG' | 'SDP' | 'SEK' | 'SGD' | 'SHP' | 'SIT' | 'SKK' | 'SLL' | 'SOS' | 'SRD' | 'SRG' | 'SSP' | 'STD' | 'SUR' | 'SVC' | 'SYP' | 'SZL' | 'THB' | 'TJR' | 'TJS' | 'TMM' | 'TMT' | 'TND' | 'TOP' | 'TPE' | 'TRL' | 'TRY' | 'TTD' | 'TWD' | 'TZS' | 'UAH' | 'UAK' | 'UGS' | 'UGX' | 'USD' | 'USN' | 'USS' | 'UYI' | 'UYP' | 'UYU' | 'UZS' | 'VEB' | 'VEF' | 'VND' | 'VNN' | 'VUV' | 'WST' | 'XAF' | 'XCD' | 'XEU' | 'XFO' | 'XFU' | 'XOF' | 'XPF' | 'XRE' | 'YDD' | 'YER' | 'YUD' | 'YUM' | 'YUN' | 'YUR' | 'ZAL' | 'ZAR' | 'ZMK' | 'ZMW' | 'ZRN' | 'ZRZ' | 'ZWD' | 'ZWL' | 'ZWR'


/** Blog post sort */
export type sortBy = 'NEWEST' | 'OLDEST'


/** Add cart line items data object */
export interface AddCartLineItemsDataInput {
/** List of gift certificates */
giftCertificates?: (CartGiftCertificateInput[] | null),
/** List of cart line items */
lineItems?: (CartLineItemInput[] | null)}


/** Add cart line items input object */
export interface AddCartLineItemsInput {
/** The cart id */
cartEntityId?: Scalars['String'],
/** Add cart line items data object */
data?: AddCartLineItemsDataInput}


/** Add cart line items result */
export interface AddCartLineItemsResultGenqlSelection{
    /** The Cart that is updated as a result of mutation. */
    cart?: CartGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Add wishlist items input object */
export interface AddWishlistItemsInput {
/** The wishlist id */
entityId?: Scalars['Int'],
/** The new wishlist items */
items?: WishlistItemInput[]}


/** Add wishlist items */
export interface AddWishlistItemsResultGenqlSelection{
    /** The wishlist */
    result?: WishlistGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Aggregated */
export interface AggregatedGenqlSelection{
    /** Number of available products in stock. This can be 'null' if inventory is not set orif the store's Inventory Settings disable displaying stock levels on the storefront. */
    availableToSell?: boolean | number
    /** Indicates a threshold low-stock level.  This can be 'null' if the inventory warning level is not set or if the store's Inventory Settings disable displaying stock levels on the storefront. */
    warningLevel?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Aggregated Product Inventory */
export interface AggregatedInventoryGenqlSelection{
    /** Number of available products in stock. This can be 'null' if inventory is not set orif the store's Inventory Settings disable displaying stock levels on the storefront. */
    availableToSell?: boolean | number
    /** Indicates a threshold low-stock level. This can be 'null' if the inventory warning level is not set or if the store's Inventory Settings disable displaying stock levels on the storefront. */
    warningLevel?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Assign cart to the customer input object. */
export interface AssignCartToCustomerInput {
/** The cart id. */
cartEntityId?: Scalars['String']}


/** Assign cart to the customer result. */
export interface AssignCartToCustomerResultGenqlSelection{
    /** The Cart that is updated as a result of mutation. */
    cart?: CartGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Author */
export interface AuthorGenqlSelection{
    /** Author name. */
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Banner details. */
export interface BannerGenqlSelection{
    /** The content of the Banner. */
    content?: boolean | number
    /** The id of the Banner. */
    entityId?: boolean | number
    /** The id of the object. */
    id?: boolean | number
    /** The location of the Banner. */
    location?: boolean | number
    /** The name of the Banner. */
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface BannerConnectionGenqlSelection{
    /** A list of edges. */
    edges?: BannerEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface BannerEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: BannerGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Banners details. */
export interface BannersGenqlSelection{
    /** List of brand page banners. */
    brandPage?: (BrandPageBannerConnectionGenqlSelection & { __args: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), 
    /** The id of the brand to request banners for. */
    brandEntityId: Scalars['Int'], first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** List of category page banners. */
    categoryPage?: (CategoryPageBannerConnectionGenqlSelection & { __args: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), 
    /** The id of the category to request banners for. */
    categoryEntityId: Scalars['Int'], first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** List of home page banners. */
    homePage?: (BannerConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** List of search page banners. */
    searchPage?: (BannerConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Blog details. */
export interface BlogGenqlSelection{
    /** The description of the Blog. */
    description?: boolean | number
    /** The ID of an object */
    id?: boolean | number
    /** Whether or not the blog should be visible in the navigation menu. */
    isVisibleInNavigation?: boolean | number
    /** The name of the Blog. */
    name?: boolean | number
    /** The path of the Blog. */
    path?: boolean | number
    /** Blog post details. */
    post?: (BlogPostGenqlSelection & { __args: {
    /** Id of the blog post to fetch. */
    entityId: Scalars['Int']} })
    /** Details of the Blog posts. */
    posts?: (BlogPostConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), 
    /** Filters for querying blog posts */
    filters?: (BlogPostsFiltersInput | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), 
    /** Order to sort the blog posts. */
    sort?: (sortBy | null)} })
    /** The rendered regions for the blog index. */
    renderedRegions?: RenderedRegionsByPageTypeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A blog index page. */
export interface BlogIndexPageGenqlSelection{
    /** Unique ID for the web page. */
    entityId?: boolean | number
    /** Whether or not the page should be visible in the navigation menu. */
    isVisibleInNavigation?: boolean | number
    /** Page name. */
    name?: boolean | number
    /** Unique ID for the parent page. */
    parentEntityId?: boolean | number
    /** The URL path of the page. */
    path?: boolean | number
    /** The rendered regions for the web page. */
    renderedRegions?: RenderedRegionsByPageTypeGenqlSelection
    /** Page SEO details. */
    seo?: SeoDetailsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Blog post details. */
export interface BlogPostGenqlSelection{
    /** Blog post author. */
    author?: boolean | number
    /** Unique ID for the blog post. */
    entityId?: boolean | number
    /** The body of the Blog post. */
    htmlBody?: boolean | number
    /** The ID of an object */
    id?: boolean | number
    /** Blog post name. */
    name?: boolean | number
    /** Blog post path. */
    path?: boolean | number
    /** The plain text summary of the Blog post. */
    plainTextSummary?: { __args: {
    /** The max number of characters for the plain text summary. */
    characterLimit?: (Scalars['Int'] | null)} } | boolean | number
    /** Blog post published date. */
    publishedDate?: DateTimeExtendedGenqlSelection
    /** The rendered regions for the blog post. */
    renderedRegions?: RenderedRegionsByPageTypeGenqlSelection
    /** Blog post SEO details. */
    seo?: SeoDetailsGenqlSelection
    /** Blog post tags. */
    tags?: boolean | number
    /** Blog post thumbnail image. */
    thumbnailImage?: ImageGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface BlogPostConnectionGenqlSelection{
    /** Collection info */
    collectionInfo?: CollectionInfoGenqlSelection
    /** A list of edges. */
    edges?: BlogPostEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface BlogPostEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: BlogPostGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Object containing the filters for querying blog posts */
export interface BlogPostsFiltersInput {
/** Ids of the expected blog posts. */
entityIds?: (Scalars['Int'][] | null),
/** Tags of the expected blog posts. */
tags?: (Scalars['String'][] | null)}


/** Brand */
export interface BrandGenqlSelection{
    /** Default image for brand. */
    defaultImage?: ImageGenqlSelection
    /** Id of the brand. */
    entityId?: boolean | number
    /** The ID of an object */
    id?: boolean | number
    /**
     * @deprecated Use SEO details instead.
     * Meta description for the brand.
     */
    metaDesc?: boolean | number
    /**
     * @deprecated Use SEO details instead.
     * Meta keywords for the brand.
     */
    metaKeywords?: boolean | number
    /** Metafield data related to a brand. */
    metafields?: (MetafieldConnectionGenqlSelection & { __args: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), 
    /** Labels for identifying metafield data values. */
    keys?: (Scalars['String'][] | null), last?: (Scalars['Int'] | null), 
    /** Metafield namespace filter */
    namespace: Scalars['String']} })
    /** Name of the brand. */
    name?: boolean | number
    /**
     * @deprecated Use SEO details instead.
     * Page title for the brand.
     */
    pageTitle?: boolean | number
    /** Path for the brand page. */
    path?: boolean | number
    /** List of products associated with the brand. */
    products?: (ProductConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), 
    /** When set to True, hides products which are out of stock. Defaults to False. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
    hideOutOfStock?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null)} })
    /** Search keywords for the brand. */
    searchKeywords?: boolean | number
    /** Brand SEO details. */
    seo?: SeoDetailsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface BrandConnectionGenqlSelection{
    /** A list of edges. */
    edges?: BrandEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface BrandEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: BrandGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface BrandPageBannerConnectionGenqlSelection{
    /** A list of edges. */
    edges?: BrandPageBannerEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface BrandPageBannerEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: BannerGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Brand Filter */
export interface BrandSearchFilterGenqlSelection{
    /** List of available brands. */
    brands?: (BrandSearchFilterItemConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** Indicates whether to display product count next to the filter. */
    displayProductCount?: boolean | number
    /** Indicates whether filter is collapsed by default. */
    isCollapsedByDefault?: boolean | number
    /** Display name for the filter. */
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Specific brand filter item */
export interface BrandSearchFilterItemGenqlSelection{
    /** Brand ID. */
    entityId?: boolean | number
    /** Indicates whether brand is selected. */
    isSelected?: boolean | number
    /** Brand name. */
    name?: boolean | number
    /** Indicates how many products available for this filter. */
    productCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface BrandSearchFilterItemConnectionGenqlSelection{
    /** A list of edges. */
    edges?: BrandSearchFilterItemEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface BrandSearchFilterItemEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: BrandSearchFilterItemGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Breadcrumb */
export interface BreadcrumbGenqlSelection{
    /** Category id. */
    entityId?: boolean | number
    /** Name of the category. */
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface BreadcrumbConnectionGenqlSelection{
    /** A list of edges. */
    edges?: BreadcrumbEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface BreadcrumbEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: BreadcrumbGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Bulk pricing tier that sets a fixed price for the product or variant. */
export interface BulkPricingFixedPriceDiscountGenqlSelection{
    /** Maximum item quantity that applies to this bulk pricing tier - if not defined then the tier does not have an upper bound. */
    maximumQuantity?: boolean | number
    /** Minimum item quantity that applies to this bulk pricing tier. */
    minimumQuantity?: boolean | number
    /** This price will override the current product price. */
    price?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Bulk pricing tier that reduces the price of the product or variant by a percentage. */
export interface BulkPricingPercentageDiscountGenqlSelection{
    /** Maximum item quantity that applies to this bulk pricing tier - if not defined then the tier does not have an upper bound. */
    maximumQuantity?: boolean | number
    /** Minimum item quantity that applies to this bulk pricing tier. */
    minimumQuantity?: boolean | number
    /** The percentage that will be removed from the product price. */
    percentOff?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Bulk pricing tier that will subtract an amount from the price of the product or variant. */
export interface BulkPricingRelativePriceDiscountGenqlSelection{
    /** Maximum item quantity that applies to this bulk pricing tier - if not defined then the tier does not have an upper bound. */
    maximumQuantity?: boolean | number
    /** Minimum item quantity that applies to this bulk pricing tier. */
    minimumQuantity?: boolean | number
    /** The price of the product/variant will be reduced by this priceAdjustment. */
    priceAdjustment?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A set of bulk pricing tiers that define price discounts which apply when purchasing specified quantities of a product or variant. */
export interface BulkPricingTierGenqlSelection{
    /** Maximum item quantity that applies to this bulk pricing tier - if not defined then the tier does not have an upper bound. */
    maximumQuantity?: boolean | number
    /** Minimum item quantity that applies to this bulk pricing tier. */
    minimumQuantity?: boolean | number
    on_BulkPricingFixedPriceDiscount?: BulkPricingFixedPriceDiscountGenqlSelection
    on_BulkPricingPercentageDiscount?: BulkPricingPercentageDiscountGenqlSelection
    on_BulkPricingRelativePriceDiscount?: BulkPricingRelativePriceDiscountGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A cart */
export interface CartGenqlSelection{
    /** Sum of line-items amounts, minus cart-level discounts and coupons. This amount includes taxes (where applicable). */
    amount?: MoneyGenqlSelection
    /** Cost of cart's contents, before applying discounts. */
    baseAmount?: MoneyGenqlSelection
    /** Time when the cart was created. */
    createdAt?: DateTimeExtendedGenqlSelection
    /** ISO-4217 currency code. */
    currencyCode?: boolean | number
    /** Discounted amount. */
    discountedAmount?: MoneyGenqlSelection
    /** List of discounts applied to this cart. */
    discounts?: CartDiscountGenqlSelection
    /** Cart ID. */
    entityId?: boolean | number
    /** The ID of an object */
    id?: boolean | number
    /** Whether this item is taxable. */
    isTaxIncluded?: boolean | number
    /** List of line items. */
    lineItems?: CartLineItemsGenqlSelection
    /** Locale of the cart. */
    locale?: boolean | number
    /** Time when the cart was last updated. */
    updatedAt?: DateTimeExtendedGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Cart custom item. */
export interface CartCustomItemGenqlSelection{
    /** ID of the custom item. */
    entityId?: boolean | number
    /** Item's list price multiplied by the quantity. */
    extendedListPrice?: MoneyGenqlSelection
    /** Price of the item. With or without tax depending on your stores set up. */
    listPrice?: MoneyGenqlSelection
    /** Custom item name. */
    name?: boolean | number
    /** Quantity of this item. */
    quantity?: boolean | number
    /** Custom item sku. */
    sku?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Cart digital item. */
export interface CartDigitalItemGenqlSelection{
    /** The product brand. */
    brand?: boolean | number
    /** The total value of all coupons applied to this item. */
    couponAmount?: MoneyGenqlSelection
    /** The total value of all discounts applied to this item (excluding coupon). */
    discountedAmount?: MoneyGenqlSelection
    /** List of discounts applied to this item. */
    discounts?: CartDiscountGenqlSelection
    /** The line-item ID. */
    entityId?: boolean | number
    /** Item's list price multiplied by the quantity. */
    extendedListPrice?: MoneyGenqlSelection
    /** Item's sale price multiplied by the quantity. */
    extendedSalePrice?: MoneyGenqlSelection
    /** URL of an image of this item, accessible on the internet. */
    imageUrl?: boolean | number
    /** Whether the item is taxable. */
    isTaxable?: boolean | number
    /** The net item price before discounts and coupons. It is based on the product default price or sale price (if set) configured in BigCommerce Admin. */
    listPrice?: MoneyGenqlSelection
    /** The item's product name. */
    name?: boolean | number
    /** An item’s original price is the same as the product default price in the admin panel. */
    originalPrice?: MoneyGenqlSelection
    /** The product is part of a bundle such as a product pick list, then the parentId or the main product id will populate. */
    parentEntityId?: boolean | number
    /** ID of the product. */
    productEntityId?: boolean | number
    /** Quantity of this item. */
    quantity?: boolean | number
    /** Item's price after all discounts are applied. (The final price before tax calculation). */
    salePrice?: MoneyGenqlSelection
    /** The list of selected options for this product. */
    selectedOptions?: CartSelectedOptionGenqlSelection
    /** SKU of the variant. */
    sku?: boolean | number
    /** The product URL. */
    url?: boolean | number
    /** ID of the variant. */
    variantEntityId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Discount applied to the cart. */
export interface CartDiscountGenqlSelection{
    /** The discounted amount applied within a given context. */
    discountedAmount?: MoneyGenqlSelection
    /** ID of the applied discount. */
    entityId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Cart gift certificate */
export interface CartGiftCertificateGenqlSelection{
    /** Value must be between 1.00 and 1,000.00 in the store's default currency. */
    amount?: MoneyGenqlSelection
    /** ID of this gift certificate. */
    entityId?: boolean | number
    /** Whether or not the gift certificate is taxable. */
    isTaxable?: boolean | number
    /** Message that will be sent to the gift certificate's recipient. Limited to 200 characters. */
    message?: boolean | number
    /** GiftCertificate-provided name that will appear in the control panel. */
    name?: boolean | number
    /** Recipient of the gift certificate. */
    recipient?: CartGiftCertificateRecipientGenqlSelection
    /** Sender of the gift certificate. */
    sender?: CartGiftCertificateSenderGenqlSelection
    /** Currently supports Birthday, Boy, Celebration, Christmas, General, and Girl. */
    theme?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Cart gift certificate input object */
export interface CartGiftCertificateInput {
/** Value must be between 1.00 and 1,000.00 in the store's default currency. */
amount?: Scalars['BigDecimal'],
/** Message that will be sent to the gift certificate's recipient. Limited to 200 characters. */
message?: (Scalars['String'] | null),
/** GiftCertificate-provided name that will appear in the control panel. */
name?: Scalars['String'],
/** The total number of certificates */
quantity?: Scalars['Int'],
/** Recipient of the gift certificate. */
recipient?: CartGiftCertificateRecipientInput,
/** Sender of the gift certificate. */
sender?: CartGiftCertificateSenderInput,
/** Currently supports Birthday, Boy, Celebration, Christmas, General, and Girl. */
theme?: CartGiftCertificateTheme}


/** Cart gift certificate recipient */
export interface CartGiftCertificateRecipientGenqlSelection{
    /** Contact's email address. */
    email?: boolean | number
    /** Contact's name. */
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Cart gift certificate recipient input object */
export interface CartGiftCertificateRecipientInput {
/** Contact's email address. */
email?: Scalars['String'],
/** Contact's name. */
name?: Scalars['String']}


/** Cart gift certificate sender */
export interface CartGiftCertificateSenderGenqlSelection{
    /** Contact's email address. */
    email?: boolean | number
    /** Contact's name. */
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Cart gift certificate sender input object */
export interface CartGiftCertificateSenderInput {
/** Contact's email address. */
email?: Scalars['String'],
/** Contact's name. */
name?: Scalars['String']}


/** Gift wrapping for the item */
export interface CartGiftWrappingGenqlSelection{
    /** Gift-wrapping price per product. */
    amount?: MoneyGenqlSelection
    /** Custom gift message along with items wrapped in this wrapping option. */
    message?: boolean | number
    /** Name of the gift-wrapping option. */
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Cart line item input object */
export interface CartLineItemInput {
/** The product id */
productEntityId?: Scalars['Int'],
/** Total number of line items. */
quantity?: Scalars['Int'],
/** The list of selected options for this item. */
selectedOptions?: (CartSelectedOptionsInput | null),
/** The variant id */
variantEntityId?: (Scalars['Int'] | null)}


/** Cart line items */
export interface CartLineItemsGenqlSelection{
    /** List of custom items. */
    customItems?: CartCustomItemGenqlSelection
    /** List of digital items. */
    digitalItems?: CartDigitalItemGenqlSelection
    /** List of gift certificates. */
    giftCertificates?: CartGiftCertificateGenqlSelection
    /** List of physical items. */
    physicalItems?: CartPhysicalItemGenqlSelection
    /** Total number of line items. */
    totalQuantity?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Cart mutations */
export interface CartMutationsGenqlSelection{
    /** Adds line item(s) to the cart. */
    addCartLineItems?: (AddCartLineItemsResultGenqlSelection & { __args: {
    /** Add cart line items input object */
    input: AddCartLineItemsInput} })
    /** Assign cart to the customer. */
    assignCartToCustomer?: (AssignCartToCustomerResultGenqlSelection & { __args: {
    /** Assign cart to the customer input object. */
    input: AssignCartToCustomerInput} })
    /** Creates a cart and generates a cart ID. */
    createCart?: (CreateCartResultGenqlSelection & { __args: {
    /** Create cart input object */
    input: CreateCartInput} })
    /** Deletes a Cart. */
    deleteCart?: (DeleteCartResultGenqlSelection & { __args: {
    /** Delete cart input object */
    input: DeleteCartInput} })
    /** Delete line item in the cart. Removing the last line item in the Cart deletes the Cart. */
    deleteCartLineItem?: (DeleteCartLineItemResultGenqlSelection & { __args: {
    /** Delete cart line item input object */
    input: DeleteCartLineItemInput} })
    /** Unassign cart from the customer. */
    unassignCartFromCustomer?: (UnassignCartFromCustomerResultGenqlSelection & { __args: {
    /** Unassign cart from the customer input object. */
    input: UnassignCartFromCustomerInput} })
    /** Update currency of the cart. */
    updateCartCurrency?: (UpdateCartCurrencyResultGenqlSelection & { __args: {
    /** Update cart currency input object */
    input: UpdateCartCurrencyInput} })
    /** Updates line item in the cart. */
    updateCartLineItem?: (UpdateCartLineItemResultGenqlSelection & { __args: {
    /** Update cart line item input object */
    input: UpdateCartLineItemInput} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Cart physical item. */
export interface CartPhysicalItemGenqlSelection{
    /** The product brand. */
    brand?: boolean | number
    /** The total value of all coupons applied to this item. */
    couponAmount?: MoneyGenqlSelection
    /** The total value of all discounts applied to this item (excluding coupon). */
    discountedAmount?: MoneyGenqlSelection
    /** List of discounts applied to this item. */
    discounts?: CartDiscountGenqlSelection
    /** The line-item ID. */
    entityId?: boolean | number
    /** Item's list price multiplied by the quantity. */
    extendedListPrice?: MoneyGenqlSelection
    /** Item's sale price multiplied by the quantity. */
    extendedSalePrice?: MoneyGenqlSelection
    /** Gift wrapping for this item. */
    giftWrapping?: CartGiftWrappingGenqlSelection
    /** URL of an image of this item, accessible on the internet. */
    imageUrl?: boolean | number
    /** Whether this item requires shipping to a physical address. */
    isShippingRequired?: boolean | number
    /** Whether the item is taxable. */
    isTaxable?: boolean | number
    /** The net item price before discounts and coupons. It is based on the product default price or sale price (if set) configured in BigCommerce Admin. */
    listPrice?: MoneyGenqlSelection
    /** The item's product name. */
    name?: boolean | number
    /** An item’s original price is the same as the product default price in the admin panel. */
    originalPrice?: MoneyGenqlSelection
    /** The product is part of a bundle such as a product pick list, then the parentId or the main product id will populate. */
    parentEntityId?: boolean | number
    /** ID of the product. */
    productEntityId?: boolean | number
    /** Quantity of this item. */
    quantity?: boolean | number
    /** Item's price after all discounts are applied. (The final price before tax calculation). */
    salePrice?: MoneyGenqlSelection
    /** The list of selected options for this item. */
    selectedOptions?: CartSelectedOptionGenqlSelection
    /** SKU of the variant. */
    sku?: boolean | number
    /** The product URL. */
    url?: boolean | number
    /** ID of the variant. */
    variantEntityId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Selected checkbox option. */
export interface CartSelectedCheckboxOptionGenqlSelection{
    /** The product option ID. */
    entityId?: boolean | number
    /** The product option name. */
    name?: boolean | number
    /** The product option value. */
    value?: boolean | number
    /** The product option value ID. */
    valueEntityId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Cart selected checkbox option input object */
export interface CartSelectedCheckboxOptionInput {
/** The product option ID. */
optionEntityId?: Scalars['Int'],
/** The product option value ID. */
optionValueEntityId?: Scalars['Int']}


/** Selected date field option. */
export interface CartSelectedDateFieldOptionGenqlSelection{
    /** Date value. */
    date?: DateTimeExtendedGenqlSelection
    /** The product option ID. */
    entityId?: boolean | number
    /** The product option name. */
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Cart selected date field option input object */
export interface CartSelectedDateFieldOptionInput {
/** Date value. */
date?: Scalars['DateTime'],
/** The product option ID. */
optionEntityId?: Scalars['Int']}


/** Selected file upload option. */
export interface CartSelectedFileUploadOptionGenqlSelection{
    /** The product option ID. */
    entityId?: boolean | number
    /** Uploaded file name. */
    fileName?: boolean | number
    /** The product option name. */
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Selected multi-line text field option. */
export interface CartSelectedMultiLineTextFieldOptionGenqlSelection{
    /** The product option ID. */
    entityId?: boolean | number
    /** The product option name. */
    name?: boolean | number
    /** Text value. */
    text?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Cart selected multiple line text field option input object */
export interface CartSelectedMultiLineTextFieldOptionInput {
/** The product option ID. */
optionEntityId?: Scalars['Int'],
/** Text value. */
text?: Scalars['String']}


/** Selected multiple choice option. */
export interface CartSelectedMultipleChoiceOptionGenqlSelection{
    /** The product option ID. */
    entityId?: boolean | number
    /** The product option name. */
    name?: boolean | number
    /** The product option value. */
    value?: boolean | number
    /** The product option value ID. */
    valueEntityId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Cart selected multiple choice option input object */
export interface CartSelectedMultipleChoiceOptionInput {
/** The product option ID. */
optionEntityId?: Scalars['Int'],
/** The product option value ID. */
optionValueEntityId?: Scalars['Int']}


/** Selected number field option. */
export interface CartSelectedNumberFieldOptionGenqlSelection{
    /** The product option ID. */
    entityId?: boolean | number
    /** The product option name. */
    name?: boolean | number
    /** Number value. */
    number?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Cart selected number field option input object */
export interface CartSelectedNumberFieldOptionInput {
/** Number value. */
number?: Scalars['Float'],
/** The product option ID. */
optionEntityId?: Scalars['Int']}


/** Selected option for the item. */
export interface CartSelectedOptionGenqlSelection{
    /** The product option ID. */
    entityId?: boolean | number
    /** The product option name. */
    name?: boolean | number
    on_CartSelectedCheckboxOption?: CartSelectedCheckboxOptionGenqlSelection
    on_CartSelectedDateFieldOption?: CartSelectedDateFieldOptionGenqlSelection
    on_CartSelectedFileUploadOption?: CartSelectedFileUploadOptionGenqlSelection
    on_CartSelectedMultiLineTextFieldOption?: CartSelectedMultiLineTextFieldOptionGenqlSelection
    on_CartSelectedMultipleChoiceOption?: CartSelectedMultipleChoiceOptionGenqlSelection
    on_CartSelectedNumberFieldOption?: CartSelectedNumberFieldOptionGenqlSelection
    on_CartSelectedTextFieldOption?: CartSelectedTextFieldOptionGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Selected product options. */
export interface CartSelectedOptionsInput {
/** List of selected checkbox options. */
checkboxes?: (CartSelectedCheckboxOptionInput[] | null),
/** List of selected date field options. */
dateFields?: (CartSelectedDateFieldOptionInput[] | null),
/** List of selected multi-line text field options. */
multiLineTextFields?: (CartSelectedMultiLineTextFieldOptionInput[] | null),
/** List of selected multiple choice options. */
multipleChoices?: (CartSelectedMultipleChoiceOptionInput[] | null),
/** List of selected number field options. */
numberFields?: (CartSelectedNumberFieldOptionInput[] | null),
/** List of selected text field options. */
textFields?: (CartSelectedTextFieldOptionInput[] | null)}


/** Selected text field option. */
export interface CartSelectedTextFieldOptionGenqlSelection{
    /** The product option ID. */
    entityId?: boolean | number
    /** The product option name. */
    name?: boolean | number
    /** Text value. */
    text?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Cart selected multiple line text field option input object */
export interface CartSelectedTextFieldOptionInput {
/** The product option ID. */
optionEntityId?: Scalars['Int'],
/** TODO */
text?: Scalars['String']}


/** Storefront catalog settings. */
export interface CatalogGenqlSelection{
    /** Product comparisons enabled. */
    productComparisonsEnabled?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Product Option */
export interface CatalogProductOptionGenqlSelection{
    /** Display name for the option. */
    displayName?: boolean | number
    /** Unique ID for the option. */
    entityId?: boolean | number
    /** One of the option values is required to be selected for the checkout. */
    isRequired?: boolean | number
    /** Indicates whether it is a variant option or modifier. */
    isVariantOption?: boolean | number
    on_CheckboxOption?: CheckboxOptionGenqlSelection
    on_DateFieldOption?: DateFieldOptionGenqlSelection
    on_FileUploadFieldOption?: FileUploadFieldOptionGenqlSelection
    on_MultiLineTextFieldOption?: MultiLineTextFieldOptionGenqlSelection
    on_MultipleChoiceOption?: MultipleChoiceOptionGenqlSelection
    on_NumberFieldOption?: NumberFieldOptionGenqlSelection
    on_TextFieldOption?: TextFieldOptionGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Product Option Value */
export interface CatalogProductOptionValueGenqlSelection{
    /** Unique ID for the option value. */
    entityId?: boolean | number
    /** Indicates whether this value is the chosen default selected value. */
    isDefault?: boolean | number
    /** Indicates whether this value is selected based on sku/variantEntityId/optionValueIds overlay requested on the product node level. */
    isSelected?: boolean | number
    /** Label for the option value. */
    label?: boolean | number
    on_MultipleChoiceOptionValue?: MultipleChoiceOptionValueGenqlSelection
    on_ProductPickListOptionValue?: ProductPickListOptionValueGenqlSelection
    on_SwatchOptionValue?: SwatchOptionValueGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Category */
export interface CategoryGenqlSelection{
    /** Category breadcrumbs. */
    breadcrumbs?: (BreadcrumbConnectionGenqlSelection & { __args: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), 
    /** The depth of the breadcrumbs. */
    depth: Scalars['Int'], first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** Default image for the category. */
    defaultImage?: ImageGenqlSelection
    /** Category default product sort. */
    defaultProductSort?: boolean | number
    /** Category description. */
    description?: boolean | number
    /** Unique ID for the category. */
    entityId?: boolean | number
    /** The ID of an object */
    id?: boolean | number
    /** Metafield data related to a category. */
    metafields?: (MetafieldConnectionGenqlSelection & { __args: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), 
    /** Labels for identifying metafield data values. */
    keys?: (Scalars['String'][] | null), last?: (Scalars['Int'] | null), 
    /** Metafield namespace filter */
    namespace: Scalars['String']} })
    /** Category name. */
    name?: boolean | number
    /** Category path. */
    path?: boolean | number
    /** List of products associated with category */
    products?: (ProductConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), 
    /** When set to True, hides products which are out of stock. Defaults to False. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
    hideOutOfStock?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null), 
    /** Product sorting by categories. */
    sortBy?: (CategoryProductSort | null)} })
    /** Category SEO details. */
    seo?: SeoDetailsGenqlSelection
    /**
     * @deprecated Alpha version. Do not use in production.
     * Category shop by price money ranges.
     */
    shopByPriceRanges?: (ShopByPriceConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), 
    /** Please select a currency */
    currencyCode?: (currencyCode | null), first?: (Scalars['Int'] | null), 
    /** Tax will be included if enabled */
    includeTax?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface CategoryConnectionGenqlSelection{
    /** A list of edges. */
    edges?: CategoryEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface CategoryEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: CategoryGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface CategoryPageBannerConnectionGenqlSelection{
    /** A list of edges. */
    edges?: CategoryPageBannerEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface CategoryPageBannerEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: BannerGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Category Filter */
export interface CategorySearchFilterGenqlSelection{
    /** List of available categories. */
    categories?: (CategorySearchFilterItemConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** Indicates whether to display product count next to the filter. */
    displayProductCount?: boolean | number
    /** Indicates whether filter is collapsed by default. */
    isCollapsedByDefault?: boolean | number
    /** Display name for the filter. */
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Specific category filter item */
export interface CategorySearchFilterItemGenqlSelection{
    /** Category ID. */
    entityId?: boolean | number
    /** Indicates whether category is selected. */
    isSelected?: boolean | number
    /** Category name. */
    name?: boolean | number
    /** Indicates how many products available for this filter. */
    productCount?: boolean | number
    /** List of available sub-categories. */
    subCategories?: (SubCategorySearchFilterItemConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface CategorySearchFilterItemConnectionGenqlSelection{
    /** A list of edges. */
    edges?: CategorySearchFilterItemEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface CategorySearchFilterItemEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: CategorySearchFilterItemGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An item in a tree of categories. */
export interface CategoryTreeItemGenqlSelection{
    /** Subcategories of this category */
    children?: CategoryTreeItemGenqlSelection
    /** The description of this category. */
    description?: boolean | number
    /** The id category. */
    entityId?: boolean | number
    /** If a category has children. */
    hasChildren?: boolean | number
    /** The category image. */
    image?: ImageGenqlSelection
    /** The name of category. */
    name?: boolean | number
    /** Path assigned to this category */
    path?: boolean | number
    /** The number of products in this category. */
    productCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The Channel */
export interface ChannelGenqlSelection{
    /** The ID of the channel. */
    entityId?: boolean | number
    /** Metafield data related to a channel. */
    metafields?: (MetafieldConnectionGenqlSelection & { __args: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), 
    /** Labels for identifying metafield data values. */
    keys?: (Scalars['String'][] | null), last?: (Scalars['Int'] | null), 
    /** Metafield namespace filter */
    namespace: Scalars['String']} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A simple yes/no question represented by a checkbox. */
export interface CheckboxOptionGenqlSelection{
    /** Indicates the default checked status. */
    checkedByDefault?: boolean | number
    /** Display name for the option. */
    displayName?: boolean | number
    /** Unique ID for the option. */
    entityId?: boolean | number
    /** One of the option values is required to be selected for the checkout. */
    isRequired?: boolean | number
    /** Indicates whether it is a variant option or modifier. */
    isVariantOption?: boolean | number
    /** Label of the checkbox option. */
    label?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Checkout settings. */
export interface CheckoutSettingsGenqlSelection{
    /** Indicates whether ReCaptcha is enabled on checkout. */
    reCaptchaEnabled?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Additional information about the collection. */
export interface CollectionInfoGenqlSelection{
    /** Total items in the collection despite pagination. */
    totalItems?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Contact field */
export interface ContactFieldGenqlSelection{
    /** Store address line. */
    address?: boolean | number
    /** Store address type. */
    addressType?: boolean | number
    /** Store country. */
    country?: boolean | number
    /** Store email. */
    email?: boolean | number
    /** Store phone number. */
    phone?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A contact page. */
export interface ContactPageGenqlSelection{
    /** The contact fields that should be used on the page. */
    contactFields?: boolean | number
    /** Unique ID for the web page. */
    entityId?: boolean | number
    /** The body of the page. */
    htmlBody?: boolean | number
    /** The ID of an object */
    id?: boolean | number
    /** Whether or not the page should be visible in the navigation menu. */
    isVisibleInNavigation?: boolean | number
    /** Page name. */
    name?: boolean | number
    /** Unique ID for the parent page. */
    parentEntityId?: boolean | number
    /** The URL path of the page. */
    path?: boolean | number
    /** The plain text summary of the page body. */
    plainTextSummary?: { __args: {
    /** The max number of characters for the plain text summary. */
    characterLimit?: (Scalars['Int'] | null)} } | boolean | number
    /** The rendered regions for the web page. */
    renderedRegions?: RenderedRegionsByPageTypeGenqlSelection
    /** Page SEO details. */
    seo?: SeoDetailsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The page content. */
export interface ContentGenqlSelection{
    /** Banners details. */
    banners?: BannersGenqlSelection
    /** Blog details. */
    blog?: BlogGenqlSelection
    /** Page details. */
    page?: (WebPageGenqlSelection & { __args: {
    /** Id of the page to fetch. */
    entityId: Scalars['Int']} })
    /** Details of the pages. */
    pages?: (PageConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), 
    /** Filters for querying web pages */
    filters?: (WebPagesFiltersInput | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** The rendered regions by specific page. */
    renderedRegionsByPageType?: (RenderedRegionsByPageTypeGenqlSelection & { __args: {
    /** Rendered regions filter by page type. */
    pageType: PageType} })
    /** The rendered regions by specific page and id. */
    renderedRegionsByPageTypeAndEntityId?: (RenderedRegionsByPageTypeGenqlSelection & { __args: {
    /** Rendered regions filter by id. */
    entityId: Scalars['Long'], 
    /** Rendered regions filter by page type and id. */
    entityPageType: EntityPageType} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Create cart input object */
export interface CreateCartInput {
/** ISO-4217 currency code */
currencyCode?: (Scalars['String'] | null),
/** List of gift certificates */
giftCertificates?: (CartGiftCertificateInput[] | null),
/** List of cart line items */
lineItems?: (CartLineItemInput[] | null),
/** Locale of the cart */
locale?: (Scalars['String'] | null)}


/** Create cart result */
export interface CreateCartResultGenqlSelection{
    /** The Cart that is created as a result of mutation. */
    cart?: CartGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Create wishlist input object */
export interface CreateWishlistInput {
/** A wishlist visibility mode */
isPublic?: Scalars['Boolean'],
/** A wishlist items */
items?: (WishlistItemInput[] | null),
/** A wishlist name */
name?: Scalars['String']}


/** Create wishlist */
export interface CreateWishlistResultGenqlSelection{
    /** The newly created wishlist */
    result?: WishlistGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Currency details. */
export interface CurrencyGenqlSelection{
    /** Currency code. */
    code?: boolean | number
    /** Currency display settings. */
    display?: CurrencyDisplayGenqlSelection
    /** Currency ID. */
    entityId?: boolean | number
    /** Exchange rate relative to default currency. */
    exchangeRate?: boolean | number
    /** Flag image URL. */
    flagImage?: boolean | number
    /** Indicates whether this currency is active. */
    isActive?: boolean | number
    /** Indicates whether this currency is transactional. */
    isTransactional?: boolean | number
    /** Currency name. */
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface CurrencyConnectionGenqlSelection{
    /** A list of edges. */
    edges?: CurrencyEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Currency display settings. */
export interface CurrencyDisplayGenqlSelection{
    /** Currency decimal places. */
    decimalPlaces?: boolean | number
    /** Currency decimal token. */
    decimalToken?: boolean | number
    /** Currency symbol. */
    symbol?: boolean | number
    /** Currency symbol. */
    symbolPlacement?: boolean | number
    /** Currency thousands token. */
    thousandsToken?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface CurrencyEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: CurrencyGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Custom field */
export interface CustomFieldGenqlSelection{
    /** Custom field id. */
    entityId?: boolean | number
    /** Name of the custom field. */
    name?: boolean | number
    /** Value of the custom field. */
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface CustomFieldConnectionGenqlSelection{
    /** A list of edges. */
    edges?: CustomFieldEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface CustomFieldEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: CustomFieldGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A customer that shops on a store */
export interface CustomerGenqlSelection{
    /** Customer addresses count. */
    addressCount?: boolean | number
    /** Customer attributes count. */
    attributeCount?: boolean | number
    /** Customer attributes. */
    attributes?: CustomerAttributesGenqlSelection
    /** The company name of the customer. */
    company?: boolean | number
    /** The customer group id of the customer. */
    customerGroupId?: boolean | number
    /** The email address of the customer. */
    email?: boolean | number
    /** The ID of the customer. */
    entityId?: boolean | number
    /** The first name of the customer. */
    firstName?: boolean | number
    /** The last name of the customer. */
    lastName?: boolean | number
    /** The notes of the customer. */
    notes?: boolean | number
    /** The phone number of the customer. */
    phone?: boolean | number
    /** Customer store credit. */
    storeCredit?: MoneyGenqlSelection
    /** The tax exempt category of the customer. */
    taxExemptCategory?: boolean | number
    /** Customer wishlists. */
    wishlists?: (WishlistConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), 
    /** Wishlist filters input */
    filters?: (WishlistFiltersInput | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A custom, store-specific attribute for a customer */
export interface CustomerAttributeGenqlSelection{
    /** The ID of the custom customer attribute */
    entityId?: boolean | number
    /** The name of the custom customer attribute */
    name?: boolean | number
    /** The value of the custom customer attribute */
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Custom, store-specific customer attributes */
export interface CustomerAttributesGenqlSelection{
    /** A custom, store-specific attribute for a customer */
    attribute?: (CustomerAttributeGenqlSelection & { __args: {
    /** The ID of the customer attribute */
    entityId: Scalars['Int']} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A calendar for allowing selection of a date. */
export interface DateFieldOptionGenqlSelection{
    /** The default timestamp of date option. */
    defaultValue?: boolean | number
    /** Display name for the option. */
    displayName?: boolean | number
    /** The earliest timestamp of date option. */
    earliest?: boolean | number
    /** Unique ID for the option. */
    entityId?: boolean | number
    /** One of the option values is required to be selected for the checkout. */
    isRequired?: boolean | number
    /** Indicates whether it is a variant option or modifier. */
    isVariantOption?: boolean | number
    /** The latest timestamp of date option. */
    latest?: boolean | number
    /** Limit date by */
    limitDateBy?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Date Time Extended */
export interface DateTimeExtendedGenqlSelection{
    /** ISO-8601 formatted date in UTC */
    utc?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Delete cart input object */
export interface DeleteCartInput {
/** The cart id */
cartEntityId?: Scalars['String']}


/** Delete cart line item input object */
export interface DeleteCartLineItemInput {
/** The cart id */
cartEntityId?: Scalars['String'],
/** The line item id */
lineItemEntityId?: Scalars['String']}


/** Delete cart lien item result */
export interface DeleteCartLineItemResultGenqlSelection{
    /** The Cart that is updated as a result of mutation. */
    cart?: CartGenqlSelection
    /** The ID of the Cart if it is deleted as a result of mutation. */
    deletedCartEntityId?: boolean | number
    /** The ID of the line item that is deleted as a result of mutation. */
    deletedLineItemEntityId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Delete cart result */
export interface DeleteCartResultGenqlSelection{
    /** The ID of the Cart that is deleted as a result of mutation. */
    deletedCartEntityId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Delete wishlist items input object */
export interface DeleteWishlistItemsInput {
/** The wishlist id */
entityId?: Scalars['Int'],
/** The wishlist item ids */
itemEntityIds?: Scalars['Int'][]}


/** Delete wishlist items */
export interface DeleteWishlistItemsResultGenqlSelection{
    /** The wishlist */
    result?: WishlistGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Delete wishlist */
export interface DeleteWishlistResultGenqlSelection{
    /** The result of the operation */
    result?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Delete wishlists input object */
export interface DeleteWishlistsInput {
/** The wishlist ids */
entityIds?: Scalars['Int'][]}


/** Display field */
export interface DisplayFieldGenqlSelection{
    /** Extended date format. */
    extendedDateFormat?: boolean | number
    /** Short date format. */
    shortDateFormat?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Distance */
export interface DistanceGenqlSelection{
    /** Length unit */
    lengthUnit?: boolean | number
    /** Distance in specified length unit */
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Filter locations by the distance */
export interface DistanceFilter {
/** Signed decimal degrees without compass direction */
latitude?: Scalars['Float'],
/** Length unit */
lengthUnit?: LengthUnit,
/** Signed decimal degrees without compass direction */
longitude?: Scalars['Float'],
/** Radius of search in length units specified in lengthUnit argument */
radius?: Scalars['Float']}


/** An external link page. */
export interface ExternalLinkPageGenqlSelection{
    /** Unique ID for the web page. */
    entityId?: boolean | number
    /** Whether or not the page should be visible in the navigation menu. */
    isVisibleInNavigation?: boolean | number
    /** The URL that the page links to. */
    link?: boolean | number
    /** Page name. */
    name?: boolean | number
    /** Unique ID for the parent page. */
    parentEntityId?: boolean | number
    /** Page SEO details. */
    seo?: SeoDetailsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A form allowing selection and uploading of a file from the user's local computer. */
export interface FileUploadFieldOptionGenqlSelection{
    /** Display name for the option. */
    displayName?: boolean | number
    /** Unique ID for the option. */
    entityId?: boolean | number
    /** All possible file extensions. Empty means that all files allowed. */
    fileTypes?: boolean | number
    /** One of the option values is required to be selected for the checkout. */
    isRequired?: boolean | number
    /** Indicates whether it is a variant option or modifier. */
    isVariantOption?: boolean | number
    /** The maximum size of the file in kilobytes */
    maxFileSize?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Gift wrapping for product */
export interface GiftWrappingGenqlSelection{
    /** Indicates whether commenting is allowed for the gift wrapping. */
    allowComments?: boolean | number
    /** Gift wrapping id. */
    entityId?: boolean | number
    /** Gift wrapping name. */
    name?: boolean | number
    /** Gift wrapping preview image url. */
    previewImageUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface GiftWrappingConnectionGenqlSelection{
    /** A list of edges. */
    edges?: GiftWrappingEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface GiftWrappingEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: GiftWrappingGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Image */
export interface ImageGenqlSelection{
    /** Text description of an image that can be used for SEO and/or accessibility purposes. */
    altText?: boolean | number
    /** Indicates whether this is the primary image. */
    isDefault?: boolean | number
    /** Absolute path to image using store CDN. */
    url?: { __args: {
    /** Desired height of the image. */
    height?: (Scalars['Int'] | null), 
    /** Desired width of the image. */
    width: Scalars['Int']} }
    /** Absolute path to original image using store CDN. */
    urlOriginal?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface ImageConnectionGenqlSelection{
    /** A list of edges. */
    edges?: ImageEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface ImageEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: ImageGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An inventory */
export interface InventoryGenqlSelection{
    /** Locations */
    locations?: (InventoryLocationConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), 
    /** Location cities filter */
    cities?: (Scalars['String'][] | null), 
    /** Location codes filter */
    codes?: (Scalars['String'][] | null), 
    /** Location country codes filter */
    countryCodes?: (countryCode[] | null), 
    /** Filter locations by the distance */
    distanceFilter?: (DistanceFilter | null), 
    /** Location ids filter */
    entityIds?: (Scalars['Int'][] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), 
    /** Location service type ids filter */
    serviceTypeIds?: (Scalars['String'][] | null), 
    /** Location states filter */
    states?: (Scalars['String'][] | null), 
    /** Location type ids filter */
    typeIds?: (Scalars['String'][] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Address */
export interface InventoryAddressGenqlSelection{
    /** Address line1. */
    address1?: boolean | number
    /** Address line2. */
    address2?: boolean | number
    /** Address city. */
    city?: boolean | number
    /** Address code. */
    code?: boolean | number
    /** Country code. */
    countryCode?: boolean | number
    /** Address description. */
    description?: boolean | number
    /** Address email. */
    email?: boolean | number
    /** Address id. */
    entityId?: boolean | number
    /** Address label. */
    label?: boolean | number
    /** Address latitude. */
    latitude?: boolean | number
    /** Address longitude. */
    longitude?: boolean | number
    /** Address phone. */
    phone?: boolean | number
    /** Address zip. */
    postalCode?: boolean | number
    /** Address state. */
    stateOrProvince?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Inventory By Locations */
export interface InventoryByLocationsGenqlSelection{
    /** Number of available products in stock. */
    availableToSell?: boolean | number
    /** Indicates whether this product is in stock. */
    isInStock?: boolean | number
    /** Distance between location and specified longitude and latitude */
    locationDistance?: DistanceGenqlSelection
    /** Location code. */
    locationEntityCode?: boolean | number
    /** Location id. */
    locationEntityId?: boolean | number
    /**
     * @deprecated Deprecated. Will be substituted with pickup methods.
     * Location service type ids.
     */
    locationEntityServiceTypeIds?: boolean | number
    /** Location type id. */
    locationEntityTypeId?: boolean | number
    /** Indicates a threshold low-stock level. */
    warningLevel?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Location */
export interface InventoryLocationGenqlSelection{
    /** Location address */
    address?: InventoryAddressGenqlSelection
    /**
     * @deprecated Deprecated. Use specialHours instead
     * Upcoming events
     */
    blackoutHours?: SpecialHourGenqlSelection
    /** Location code. */
    code?: boolean | number
    /** Location description. */
    description?: boolean | number
    /** Distance between location and specified longitude and latitude */
    distance?: DistanceGenqlSelection
    /** Location id. */
    entityId?: boolean | number
    /** Location label. */
    label?: boolean | number
    /** Metafield data related to a location. */
    metafields?: (MetafieldConnectionGenqlSelection & { __args: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), 
    /** Labels for identifying metafield data values. */
    keys?: (Scalars['String'][] | null), last?: (Scalars['Int'] | null), 
    /** Metafield namespace filter */
    namespace: Scalars['String']} })
    /** Location OperatingHours */
    operatingHours?: OperatingHoursGenqlSelection
    /**
     * @deprecated Deprecated. Will be substituted with pickup methods.
     * Location service type ids.
     */
    serviceTypeIds?: boolean | number
    /** Upcoming events */
    specialHours?: SpecialHourGenqlSelection
    /** Time zone of location */
    timeZone?: boolean | number
    /** Location type id. */
    typeId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface InventoryLocationConnectionGenqlSelection{
    /** A list of edges. */
    edges?: InventoryLocationEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface InventoryLocationEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: InventoryLocationGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Inventory settings from control panel. */
export interface InventorySettingsGenqlSelection{
    /** Out of stock message. */
    defaultOutOfStockMessage?: boolean | number
    /** Flag to show or not on product filtering when option is out of stock */
    hideInProductFiltering?: boolean | number
    /** The option out of stock behavior. */
    optionOutOfStockBehavior?: boolean | number
    /** The product out of stock behavior. */
    productOutOfStockBehavior?: boolean | number
    /** Show out of stock message on product listing pages */
    showOutOfStockMessage?: boolean | number
    /** Show pre-order inventory */
    showPreOrderStockLevels?: boolean | number
    /** Hide or show inventory node for product */
    stockLevelDisplay?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface LocationConnectionGenqlSelection{
    /** A list of edges. */
    edges?: LocationEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface LocationEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: InventoryByLocationsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Login result */
export interface LoginResultGenqlSelection{
    /** The currently logged in customer. */
    customer?: CustomerGenqlSelection
    /**
     * @deprecated Use customer node instead.
     * The result of a login
     */
    result?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Logo field */
export interface LogoFieldGenqlSelection{
    /** Store logo image. */
    image?: ImageGenqlSelection
    /** Logo title. */
    title?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Logout result */
export interface LogoutResultGenqlSelection{
    /** The result of a logout */
    result?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Measurement */
export interface MeasurementGenqlSelection{
    /** Unit of measurement. */
    unit?: boolean | number
    /** Unformatted weight measurement value. */
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface MetafieldConnectionGenqlSelection{
    /** A list of edges. */
    edges?: MetafieldEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface MetafieldEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: MetafieldsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Key/Value pairs of data attached tied to a resource entity (product, brand, category, etc.) */
export interface MetafieldsGenqlSelection{
    /** The ID of the metafield when referencing via our backend API. */
    entityId?: boolean | number
    /** The ID of an object */
    id?: boolean | number
    /** A label for identifying a metafield data value. */
    key?: boolean | number
    /** A metafield value. */
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A money object - includes currency code and a money amount */
export interface MoneyGenqlSelection{
    /** Currency code of the current money. */
    currencyCode?: boolean | number
    /**
     * @deprecated Deprecated. Don't use - it will be removed soon.
     * The formatted currency string for the current money.
     */
    formatted?: boolean | number
    /** The amount of money. */
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A min and max pair of money objects */
export interface MoneyRangeGenqlSelection{
    /** Maximum money object. */
    max?: MoneyGenqlSelection
    /** Minimum money object. */
    min?: MoneyGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A multi-line text input field, aka a text box. */
export interface MultiLineTextFieldOptionGenqlSelection{
    /** Default value of the multiline text field option. */
    defaultValue?: boolean | number
    /** Display name for the option. */
    displayName?: boolean | number
    /** Unique ID for the option. */
    entityId?: boolean | number
    /** One of the option values is required to be selected for the checkout. */
    isRequired?: boolean | number
    /** Indicates whether it is a variant option or modifier. */
    isVariantOption?: boolean | number
    /** The maximum number of characters. */
    maxLength?: boolean | number
    /** The maximum number of lines. */
    maxLines?: boolean | number
    /** The minimum number of characters. */
    minLength?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An option type that has a fixed list of values. */
export interface MultipleChoiceOptionGenqlSelection{
    /** Display name for the option. */
    displayName?: boolean | number
    /** The chosen display style for this multiple choice option. */
    displayStyle?: boolean | number
    /** Unique ID for the option. */
    entityId?: boolean | number
    /** One of the option values is required to be selected for the checkout. */
    isRequired?: boolean | number
    /** Indicates whether it is a variant option or modifier. */
    isVariantOption?: boolean | number
    /** List of option values. */
    values?: (ProductOptionValueConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A simple multiple choice value comprised of an id and a label. */
export interface MultipleChoiceOptionValueGenqlSelection{
    /** Unique ID for the option value. */
    entityId?: boolean | number
    /** Indicates whether this value is the chosen default selected value. */
    isDefault?: boolean | number
    /** Indicates whether this value is selected based on sku/variantEntityId/optionValueIds overlay requested on the product node level. */
    isSelected?: boolean | number
    /** Label for the option value. */
    label?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface MutationGenqlSelection{
    /** The Cart mutations. */
    cart?: CartMutationsGenqlSelection
    /** Customer login */
    login?: (LoginResultGenqlSelection & { __args: {
    /** An email of the customer. */
    email: Scalars['String'], 
    /** A password of the customer. */
    password: Scalars['String']} })
    /** Customer logout */
    logout?: LogoutResultGenqlSelection
    /** The wishlist mutations. */
    wishlist?: WishlistMutationsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An object with an ID */
export interface NodeGenqlSelection{
    /** The id of the object. */
    id?: boolean | number
    on_Banner?: BannerGenqlSelection
    on_Blog?: BlogGenqlSelection
    on_BlogPost?: BlogPostGenqlSelection
    on_Brand?: BrandGenqlSelection
    on_Cart?: CartGenqlSelection
    on_Category?: CategoryGenqlSelection
    on_ContactPage?: ContactPageGenqlSelection
    on_NormalPage?: NormalPageGenqlSelection
    on_Product?: ProductGenqlSelection
    on_RawHtmlPage?: RawHtmlPageGenqlSelection
    on_Variant?: VariantGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A normal page. */
export interface NormalPageGenqlSelection{
    /** Unique ID for the web page. */
    entityId?: boolean | number
    /** The body of the page. */
    htmlBody?: boolean | number
    /** The ID of an object */
    id?: boolean | number
    /** Whether or not the page should be visible in the navigation menu. */
    isVisibleInNavigation?: boolean | number
    /** Page name. */
    name?: boolean | number
    /** Unique ID for the parent page. */
    parentEntityId?: boolean | number
    /** The URL path of the page. */
    path?: boolean | number
    /** The plain text summary of the page body. */
    plainTextSummary?: { __args: {
    /** The max number of characters for the plain text summary. */
    characterLimit?: (Scalars['Int'] | null)} } | boolean | number
    /** The rendered regions for the web page. */
    renderedRegions?: RenderedRegionsByPageTypeGenqlSelection
    /** Page SEO details. */
    seo?: SeoDetailsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A single line text input field that only accepts numbers. */
export interface NumberFieldOptionGenqlSelection{
    /** Default value of the text field option. */
    defaultValue?: boolean | number
    /** Display name for the option. */
    displayName?: boolean | number
    /** Unique ID for the option. */
    entityId?: boolean | number
    /** The top limit of possible numbers. */
    highest?: boolean | number
    /** Allow whole numbers only. */
    isIntegerOnly?: boolean | number
    /** One of the option values is required to be selected for the checkout. */
    isRequired?: boolean | number
    /** Indicates whether it is a variant option or modifier. */
    isVariantOption?: boolean | number
    /** Limit numbers by several options. */
    limitNumberBy?: boolean | number
    /** The bottom limit of possible numbers. */
    lowest?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Operating day */
export interface OperatingDayGenqlSelection{
    /** Closing. */
    closing?: boolean | number
    /** Open. */
    open?: boolean | number
    /** Opening. */
    opening?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Operating hours */
export interface OperatingHoursGenqlSelection{
    /** Friday. */
    friday?: OperatingDayGenqlSelection
    /** Monday. */
    monday?: OperatingDayGenqlSelection
    /** Saturday. */
    saturday?: OperatingDayGenqlSelection
    /** Sunday. */
    sunday?: OperatingDayGenqlSelection
    /** Thursday. */
    thursday?: OperatingDayGenqlSelection
    /** Tuesday. */
    tuesday?: OperatingDayGenqlSelection
    /** Wednesday. */
    wednesday?: OperatingDayGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface OptionConnectionGenqlSelection{
    /** A list of edges. */
    edges?: OptionEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface OptionEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: ProductOptionGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface OptionValueConnectionGenqlSelection{
    /** A list of edges. */
    edges?: OptionValueEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface OptionValueEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: ProductOptionValueGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A variant option value id input object */
export interface OptionValueId {
/** A variant option id filter */
optionEntityId?: Scalars['Int'],
/** A variant value id filter. */
valueEntityId?: Scalars['Int']}


/** Other Filter */
export interface OtherSearchFilterGenqlSelection{
    /** Indicates whether to display product count next to the filter. */
    displayProductCount?: boolean | number
    /** Free shipping filter. */
    freeShipping?: OtherSearchFilterItemGenqlSelection
    /** Indicates whether filter is collapsed by default. */
    isCollapsedByDefault?: boolean | number
    /** Is Featured filter. */
    isFeatured?: OtherSearchFilterItemGenqlSelection
    /** Is In Stock filter. */
    isInStock?: OtherSearchFilterItemGenqlSelection
    /** Display name for the filter. */
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Other Filter Item */
export interface OtherSearchFilterItemGenqlSelection{
    /** Indicates whether this filter is selected. */
    isSelected?: boolean | number
    /** Indicates how many products available for this filter. */
    productCount?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface PageConnectionGenqlSelection{
    /** A list of edges. */
    edges?: PageEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface PageEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: WebPageGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Information about pagination in a connection. */
export interface PageInfoGenqlSelection{
    /** When paginating forwards, the cursor to continue. */
    endCursor?: boolean | number
    /** When paginating forwards, are there more items? */
    hasNextPage?: boolean | number
    /** When paginating backwards, are there more items? */
    hasPreviousPage?: boolean | number
    /** When paginating backwards, the cursor to continue. */
    startCursor?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface PopularBrandConnectionGenqlSelection{
    /** A list of edges. */
    edges?: PopularBrandEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface PopularBrandEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: PopularBrandTypeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** PopularBrandType */
export interface PopularBrandTypeGenqlSelection{
    /** Brand count */
    count?: boolean | number
    /** Brand id */
    entityId?: boolean | number
    /** Brand name */
    name?: boolean | number
    /** Brand URL as a relative path */
    path?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The min and max range of prices that apply to this product. */
export interface PriceRangesGenqlSelection{
    /** Product price min/max range. */
    priceRange?: MoneyRangeGenqlSelection
    /** Product retail price min/max range. */
    retailPriceRange?: MoneyRangeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Price Filter */
export interface PriceSearchFilterGenqlSelection{
    /** Indicates whether filter is collapsed by default. */
    isCollapsedByDefault?: boolean | number
    /** Display name for the filter. */
    name?: boolean | number
    /** Selected price filters. */
    selected?: PriceSearchFilterItemGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Search by price range. At least a minPrice or maxPrice must be supplied. */
export interface PriceSearchFilterInput {
/** Maximum price of the product. */
maxPrice?: (Scalars['Float'] | null),
/** Minimum price of the product. */
minPrice?: (Scalars['Float'] | null)}


/** Price filter range */
export interface PriceSearchFilterItemGenqlSelection{
    /** Maximum price of the product. */
    maxPrice?: boolean | number
    /** Minimum price of the product. */
    minPrice?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The various prices that can be set on a product. */
export interface PricesGenqlSelection{
    /** Original price of the product. */
    basePrice?: MoneyGenqlSelection
    /** List of bulk pricing tiers applicable to a product or variant. */
    bulkPricing?: BulkPricingTierGenqlSelection
    /** Minimum advertised price of the product. */
    mapPrice?: MoneyGenqlSelection
    /** Calculated price of the product.  Calculated price takes into account basePrice, salePrice, rules (modifier, option, option set) that apply to the product configuration, and customer group discounts.  It represents the in-cart price for a product configuration without bulk pricing rules. */
    price?: MoneyGenqlSelection
    /** Product price min/max range. */
    priceRange?: MoneyRangeGenqlSelection
    /** Retail price of the product. */
    retailPrice?: MoneyGenqlSelection
    /** Product retail price min/max range. */
    retailPriceRange?: MoneyRangeGenqlSelection
    /** Sale price of the product. */
    salePrice?: MoneyGenqlSelection
    /** The difference between the retail price (MSRP) and the current price, which can be presented to the shopper as their savings. */
    saved?: MoneyGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Product */
export interface ProductGenqlSelection{
    /** Absolute URL path for adding a product to cart. */
    addToCartUrl?: boolean | number
    /**
     * @deprecated Deprecated.
     * Absolute URL path for adding a product to customer's wishlist.
     */
    addToWishlistUrl?: boolean | number
    /**
     * @deprecated Use status inside availabilityV2 instead.
     * The availability state of the product.
     */
    availability?: boolean | number
    /**
     * @deprecated Use description inside availabilityV2 instead.
     * A few words telling the customer how long it will normally take to ship this product, such as 'Usually ships in 24 hours'.
     */
    availabilityDescription?: boolean | number
    /** The availability state of the product. */
    availabilityV2?: ProductAvailabilityGenqlSelection
    /** Brand associated with the product. */
    brand?: BrandGenqlSelection
    /** List of categories associated with the product. */
    categories?: (CategoryConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** Product condition */
    condition?: boolean | number
    /**
     * @deprecated Alpha version. Do not use in production.
     * Product creation date
     */
    createdAt?: DateTimeExtendedGenqlSelection
    /** Custom fields of the product. */
    customFields?: (CustomFieldConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), 
    /** Product custom fields filter by names. */
    names?: (Scalars['String'][] | null)} })
    /** Default image for a product. */
    defaultImage?: ImageGenqlSelection
    /** Depth of the product. */
    depth?: MeasurementGenqlSelection
    /** Description of the product. */
    description?: boolean | number
    /** Id of the product. */
    entityId?: boolean | number
    /** Gift wrapping options available for the product. */
    giftWrappingOptions?: (GiftWrappingConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** Global trade item number. */
    gtin?: boolean | number
    /** Height of the product. */
    height?: MeasurementGenqlSelection
    /** The ID of an object */
    id?: boolean | number
    /** A list of the images for a product. */
    images?: (ImageConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** Inventory information of the product. */
    inventory?: ProductInventoryGenqlSelection
    /** Maximum purchasable quantity for this product in a single order. */
    maxPurchaseQuantity?: boolean | number
    /** Metafield data related to a product. */
    metafields?: (MetafieldConnectionGenqlSelection & { __args: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), 
    /** Labels for identifying metafield data values. */
    keys?: (Scalars['String'][] | null), last?: (Scalars['Int'] | null), 
    /** Metafield namespace filter */
    namespace: Scalars['String']} })
    /** Minimum purchasable quantity for this product in a single order. */
    minPurchaseQuantity?: boolean | number
    /** Manufacturer part number. */
    mpn?: boolean | number
    /** Name of the product. */
    name?: boolean | number
    /**
     * @deprecated Use productOptions instead.
     * Product options.
     */
    options?: (OptionConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** Relative URL path to product page. */
    path?: boolean | number
    /** Description of the product in plain text. */
    plainTextDescription?: { __args: {
    /** The max number of characters for the description. */
    characterLimit?: (Scalars['Int'] | null)} } | boolean | number
    /**
     * @deprecated Use priceRanges inside prices node instead.
     * The minimum and maximum price of this product based on variant pricing and/or modifier price rules.
     */
    priceRanges?: (PriceRangesGenqlSelection & { __args?: {
    /** Tax will be included if enabled */
    includeTax?: (Scalars['Boolean'] | null)} })
    /** Prices object determined by supplied product ID, variant ID, and selected option IDs. */
    prices?: (PricesGenqlSelection & { __args?: {
    /** Please select a currency */
    currencyCode?: (currencyCode | null), 
    /** Tax will be included if enabled */
    includeTax?: (Scalars['Boolean'] | null)} })
    /** Product options. */
    productOptions?: (ProductOptionConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** Related products for this product. */
    relatedProducts?: (RelatedProductsConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), 
    /** When set to True, hides products which are out of stock. Defaults to False. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
    hideOutOfStock?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null)} })
    /** Summary of the product reviews, includes the total number of reviews submitted and summation of the ratings on the reviews (ratings range from 0-5 per review). */
    reviewSummary?: ReviewsGenqlSelection
    /** Reviews associated with the product. */
    reviews?: (ReviewConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), 
    /** Product reviews filters. */
    filters?: (ProductReviewsFiltersInput | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), 
    /** Product reviews sorting. */
    sort?: (ProductReviewsSortInput | null)} })
    /** Product SEO details. */
    seo?: SeoDetailsGenqlSelection
    /** Whether or not the cart call to action should be visible for this product. */
    showCartAction?: boolean | number
    /** Default product variant when no options are selected. */
    sku?: boolean | number
    /** Type of product, ex: physical, digital */
    type?: boolean | number
    /** Universal product code. */
    upc?: boolean | number
    /** Variants associated with the product. */
    variants?: (VariantConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), 
    /** Ids of expected variants. */
    entityIds?: (Scalars['Int'][] | null), first?: (Scalars['Int'] | null), 
    /** Whether the product can be purchased */
    isPurchasable?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null), 
    /** A variant option value ids filter. */
    optionValueIds?: (OptionValueId[] | null)} })
    /** Warranty information of the product. */
    warranty?: boolean | number
    /** Weight of the product. */
    weight?: MeasurementGenqlSelection
    /** Width of the product. */
    width?: MeasurementGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Product Attribute Filter */
export interface ProductAttributeSearchFilterGenqlSelection{
    /** List of available product attributes. */
    attributes?: (ProductAttributeSearchFilterItemConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** Indicates whether to display product count next to the filter. */
    displayProductCount?: boolean | number
    /** Indicates whether filter is collapsed by default. */
    isCollapsedByDefault?: boolean | number
    /** Display name for the filter. */
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Filter by the attributes of products such as Product Options and Product Custom Fields. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
export interface ProductAttributeSearchFilterInput {
/** Product attributes */
attribute?: Scalars['String'],
/** Product attribute values */
values?: Scalars['String'][]}


/** Specific product attribute filter item */
export interface ProductAttributeSearchFilterItemGenqlSelection{
    /** Indicates whether product attribute is selected. */
    isSelected?: boolean | number
    /** Indicates how many products available for this filter. */
    productCount?: boolean | number
    /** Product attribute value. */
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface ProductAttributeSearchFilterItemConnectionGenqlSelection{
    /** A list of edges. */
    edges?: ProductAttributeSearchFilterItemEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface ProductAttributeSearchFilterItemEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: ProductAttributeSearchFilterItemGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Product availability */
export interface ProductAvailabilityGenqlSelection{
    /** A few words telling the customer how long it will normally take to ship this product, such as 'Usually ships in 24 hours'. */
    description?: boolean | number
    /** The availability state of the product. */
    status?: boolean | number
    on_ProductAvailable?: ProductAvailableGenqlSelection
    on_ProductPreOrder?: ProductPreOrderGenqlSelection
    on_ProductUnavailable?: ProductUnavailableGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Available Product */
export interface ProductAvailableGenqlSelection{
    /** A few words telling the customer how long it will normally take to ship this product, such as 'Usually ships in 24 hours'. */
    description?: boolean | number
    /** The availability state of the product. */
    status?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface ProductConnectionGenqlSelection{
    /** Collection info */
    collectionInfo?: CollectionInfoGenqlSelection
    /** A list of edges. */
    edges?: ProductEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface ProductEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: ProductGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Product Inventory Information */
export interface ProductInventoryGenqlSelection{
    /** Aggregated product inventory information. This data may not be available if not set or if the store's Inventory Settings have disabled displaying stock levels on the storefront. */
    aggregated?: AggregatedInventoryGenqlSelection
    /** Indicates whether this product's inventory is being tracked on variant level. If true, you may wish to check the variants node to understand the true inventory of each individual variant, rather than relying on this product-level aggregate to understand how many items may be added to cart. */
    hasVariantInventory?: boolean | number
    /** Indicates whether this product is in stock. */
    isInStock?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Product Option */
export interface ProductOptionGenqlSelection{
    /** Display name for the option. */
    displayName?: boolean | number
    /** Unique ID for the option. */
    entityId?: boolean | number
    /** One of the option values is required to be selected for the checkout. */
    isRequired?: boolean | number
    /** Option values. */
    values?: (OptionValueConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface ProductOptionConnectionGenqlSelection{
    /** A list of edges. */
    edges?: ProductOptionEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface ProductOptionEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: CatalogProductOptionGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Product Option Value */
export interface ProductOptionValueGenqlSelection{
    /** Unique ID for the option value. */
    entityId?: boolean | number
    /** Label for the option value. */
    label?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface ProductOptionValueConnectionGenqlSelection{
    /** A list of edges. */
    edges?: ProductOptionValueEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface ProductOptionValueEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: CatalogProductOptionValueGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A Product PickList Value - a product to be mapped to the base product if selected. */
export interface ProductPickListOptionValueGenqlSelection{
    /** Default image for a pick list product. */
    defaultImage?: ImageGenqlSelection
    /** Unique ID for the option value. */
    entityId?: boolean | number
    /** Indicates whether this value is the chosen default selected value. */
    isDefault?: boolean | number
    /** Indicates whether this value is selected based on sku/variantEntityId/optionValueIds overlay requested on the product node level. */
    isSelected?: boolean | number
    /** Label for the option value. */
    label?: boolean | number
    /** The ID of the product associated with this option value. */
    productId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** PreOrder Product */
export interface ProductPreOrderGenqlSelection{
    /** A few words telling the customer how long it will normally take to ship this product, such as 'Usually ships in 24 hours'. */
    description?: boolean | number
    /** The message to be shown in the store when a product is put into the pre-order availability state, e.g. "Expected release date is %%DATE%%" */
    message?: boolean | number
    /** The availability state of the product. */
    status?: boolean | number
    /** Product release date */
    willBeReleasedAt?: DateTimeExtendedGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Product reviews filters. */
export interface ProductReviewsFiltersInput {
/** Product reviews filter by rating. */
rating?: (ProductReviewsRatingFilterInput | null)}


/** Product reviews filter by rating. */
export interface ProductReviewsRatingFilterInput {
/** Maximum rating of the product. */
maxRating?: (Scalars['Int'] | null),
/** Minimum rating of the product. */
minRating?: (Scalars['Int'] | null)}


/** Unavailable Product */
export interface ProductUnavailableGenqlSelection{
    /** A few words telling the customer how long it will normally take to ship this product, such as 'Usually ships in 24 hours'. */
    description?: boolean | number
    /** The message to be shown in the store when "Call for pricing" is enabled for this product, e.g. "Contact us at 555-5555" */
    message?: boolean | number
    /** The availability state of the product. */
    status?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Public Wishlist */
export interface PublicWishlistGenqlSelection{
    /** The wishlist id. */
    entityId?: boolean | number
    /** A list of the wishlist items */
    items?: (WishlistItemConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), 
    /** When set to True, hides products which are out of stock. Defaults to False. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
    hideOutOfStock?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null)} })
    /** The wishlist name. */
    name?: boolean | number
    /** The wishlist token. */
    token?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface QueryGenqlSelection{
    /** The current channel. */
    channel?: ChannelGenqlSelection
    /** The currently logged in customer. */
    customer?: CustomerGenqlSelection
    /** An inventory */
    inventory?: InventoryGenqlSelection
    /** Fetches an object given its ID */
    node?: (NodeGenqlSelection & { __args: {
    /** The ID of an object */
    id: Scalars['ID']} })
    /** A site */
    site?: SiteGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Rating Filter */
export interface RatingSearchFilterGenqlSelection{
    /** Indicates whether filter is collapsed by default. */
    isCollapsedByDefault?: boolean | number
    /** Display name for the filter. */
    name?: boolean | number
    /** List of available ratings. */
    ratings?: (RatingSearchFilterItemConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Filter by rating. At least a minRating or maxRating must be supplied. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
export interface RatingSearchFilterInput {
/** Maximum rating of the product. */
maxRating?: (Scalars['Float'] | null),
/** Minimum rating of the product. */
minRating?: (Scalars['Float'] | null)}


/** Specific rating filter item */
export interface RatingSearchFilterItemGenqlSelection{
    /** Indicates whether rating is selected. */
    isSelected?: boolean | number
    /** Indicates how many products available for this filter. */
    productCount?: boolean | number
    /** Rating value. */
    value?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface RatingSearchFilterItemConnectionGenqlSelection{
    /** A list of edges. */
    edges?: RatingSearchFilterItemEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface RatingSearchFilterItemEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: RatingSearchFilterItemGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A raw HTML page. */
export interface RawHtmlPageGenqlSelection{
    /** Unique ID for the web page. */
    entityId?: boolean | number
    /** The body of the page. */
    htmlBody?: boolean | number
    /** The ID of an object */
    id?: boolean | number
    /** Whether or not the page should be visible in the navigation menu. */
    isVisibleInNavigation?: boolean | number
    /** Page name. */
    name?: boolean | number
    /** Unique ID for the parent page. */
    parentEntityId?: boolean | number
    /** The URL path of the page. */
    path?: boolean | number
    /** The plain text summary of the page body. */
    plainTextSummary?: { __args: {
    /** The max number of characters for the plain text summary. */
    characterLimit?: (Scalars['Int'] | null)} } | boolean | number
    /** Page SEO details. */
    seo?: SeoDetailsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** ReCaptcha settings. */
export interface ReCaptchaSettingsGenqlSelection{
    /** ReCaptcha site key. */
    siteKey?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The region object */
export interface RegionGenqlSelection{
    /** The rendered HTML content targeted at the region. */
    html?: boolean | number
    /** The name of a region. */
    name?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface RelatedProductsConnectionGenqlSelection{
    /** A list of edges. */
    edges?: RelatedProductsEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface RelatedProductsEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: ProductGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The rendered regions by specific page. */
export interface RenderedRegionsByPageTypeGenqlSelection{
    /** List of regions */
    regions?: RegionGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Review */
export interface ReviewGenqlSelection{
    /** Product review author. */
    author?: AuthorGenqlSelection
    /** Product review creation date. */
    createdAt?: DateTimeExtendedGenqlSelection
    /** Unique ID for the product review. */
    entityId?: boolean | number
    /** Product review rating. */
    rating?: boolean | number
    /** Product review text. */
    text?: boolean | number
    /** Product review title. */
    title?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface ReviewConnectionGenqlSelection{
    /** A list of edges. */
    edges?: ReviewEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface ReviewEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: ReviewGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Review Rating Summary */
export interface ReviewsGenqlSelection{
    /**
     * @deprecated Alpha version. Do not use in production.
     * Average rating of the product.
     */
    averageRating?: boolean | number
    /** Total number of reviews on product. */
    numberOfReviews?: boolean | number
    /** Summation of rating scores from each review. */
    summationOfRatings?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** route */
export interface RouteGenqlSelection{
    /** Node */
    node?: NodeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Store search settings. */
export interface SearchGenqlSelection{
    /** Product filtering enabled. */
    productFilteringEnabled?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Search Product Filter */
export interface SearchProductFilterGenqlSelection{
    /** Indicates whether filter is collapsed by default. */
    isCollapsedByDefault?: boolean | number
    /** Display name for the filter. */
    name?: boolean | number
    on_BrandSearchFilter?: BrandSearchFilterGenqlSelection
    on_CategorySearchFilter?: CategorySearchFilterGenqlSelection
    on_OtherSearchFilter?: OtherSearchFilterGenqlSelection
    on_PriceSearchFilter?: PriceSearchFilterGenqlSelection
    on_ProductAttributeSearchFilter?: ProductAttributeSearchFilterGenqlSelection
    on_RatingSearchFilter?: RatingSearchFilterGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface SearchProductFilterConnectionGenqlSelection{
    /** A list of edges. */
    edges?: SearchProductFilterEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface SearchProductFilterEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: SearchProductFilterGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Container for catalog search results, which may contain both products as well as a list of search filters for further refinement. */
export interface SearchProductsGenqlSelection{
    /** Available product filters. */
    filters?: (SearchProductFilterConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** Details of the products. */
    products?: (ProductConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), first?: (Scalars['Int'] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Object containing available search filters for use when querying Products. */
export interface SearchProductsFiltersInput {
/** Filter by products belonging to any of the specified Brands. */
brandEntityIds?: (Scalars['Int'][] | null),
/** Filter by products belonging to a single Category. This is intended for use when presenting a Category page in a PLP experience. This argument must be used in order for custom product sorts and custom product filtering settings targeted at a particular category to take effect. */
categoryEntityId?: (Scalars['Int'] | null),
/** Filter by products belonging to any of the specified Categories. Intended for Advanced Search and Faceted Search/Product Filtering use cases, not for a page for a specific Category. */
categoryEntityIds?: (Scalars['Int'][] | null),
/** When set to True, hides products which are out of stock. Defaults to False. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
hideOutOfStock?: (Scalars['Boolean'] | null),
/** Filters by Products which have explicitly been marked as Featured within the catalog. If not supplied, the Featured status of products will not be considered when returning the list of products. */
isFeatured?: (Scalars['Boolean'] | null),
/** Filters by Products which have explicit Free Shipping configured within the catalog. If not supplied, the Free Shipping status of products will not be considered when returning the list of products. */
isFreeShipping?: (Scalars['Boolean'] | null),
/** Search by price range. At least a minPrice or maxPrice must be supplied. */
price?: (PriceSearchFilterInput | null),
/** Filter by the attributes of products such as Product Options and Product Custom Fields. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
productAttributes?: (ProductAttributeSearchFilterInput[] | null),
/** Filter by rating. At least a minRating or maxRating must be supplied. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
rating?: (RatingSearchFilterInput | null),
/** Boolean argument to determine whether products within sub-Categories will be returned when filtering products by Category. Defaults to False if not supplied. */
searchSubCategories?: (Scalars['Boolean'] | null),
/** Textual search term. Used to search for products based on text entered by a shopper, typically in a search box. Searches against several fields on the product including Name, SKU, and Description. */
searchTerm?: (Scalars['String'] | null)}


/** The Search queries. */
export interface SearchQueriesGenqlSelection{
    /** Details of the products and facets matching given search criteria. */
    searchProducts?: (SearchProductsGenqlSelection & { __args: {
    /** Available search filters for use when querying products */
    filters: SearchProductsFiltersInput, 
    /** The results are sorted by relevance if the sort argument is not provided. */
    sort?: (SearchProductsSortInput | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Seo Details */
export interface SeoDetailsGenqlSelection{
    /** Meta description. */
    metaDescription?: boolean | number
    /** Meta keywords. */
    metaKeywords?: boolean | number
    /** Page title. */
    pageTitle?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Store settings information from the control panel. */
export interface SettingsGenqlSelection{
    /** Channel ID. */
    channelId?: boolean | number
    /** Checkout settings. */
    checkout?: CheckoutSettingsGenqlSelection
    /** Contact information for the store. */
    contact?: ContactFieldGenqlSelection
    /** Store display format information. */
    display?: DisplayFieldGenqlSelection
    /** Inventory settings. */
    inventory?: InventorySettingsGenqlSelection
    /**
     * @deprecated Use `logoV2` instead.
     * Logo information for the store.
     */
    logo?: LogoFieldGenqlSelection
    /** Logo information for the store. */
    logoV2?: StoreLogoGenqlSelection
    /** ReCaptcha settings. */
    reCaptcha?: ReCaptchaSettingsGenqlSelection
    /** Store search settings. */
    search?: SearchGenqlSelection
    /** The social media links of connected platforms to the storefront. */
    socialMediaLinks?: SocialMediaLinkGenqlSelection
    /** The current store status. */
    status?: boolean | number
    /** The hash of the store. */
    storeHash?: boolean | number
    /** The name of the store. */
    storeName?: boolean | number
    /** Storefront settings. */
    storefront?: StorefrontGenqlSelection
    /** The tax display settings object */
    tax?: TaxDisplaySettingsGenqlSelection
    /** Store urls. */
    url?: UrlFieldGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface ShopByPriceConnectionGenqlSelection{
    /** A list of edges. */
    edges?: ShopByPriceEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface ShopByPriceEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: ShopByPriceRangeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Category shop by price money ranges */
export interface ShopByPriceRangeGenqlSelection{
    /** Category shop by price range. */
    ranges?: MoneyRangeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A site */
export interface SiteGenqlSelection{
    /** Details of the best selling products. */
    bestSellingProducts?: (ProductConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), 
    /** When set to True, hides products which are out of stock. Defaults to False. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
    hideOutOfStock?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null)} })
    /** Details of the brand. */
    brands?: (BrandConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), 
    /** Filter by brand ids. */
    entityIds?: (Scalars['Int'][] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), 
    /** Filter by brands belonging to any of the specified Products. */
    productEntityIds?: (Scalars['Int'][] | null)} })
    /** The Cart of the current customer. */
    cart?: (CartGenqlSelection & { __args?: {
    /** Cart ID. */
    entityId?: (Scalars['String'] | null)} })
    /** Retrieve a category object by the id. */
    category?: (CategoryGenqlSelection & { __args: {
    /** The category id */
    entityId: Scalars['Int']} })
    /** A tree of categories. */
    categoryTree?: (CategoryTreeItemGenqlSelection & { __args?: {
    /** A root category ID to be used to load the tree starting from a particular branch. If not supplied, starts at the top of the tree. */
    rootEntityId?: (Scalars['Int'] | null)} })
    /** The page content. */
    content?: ContentGenqlSelection
    /** Store Currencies. */
    currencies?: (CurrencyConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** Currency details. */
    currency?: (CurrencyGenqlSelection & { __args: {
    /** Currency Code */
    currencyCode: currencyCode} })
    /** Details of the featured products. */
    featuredProducts?: (ProductConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), 
    /** When set to True, hides products which are out of stock. Defaults to False. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
    hideOutOfStock?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null)} })
    /** Details of the newest products. */
    newestProducts?: (ProductConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), 
    /** When set to True, hides products which are out of stock. Defaults to False. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
    hideOutOfStock?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null)} })
    /** List of brands sorted by product count. */
    popularBrands?: (PopularBrandConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** A single product object with variant pricing overlay capabilities. */
    product?: (ProductGenqlSelection & { __args?: {
    /** Product id filter. */
    entityId?: (Scalars['Int'] | null), 
    /** Product global id filter. */
    id?: (Scalars['ID'] | null), 
    /** A variant option value ids filter. */
    optionValueIds?: (OptionValueId[] | null), 
    /** Product filter by sku. */
    sku?: (Scalars['String'] | null), 
    /** When set to True, returns products with default option selection overlay if one exists. Otherwise returns a base product. Defaults to False */
    useDefaultOptionSelections?: (Scalars['Boolean'] | null), 
    /** Product filter by variant id. */
    variantEntityId?: (Scalars['Int'] | null)} })
    /** Details of the products. */
    products?: (ProductConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), 
    /** Ids of expected products. */
    entityIds?: (Scalars['Int'][] | null), first?: (Scalars['Int'] | null), 
    /** When set to True, hides products which are out of stock. Defaults to False. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
    hideOutOfStock?: (Scalars['Boolean'] | null), 
    /** Global ids of expected products. */
    ids?: (Scalars['ID'][] | null), last?: (Scalars['Int'] | null)} })
    /** Public Wishlist */
    publicWishlist?: (PublicWishlistGenqlSelection & { __args: {
    /** A wishlist token filter */
    token: Scalars['String']} })
    /** Route for a node */
    route?: (RouteGenqlSelection & { __args: {
    /** An url path to an expected entity. */
    path: Scalars['String']} })
    /** The Search queries. */
    search?: SearchQueriesGenqlSelection
    /** Store settings. */
    settings?: SettingsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The social media link. */
export interface SocialMediaLinkGenqlSelection{
    /** The name of the social media link. */
    name?: boolean | number
    /** The url of the social media link. */
    url?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Special hour */
export interface SpecialHourGenqlSelection{
    /** Closing time */
    closing?: boolean | number
    /** Upcoming event name */
    label?: boolean | number
    /** Is open */
    open?: boolean | number
    /** Opening time */
    opening?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Store logo as image. */
export interface StoreImageLogoGenqlSelection{
    /** Logo image. */
    image?: ImageGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Store logo. */
export interface StoreLogoGenqlSelection{
    on_StoreImageLogo?:StoreImageLogoGenqlSelection,
    on_StoreTextLogo?:StoreTextLogoGenqlSelection,
    __typename?: boolean | number
}


/** Store logo as text. */
export interface StoreTextLogoGenqlSelection{
    /** Logo text. */
    text?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Storefront settings. */
export interface StorefrontGenqlSelection{
    /** Storefront catalog settings. */
    catalog?: CatalogGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Specific sub-category filter item */
export interface SubCategorySearchFilterItemGenqlSelection{
    /** Category ID. */
    entityId?: boolean | number
    /** Indicates whether category is selected. */
    isSelected?: boolean | number
    /** Category name. */
    name?: boolean | number
    /** Indicates how many products available for this filter. */
    productCount?: boolean | number
    /** List of available sub-categories. */
    subCategories?: (SubCategorySearchFilterItemConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface SubCategorySearchFilterItemConnectionGenqlSelection{
    /** A list of edges. */
    edges?: SubCategorySearchFilterItemEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface SubCategorySearchFilterItemEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: SubCategorySearchFilterItemGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A swatch option value - swatch values can be associated with a list of hexidecimal colors or an image. */
export interface SwatchOptionValueGenqlSelection{
    /** Unique ID for the option value. */
    entityId?: boolean | number
    /** List of up to 3 hex encoded colors to associate with a swatch value. */
    hexColors?: boolean | number
    /** Absolute path of a swatch texture image. */
    imageUrl?: { __args: {
    /** Desired height of the image. */
    height?: (Scalars['Int'] | null), 
    /** Desired width of the image. */
    width: Scalars['Int']} }
    /** Indicates whether this value is the chosen default selected value. */
    isDefault?: boolean | number
    /** Indicates whether this value is selected based on sku/variantEntityId/optionValueIds overlay requested on the product node level. */
    isSelected?: boolean | number
    /** Label for the option value. */
    label?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** The tax display settings object */
export interface TaxDisplaySettingsGenqlSelection{
    /** Tax display setting for Product Details Page. */
    pdp?: boolean | number
    /** Tax display setting for Product List Page. */
    plp?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A single line text input field. */
export interface TextFieldOptionGenqlSelection{
    /** Default value of the text field option. */
    defaultValue?: boolean | number
    /** Display name for the option. */
    displayName?: boolean | number
    /** Unique ID for the option. */
    entityId?: boolean | number
    /** One of the option values is required to be selected for the checkout. */
    isRequired?: boolean | number
    /** Indicates whether it is a variant option or modifier. */
    isVariantOption?: boolean | number
    /** The maximum number of characters. */
    maxLength?: boolean | number
    /** The minimum number of characters. */
    minLength?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Unassign cart from the customer input object. */
export interface UnassignCartFromCustomerInput {
/** The cart id. */
cartEntityId?: Scalars['String']}


/** Unassign cart from the customer result. */
export interface UnassignCartFromCustomerResultGenqlSelection{
    /** The Cart that is updated as a result of mutation. */
    cart?: CartGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Update cart currency data object */
export interface UpdateCartCurrencyDataInput {
/** ISO-4217 currency code */
currencyCode?: Scalars['String']}


/** Update cart currency input object */
export interface UpdateCartCurrencyInput {
/** The cart id */
cartEntityId?: Scalars['String'],
/** Update cart currency data object */
data?: UpdateCartCurrencyDataInput}


/** Update cart currency result */
export interface UpdateCartCurrencyResultGenqlSelection{
    /** The Cart that is updated as a result of mutation. */
    cart?: CartGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Update cart line item data object */
export interface UpdateCartLineItemDataInput {
/** The gift certificate */
giftCertificate?: (CartGiftCertificateInput | null),
/** The cart line item */
lineItem?: (CartLineItemInput | null)}


/** Update cart line item input object */
export interface UpdateCartLineItemInput {
/** The cart id */
cartEntityId?: Scalars['String'],
/** Update cart line item data object */
data?: UpdateCartLineItemDataInput,
/** The line item id */
lineItemEntityId?: Scalars['String']}


/** Update cart line item result */
export interface UpdateCartLineItemResultGenqlSelection{
    /** The Cart that is updated as a result of mutation. */
    cart?: CartGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Update wishlist input object */
export interface UpdateWishlistInput {
/** Wishlist data to update */
data?: WishlistUpdateDataInput,
/** The wishlist id */
entityId?: Scalars['Int']}


/** Update wishlist */
export interface UpdateWishlistResultGenqlSelection{
    /** The wishlist */
    result?: WishlistGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Url field */
export interface UrlFieldGenqlSelection{
    /** CDN url to fetch assets. */
    cdnUrl?: boolean | number
    /** Checkout url. */
    checkoutUrl?: boolean | number
    /** Store url. */
    vanityUrl?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Variant */
export interface VariantGenqlSelection{
    /** Default image for a variant. */
    defaultImage?: ImageGenqlSelection
    /** The variant's depth. If a depth was not explicitly specified on the variant, this will be the product's depth. */
    depth?: MeasurementGenqlSelection
    /** Id of the variant. */
    entityId?: boolean | number
    /** Global trade item number. */
    gtin?: boolean | number
    /** The variant's height. If a height was not explicitly specified on the variant, this will be the product's height. */
    height?: MeasurementGenqlSelection
    /** The ID of an object */
    id?: boolean | number
    /** Variant inventory */
    inventory?: VariantInventoryGenqlSelection
    /** Whether the product can be purchased */
    isPurchasable?: boolean | number
    /** Metafield data related to a variant. */
    metafields?: (MetafieldConnectionGenqlSelection & { __args: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), 
    /** Labels for identifying metafield data values. */
    keys?: (Scalars['String'][] | null), last?: (Scalars['Int'] | null), 
    /** Metafield namespace filter */
    namespace: Scalars['String']} })
    /** Manufacturer part number. */
    mpn?: boolean | number
    /** The options which define a variant. */
    options?: (OptionConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** Variant prices */
    prices?: (PricesGenqlSelection & { __args?: {
    /** Please select a currency */
    currencyCode?: (currencyCode | null), 
    /** Tax will be included if enabled */
    includeTax?: (Scalars['Boolean'] | null)} })
    /** Product options that compose this variant. */
    productOptions?: (ProductOptionConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null)} })
    /** Sku of the variant. */
    sku?: boolean | number
    /** Universal product code. */
    upc?: boolean | number
    /** The variant's weight. If a weight was not explicitly specified on the variant, this will be the product's weight. */
    weight?: MeasurementGenqlSelection
    /** The variant's width. If a width was not explicitly specified on the variant, this will be the product's width. */
    width?: MeasurementGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface VariantConnectionGenqlSelection{
    /** A list of edges. */
    edges?: VariantEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface VariantEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: VariantGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Variant Inventory */
export interface VariantInventoryGenqlSelection{
    /** Aggregated product variant inventory information. This data may not be available if not set or if the store's Inventory Settings have disabled displaying stock levels on the storefront. */
    aggregated?: AggregatedGenqlSelection
    /** Inventory by locations. */
    byLocation?: (LocationConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), 
    /** Filter locations by the distance */
    distanceFilter?: (DistanceFilter | null), first?: (Scalars['Int'] | null), last?: (Scalars['Int'] | null), 
    /** Location entity codes filter. */
    locationEntityCodes?: (Scalars['String'][] | null), 
    /** Location ids filter. */
    locationEntityIds?: (Scalars['Int'][] | null), 
    /** Location entity type ids filter. */
    locationEntityServiceTypeIds?: (Scalars['String'][] | null), 
    /** Location entity type ids filter. */
    locationEntityTypeIds?: (Scalars['String'][] | null)} })
    /** Indicates whether this product is in stock. */
    isInStock?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** WebPage details. */
export interface WebPageGenqlSelection{
    /** Unique ID for the web page. */
    entityId?: boolean | number
    /** Whether or not the page should be visible in the navigation menu. */
    isVisibleInNavigation?: boolean | number
    /** Page name. */
    name?: boolean | number
    /** Unique ID for the parent page. */
    parentEntityId?: boolean | number
    /** Page SEO details. */
    seo?: SeoDetailsGenqlSelection
    on_BlogIndexPage?: BlogIndexPageGenqlSelection
    on_ContactPage?: ContactPageGenqlSelection
    on_ExternalLinkPage?: ExternalLinkPageGenqlSelection
    on_NormalPage?: NormalPageGenqlSelection
    on_RawHtmlPage?: RawHtmlPageGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Object containing filters for querying web pages */
export interface WebPagesFiltersInput {
/** Ids of the expected pages. */
entityIds?: (Scalars['Int'][] | null),
/** Whether the expected pages are visible in the navigation bar. */
isVisibleInNavigation?: (Scalars['Boolean'] | null),
/** Type of the expected pages. */
pageType?: (WebPageType | null)}


/** A wishlist */
export interface WishlistGenqlSelection{
    /** The wishlist id. */
    entityId?: boolean | number
    /** Is the wishlist public? */
    isPublic?: boolean | number
    /** A list of the wishlist items */
    items?: (WishlistItemConnectionGenqlSelection & { __args?: {after?: (Scalars['String'] | null), before?: (Scalars['String'] | null), first?: (Scalars['Int'] | null), 
    /** When set to True, hides products which are out of stock. Defaults to False. This filter will do nothing unless your store has the Product Filtering feature available on your plan and enabled. If it is supplied when your store does not have the feature enabled, it will be silently ignored. */
    hideOutOfStock?: (Scalars['Boolean'] | null), last?: (Scalars['Int'] | null)} })
    /** The wishlist name. */
    name?: boolean | number
    /** The wishlist token. */
    token?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface WishlistConnectionGenqlSelection{
    /** A list of edges. */
    edges?: WishlistEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface WishlistEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: WishlistGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Wishlist filters input object */
export interface WishlistFiltersInput {
/** A wishlist ids filter. */
entityIds?: (Scalars['Int'][] | null)}


/** The wishlist item */
export interface WishlistItemGenqlSelection{
    /** Wishlist item id. */
    entityId?: boolean | number
    /** A product included in the wishlist. */
    product?: ProductGenqlSelection
    /** An id of the product from the wishlist. */
    productEntityId?: boolean | number
    /** An id of the specific product variant from the wishlist. */
    variantEntityId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** A connection to a list of items. */
export interface WishlistItemConnectionGenqlSelection{
    /** A list of edges. */
    edges?: WishlistItemEdgeGenqlSelection
    /** Information to aid in pagination. */
    pageInfo?: PageInfoGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** An edge in a connection. */
export interface WishlistItemEdgeGenqlSelection{
    /** A cursor for use in pagination. */
    cursor?: boolean | number
    /** The item at the end of the edge. */
    node?: WishlistItemGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Wishlist item input object */
export interface WishlistItemInput {
/** An id of the product from the wishlist. */
productEntityId?: Scalars['Int'],
/** An id of the specific product variant from the wishlist. */
variantEntityId?: (Scalars['Int'] | null)}


/** The wishlist mutations. */
export interface WishlistMutationsGenqlSelection{
    /** Add wishlist items */
    addWishlistItems?: (AddWishlistItemsResultGenqlSelection & { __args: {
    /** Add wishlist items input */
    input: AddWishlistItemsInput} })
    /** Create wishlist */
    createWishlist?: (CreateWishlistResultGenqlSelection & { __args: {
    /** Create wishlists input */
    input: CreateWishlistInput} })
    /** Delete wishlist items */
    deleteWishlistItems?: (DeleteWishlistItemsResultGenqlSelection & { __args: {
    /** Delete wishlist items input */
    input: DeleteWishlistItemsInput} })
    /** Delete wishlist */
    deleteWishlists?: (DeleteWishlistResultGenqlSelection & { __args: {
    /** Delete wishlists input */
    input: DeleteWishlistsInput} })
    /** Update wishlist */
    updateWishlist?: (UpdateWishlistResultGenqlSelection & { __args: {
    /** Update wishlist items input */
    input: UpdateWishlistInput} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Wishlist data to update */
export interface WishlistUpdateDataInput {
/** A new wishlist visibility mode */
isPublic?: (Scalars['Boolean'] | null),
/** A new wishlist name */
name?: (Scalars['String'] | null)}


    const AddCartLineItemsResult_possibleTypes: string[] = ['AddCartLineItemsResult']
    export const isAddCartLineItemsResult = (obj?: { __typename?: any } | null): obj is AddCartLineItemsResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAddCartLineItemsResult"')
      return AddCartLineItemsResult_possibleTypes.includes(obj.__typename)
    }
    


    const AddWishlistItemsResult_possibleTypes: string[] = ['AddWishlistItemsResult']
    export const isAddWishlistItemsResult = (obj?: { __typename?: any } | null): obj is AddWishlistItemsResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAddWishlistItemsResult"')
      return AddWishlistItemsResult_possibleTypes.includes(obj.__typename)
    }
    


    const Aggregated_possibleTypes: string[] = ['Aggregated']
    export const isAggregated = (obj?: { __typename?: any } | null): obj is Aggregated => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAggregated"')
      return Aggregated_possibleTypes.includes(obj.__typename)
    }
    


    const AggregatedInventory_possibleTypes: string[] = ['AggregatedInventory']
    export const isAggregatedInventory = (obj?: { __typename?: any } | null): obj is AggregatedInventory => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAggregatedInventory"')
      return AggregatedInventory_possibleTypes.includes(obj.__typename)
    }
    


    const AssignCartToCustomerResult_possibleTypes: string[] = ['AssignCartToCustomerResult']
    export const isAssignCartToCustomerResult = (obj?: { __typename?: any } | null): obj is AssignCartToCustomerResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAssignCartToCustomerResult"')
      return AssignCartToCustomerResult_possibleTypes.includes(obj.__typename)
    }
    


    const Author_possibleTypes: string[] = ['Author']
    export const isAuthor = (obj?: { __typename?: any } | null): obj is Author => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isAuthor"')
      return Author_possibleTypes.includes(obj.__typename)
    }
    


    const Banner_possibleTypes: string[] = ['Banner']
    export const isBanner = (obj?: { __typename?: any } | null): obj is Banner => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBanner"')
      return Banner_possibleTypes.includes(obj.__typename)
    }
    


    const BannerConnection_possibleTypes: string[] = ['BannerConnection']
    export const isBannerConnection = (obj?: { __typename?: any } | null): obj is BannerConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBannerConnection"')
      return BannerConnection_possibleTypes.includes(obj.__typename)
    }
    


    const BannerEdge_possibleTypes: string[] = ['BannerEdge']
    export const isBannerEdge = (obj?: { __typename?: any } | null): obj is BannerEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBannerEdge"')
      return BannerEdge_possibleTypes.includes(obj.__typename)
    }
    


    const Banners_possibleTypes: string[] = ['Banners']
    export const isBanners = (obj?: { __typename?: any } | null): obj is Banners => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBanners"')
      return Banners_possibleTypes.includes(obj.__typename)
    }
    


    const Blog_possibleTypes: string[] = ['Blog']
    export const isBlog = (obj?: { __typename?: any } | null): obj is Blog => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBlog"')
      return Blog_possibleTypes.includes(obj.__typename)
    }
    


    const BlogIndexPage_possibleTypes: string[] = ['BlogIndexPage']
    export const isBlogIndexPage = (obj?: { __typename?: any } | null): obj is BlogIndexPage => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBlogIndexPage"')
      return BlogIndexPage_possibleTypes.includes(obj.__typename)
    }
    


    const BlogPost_possibleTypes: string[] = ['BlogPost']
    export const isBlogPost = (obj?: { __typename?: any } | null): obj is BlogPost => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBlogPost"')
      return BlogPost_possibleTypes.includes(obj.__typename)
    }
    


    const BlogPostConnection_possibleTypes: string[] = ['BlogPostConnection']
    export const isBlogPostConnection = (obj?: { __typename?: any } | null): obj is BlogPostConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBlogPostConnection"')
      return BlogPostConnection_possibleTypes.includes(obj.__typename)
    }
    


    const BlogPostEdge_possibleTypes: string[] = ['BlogPostEdge']
    export const isBlogPostEdge = (obj?: { __typename?: any } | null): obj is BlogPostEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBlogPostEdge"')
      return BlogPostEdge_possibleTypes.includes(obj.__typename)
    }
    


    const Brand_possibleTypes: string[] = ['Brand']
    export const isBrand = (obj?: { __typename?: any } | null): obj is Brand => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBrand"')
      return Brand_possibleTypes.includes(obj.__typename)
    }
    


    const BrandConnection_possibleTypes: string[] = ['BrandConnection']
    export const isBrandConnection = (obj?: { __typename?: any } | null): obj is BrandConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBrandConnection"')
      return BrandConnection_possibleTypes.includes(obj.__typename)
    }
    


    const BrandEdge_possibleTypes: string[] = ['BrandEdge']
    export const isBrandEdge = (obj?: { __typename?: any } | null): obj is BrandEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBrandEdge"')
      return BrandEdge_possibleTypes.includes(obj.__typename)
    }
    


    const BrandPageBannerConnection_possibleTypes: string[] = ['BrandPageBannerConnection']
    export const isBrandPageBannerConnection = (obj?: { __typename?: any } | null): obj is BrandPageBannerConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBrandPageBannerConnection"')
      return BrandPageBannerConnection_possibleTypes.includes(obj.__typename)
    }
    


    const BrandPageBannerEdge_possibleTypes: string[] = ['BrandPageBannerEdge']
    export const isBrandPageBannerEdge = (obj?: { __typename?: any } | null): obj is BrandPageBannerEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBrandPageBannerEdge"')
      return BrandPageBannerEdge_possibleTypes.includes(obj.__typename)
    }
    


    const BrandSearchFilter_possibleTypes: string[] = ['BrandSearchFilter']
    export const isBrandSearchFilter = (obj?: { __typename?: any } | null): obj is BrandSearchFilter => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBrandSearchFilter"')
      return BrandSearchFilter_possibleTypes.includes(obj.__typename)
    }
    


    const BrandSearchFilterItem_possibleTypes: string[] = ['BrandSearchFilterItem']
    export const isBrandSearchFilterItem = (obj?: { __typename?: any } | null): obj is BrandSearchFilterItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBrandSearchFilterItem"')
      return BrandSearchFilterItem_possibleTypes.includes(obj.__typename)
    }
    


    const BrandSearchFilterItemConnection_possibleTypes: string[] = ['BrandSearchFilterItemConnection']
    export const isBrandSearchFilterItemConnection = (obj?: { __typename?: any } | null): obj is BrandSearchFilterItemConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBrandSearchFilterItemConnection"')
      return BrandSearchFilterItemConnection_possibleTypes.includes(obj.__typename)
    }
    


    const BrandSearchFilterItemEdge_possibleTypes: string[] = ['BrandSearchFilterItemEdge']
    export const isBrandSearchFilterItemEdge = (obj?: { __typename?: any } | null): obj is BrandSearchFilterItemEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBrandSearchFilterItemEdge"')
      return BrandSearchFilterItemEdge_possibleTypes.includes(obj.__typename)
    }
    


    const Breadcrumb_possibleTypes: string[] = ['Breadcrumb']
    export const isBreadcrumb = (obj?: { __typename?: any } | null): obj is Breadcrumb => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBreadcrumb"')
      return Breadcrumb_possibleTypes.includes(obj.__typename)
    }
    


    const BreadcrumbConnection_possibleTypes: string[] = ['BreadcrumbConnection']
    export const isBreadcrumbConnection = (obj?: { __typename?: any } | null): obj is BreadcrumbConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBreadcrumbConnection"')
      return BreadcrumbConnection_possibleTypes.includes(obj.__typename)
    }
    


    const BreadcrumbEdge_possibleTypes: string[] = ['BreadcrumbEdge']
    export const isBreadcrumbEdge = (obj?: { __typename?: any } | null): obj is BreadcrumbEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBreadcrumbEdge"')
      return BreadcrumbEdge_possibleTypes.includes(obj.__typename)
    }
    


    const BulkPricingFixedPriceDiscount_possibleTypes: string[] = ['BulkPricingFixedPriceDiscount']
    export const isBulkPricingFixedPriceDiscount = (obj?: { __typename?: any } | null): obj is BulkPricingFixedPriceDiscount => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBulkPricingFixedPriceDiscount"')
      return BulkPricingFixedPriceDiscount_possibleTypes.includes(obj.__typename)
    }
    


    const BulkPricingPercentageDiscount_possibleTypes: string[] = ['BulkPricingPercentageDiscount']
    export const isBulkPricingPercentageDiscount = (obj?: { __typename?: any } | null): obj is BulkPricingPercentageDiscount => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBulkPricingPercentageDiscount"')
      return BulkPricingPercentageDiscount_possibleTypes.includes(obj.__typename)
    }
    


    const BulkPricingRelativePriceDiscount_possibleTypes: string[] = ['BulkPricingRelativePriceDiscount']
    export const isBulkPricingRelativePriceDiscount = (obj?: { __typename?: any } | null): obj is BulkPricingRelativePriceDiscount => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBulkPricingRelativePriceDiscount"')
      return BulkPricingRelativePriceDiscount_possibleTypes.includes(obj.__typename)
    }
    


    const BulkPricingTier_possibleTypes: string[] = ['BulkPricingFixedPriceDiscount','BulkPricingPercentageDiscount','BulkPricingRelativePriceDiscount']
    export const isBulkPricingTier = (obj?: { __typename?: any } | null): obj is BulkPricingTier => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isBulkPricingTier"')
      return BulkPricingTier_possibleTypes.includes(obj.__typename)
    }
    


    const Cart_possibleTypes: string[] = ['Cart']
    export const isCart = (obj?: { __typename?: any } | null): obj is Cart => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCart"')
      return Cart_possibleTypes.includes(obj.__typename)
    }
    


    const CartCustomItem_possibleTypes: string[] = ['CartCustomItem']
    export const isCartCustomItem = (obj?: { __typename?: any } | null): obj is CartCustomItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartCustomItem"')
      return CartCustomItem_possibleTypes.includes(obj.__typename)
    }
    


    const CartDigitalItem_possibleTypes: string[] = ['CartDigitalItem']
    export const isCartDigitalItem = (obj?: { __typename?: any } | null): obj is CartDigitalItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartDigitalItem"')
      return CartDigitalItem_possibleTypes.includes(obj.__typename)
    }
    


    const CartDiscount_possibleTypes: string[] = ['CartDiscount']
    export const isCartDiscount = (obj?: { __typename?: any } | null): obj is CartDiscount => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartDiscount"')
      return CartDiscount_possibleTypes.includes(obj.__typename)
    }
    


    const CartGiftCertificate_possibleTypes: string[] = ['CartGiftCertificate']
    export const isCartGiftCertificate = (obj?: { __typename?: any } | null): obj is CartGiftCertificate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartGiftCertificate"')
      return CartGiftCertificate_possibleTypes.includes(obj.__typename)
    }
    


    const CartGiftCertificateRecipient_possibleTypes: string[] = ['CartGiftCertificateRecipient']
    export const isCartGiftCertificateRecipient = (obj?: { __typename?: any } | null): obj is CartGiftCertificateRecipient => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartGiftCertificateRecipient"')
      return CartGiftCertificateRecipient_possibleTypes.includes(obj.__typename)
    }
    


    const CartGiftCertificateSender_possibleTypes: string[] = ['CartGiftCertificateSender']
    export const isCartGiftCertificateSender = (obj?: { __typename?: any } | null): obj is CartGiftCertificateSender => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartGiftCertificateSender"')
      return CartGiftCertificateSender_possibleTypes.includes(obj.__typename)
    }
    


    const CartGiftWrapping_possibleTypes: string[] = ['CartGiftWrapping']
    export const isCartGiftWrapping = (obj?: { __typename?: any } | null): obj is CartGiftWrapping => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartGiftWrapping"')
      return CartGiftWrapping_possibleTypes.includes(obj.__typename)
    }
    


    const CartLineItems_possibleTypes: string[] = ['CartLineItems']
    export const isCartLineItems = (obj?: { __typename?: any } | null): obj is CartLineItems => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartLineItems"')
      return CartLineItems_possibleTypes.includes(obj.__typename)
    }
    


    const CartMutations_possibleTypes: string[] = ['CartMutations']
    export const isCartMutations = (obj?: { __typename?: any } | null): obj is CartMutations => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartMutations"')
      return CartMutations_possibleTypes.includes(obj.__typename)
    }
    


    const CartPhysicalItem_possibleTypes: string[] = ['CartPhysicalItem']
    export const isCartPhysicalItem = (obj?: { __typename?: any } | null): obj is CartPhysicalItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartPhysicalItem"')
      return CartPhysicalItem_possibleTypes.includes(obj.__typename)
    }
    


    const CartSelectedCheckboxOption_possibleTypes: string[] = ['CartSelectedCheckboxOption']
    export const isCartSelectedCheckboxOption = (obj?: { __typename?: any } | null): obj is CartSelectedCheckboxOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartSelectedCheckboxOption"')
      return CartSelectedCheckboxOption_possibleTypes.includes(obj.__typename)
    }
    


    const CartSelectedDateFieldOption_possibleTypes: string[] = ['CartSelectedDateFieldOption']
    export const isCartSelectedDateFieldOption = (obj?: { __typename?: any } | null): obj is CartSelectedDateFieldOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartSelectedDateFieldOption"')
      return CartSelectedDateFieldOption_possibleTypes.includes(obj.__typename)
    }
    


    const CartSelectedFileUploadOption_possibleTypes: string[] = ['CartSelectedFileUploadOption']
    export const isCartSelectedFileUploadOption = (obj?: { __typename?: any } | null): obj is CartSelectedFileUploadOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartSelectedFileUploadOption"')
      return CartSelectedFileUploadOption_possibleTypes.includes(obj.__typename)
    }
    


    const CartSelectedMultiLineTextFieldOption_possibleTypes: string[] = ['CartSelectedMultiLineTextFieldOption']
    export const isCartSelectedMultiLineTextFieldOption = (obj?: { __typename?: any } | null): obj is CartSelectedMultiLineTextFieldOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartSelectedMultiLineTextFieldOption"')
      return CartSelectedMultiLineTextFieldOption_possibleTypes.includes(obj.__typename)
    }
    


    const CartSelectedMultipleChoiceOption_possibleTypes: string[] = ['CartSelectedMultipleChoiceOption']
    export const isCartSelectedMultipleChoiceOption = (obj?: { __typename?: any } | null): obj is CartSelectedMultipleChoiceOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartSelectedMultipleChoiceOption"')
      return CartSelectedMultipleChoiceOption_possibleTypes.includes(obj.__typename)
    }
    


    const CartSelectedNumberFieldOption_possibleTypes: string[] = ['CartSelectedNumberFieldOption']
    export const isCartSelectedNumberFieldOption = (obj?: { __typename?: any } | null): obj is CartSelectedNumberFieldOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartSelectedNumberFieldOption"')
      return CartSelectedNumberFieldOption_possibleTypes.includes(obj.__typename)
    }
    


    const CartSelectedOption_possibleTypes: string[] = ['CartSelectedCheckboxOption','CartSelectedDateFieldOption','CartSelectedFileUploadOption','CartSelectedMultiLineTextFieldOption','CartSelectedMultipleChoiceOption','CartSelectedNumberFieldOption','CartSelectedTextFieldOption']
    export const isCartSelectedOption = (obj?: { __typename?: any } | null): obj is CartSelectedOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartSelectedOption"')
      return CartSelectedOption_possibleTypes.includes(obj.__typename)
    }
    


    const CartSelectedTextFieldOption_possibleTypes: string[] = ['CartSelectedTextFieldOption']
    export const isCartSelectedTextFieldOption = (obj?: { __typename?: any } | null): obj is CartSelectedTextFieldOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCartSelectedTextFieldOption"')
      return CartSelectedTextFieldOption_possibleTypes.includes(obj.__typename)
    }
    


    const Catalog_possibleTypes: string[] = ['Catalog']
    export const isCatalog = (obj?: { __typename?: any } | null): obj is Catalog => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCatalog"')
      return Catalog_possibleTypes.includes(obj.__typename)
    }
    


    const CatalogProductOption_possibleTypes: string[] = ['CheckboxOption','DateFieldOption','FileUploadFieldOption','MultiLineTextFieldOption','MultipleChoiceOption','NumberFieldOption','TextFieldOption']
    export const isCatalogProductOption = (obj?: { __typename?: any } | null): obj is CatalogProductOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCatalogProductOption"')
      return CatalogProductOption_possibleTypes.includes(obj.__typename)
    }
    


    const CatalogProductOptionValue_possibleTypes: string[] = ['MultipleChoiceOptionValue','ProductPickListOptionValue','SwatchOptionValue']
    export const isCatalogProductOptionValue = (obj?: { __typename?: any } | null): obj is CatalogProductOptionValue => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCatalogProductOptionValue"')
      return CatalogProductOptionValue_possibleTypes.includes(obj.__typename)
    }
    


    const Category_possibleTypes: string[] = ['Category']
    export const isCategory = (obj?: { __typename?: any } | null): obj is Category => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCategory"')
      return Category_possibleTypes.includes(obj.__typename)
    }
    


    const CategoryConnection_possibleTypes: string[] = ['CategoryConnection']
    export const isCategoryConnection = (obj?: { __typename?: any } | null): obj is CategoryConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCategoryConnection"')
      return CategoryConnection_possibleTypes.includes(obj.__typename)
    }
    


    const CategoryEdge_possibleTypes: string[] = ['CategoryEdge']
    export const isCategoryEdge = (obj?: { __typename?: any } | null): obj is CategoryEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCategoryEdge"')
      return CategoryEdge_possibleTypes.includes(obj.__typename)
    }
    


    const CategoryPageBannerConnection_possibleTypes: string[] = ['CategoryPageBannerConnection']
    export const isCategoryPageBannerConnection = (obj?: { __typename?: any } | null): obj is CategoryPageBannerConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCategoryPageBannerConnection"')
      return CategoryPageBannerConnection_possibleTypes.includes(obj.__typename)
    }
    


    const CategoryPageBannerEdge_possibleTypes: string[] = ['CategoryPageBannerEdge']
    export const isCategoryPageBannerEdge = (obj?: { __typename?: any } | null): obj is CategoryPageBannerEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCategoryPageBannerEdge"')
      return CategoryPageBannerEdge_possibleTypes.includes(obj.__typename)
    }
    


    const CategorySearchFilter_possibleTypes: string[] = ['CategorySearchFilter']
    export const isCategorySearchFilter = (obj?: { __typename?: any } | null): obj is CategorySearchFilter => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCategorySearchFilter"')
      return CategorySearchFilter_possibleTypes.includes(obj.__typename)
    }
    


    const CategorySearchFilterItem_possibleTypes: string[] = ['CategorySearchFilterItem']
    export const isCategorySearchFilterItem = (obj?: { __typename?: any } | null): obj is CategorySearchFilterItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCategorySearchFilterItem"')
      return CategorySearchFilterItem_possibleTypes.includes(obj.__typename)
    }
    


    const CategorySearchFilterItemConnection_possibleTypes: string[] = ['CategorySearchFilterItemConnection']
    export const isCategorySearchFilterItemConnection = (obj?: { __typename?: any } | null): obj is CategorySearchFilterItemConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCategorySearchFilterItemConnection"')
      return CategorySearchFilterItemConnection_possibleTypes.includes(obj.__typename)
    }
    


    const CategorySearchFilterItemEdge_possibleTypes: string[] = ['CategorySearchFilterItemEdge']
    export const isCategorySearchFilterItemEdge = (obj?: { __typename?: any } | null): obj is CategorySearchFilterItemEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCategorySearchFilterItemEdge"')
      return CategorySearchFilterItemEdge_possibleTypes.includes(obj.__typename)
    }
    


    const CategoryTreeItem_possibleTypes: string[] = ['CategoryTreeItem']
    export const isCategoryTreeItem = (obj?: { __typename?: any } | null): obj is CategoryTreeItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCategoryTreeItem"')
      return CategoryTreeItem_possibleTypes.includes(obj.__typename)
    }
    


    const Channel_possibleTypes: string[] = ['Channel']
    export const isChannel = (obj?: { __typename?: any } | null): obj is Channel => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isChannel"')
      return Channel_possibleTypes.includes(obj.__typename)
    }
    


    const CheckboxOption_possibleTypes: string[] = ['CheckboxOption']
    export const isCheckboxOption = (obj?: { __typename?: any } | null): obj is CheckboxOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCheckboxOption"')
      return CheckboxOption_possibleTypes.includes(obj.__typename)
    }
    


    const CheckoutSettings_possibleTypes: string[] = ['CheckoutSettings']
    export const isCheckoutSettings = (obj?: { __typename?: any } | null): obj is CheckoutSettings => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCheckoutSettings"')
      return CheckoutSettings_possibleTypes.includes(obj.__typename)
    }
    


    const CollectionInfo_possibleTypes: string[] = ['CollectionInfo']
    export const isCollectionInfo = (obj?: { __typename?: any } | null): obj is CollectionInfo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCollectionInfo"')
      return CollectionInfo_possibleTypes.includes(obj.__typename)
    }
    


    const ContactField_possibleTypes: string[] = ['ContactField']
    export const isContactField = (obj?: { __typename?: any } | null): obj is ContactField => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isContactField"')
      return ContactField_possibleTypes.includes(obj.__typename)
    }
    


    const ContactPage_possibleTypes: string[] = ['ContactPage']
    export const isContactPage = (obj?: { __typename?: any } | null): obj is ContactPage => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isContactPage"')
      return ContactPage_possibleTypes.includes(obj.__typename)
    }
    


    const Content_possibleTypes: string[] = ['Content']
    export const isContent = (obj?: { __typename?: any } | null): obj is Content => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isContent"')
      return Content_possibleTypes.includes(obj.__typename)
    }
    


    const CreateCartResult_possibleTypes: string[] = ['CreateCartResult']
    export const isCreateCartResult = (obj?: { __typename?: any } | null): obj is CreateCartResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCreateCartResult"')
      return CreateCartResult_possibleTypes.includes(obj.__typename)
    }
    


    const CreateWishlistResult_possibleTypes: string[] = ['CreateWishlistResult']
    export const isCreateWishlistResult = (obj?: { __typename?: any } | null): obj is CreateWishlistResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCreateWishlistResult"')
      return CreateWishlistResult_possibleTypes.includes(obj.__typename)
    }
    


    const Currency_possibleTypes: string[] = ['Currency']
    export const isCurrency = (obj?: { __typename?: any } | null): obj is Currency => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCurrency"')
      return Currency_possibleTypes.includes(obj.__typename)
    }
    


    const CurrencyConnection_possibleTypes: string[] = ['CurrencyConnection']
    export const isCurrencyConnection = (obj?: { __typename?: any } | null): obj is CurrencyConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCurrencyConnection"')
      return CurrencyConnection_possibleTypes.includes(obj.__typename)
    }
    


    const CurrencyDisplay_possibleTypes: string[] = ['CurrencyDisplay']
    export const isCurrencyDisplay = (obj?: { __typename?: any } | null): obj is CurrencyDisplay => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCurrencyDisplay"')
      return CurrencyDisplay_possibleTypes.includes(obj.__typename)
    }
    


    const CurrencyEdge_possibleTypes: string[] = ['CurrencyEdge']
    export const isCurrencyEdge = (obj?: { __typename?: any } | null): obj is CurrencyEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCurrencyEdge"')
      return CurrencyEdge_possibleTypes.includes(obj.__typename)
    }
    


    const CustomField_possibleTypes: string[] = ['CustomField']
    export const isCustomField = (obj?: { __typename?: any } | null): obj is CustomField => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCustomField"')
      return CustomField_possibleTypes.includes(obj.__typename)
    }
    


    const CustomFieldConnection_possibleTypes: string[] = ['CustomFieldConnection']
    export const isCustomFieldConnection = (obj?: { __typename?: any } | null): obj is CustomFieldConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCustomFieldConnection"')
      return CustomFieldConnection_possibleTypes.includes(obj.__typename)
    }
    


    const CustomFieldEdge_possibleTypes: string[] = ['CustomFieldEdge']
    export const isCustomFieldEdge = (obj?: { __typename?: any } | null): obj is CustomFieldEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCustomFieldEdge"')
      return CustomFieldEdge_possibleTypes.includes(obj.__typename)
    }
    


    const Customer_possibleTypes: string[] = ['Customer']
    export const isCustomer = (obj?: { __typename?: any } | null): obj is Customer => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCustomer"')
      return Customer_possibleTypes.includes(obj.__typename)
    }
    


    const CustomerAttribute_possibleTypes: string[] = ['CustomerAttribute']
    export const isCustomerAttribute = (obj?: { __typename?: any } | null): obj is CustomerAttribute => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCustomerAttribute"')
      return CustomerAttribute_possibleTypes.includes(obj.__typename)
    }
    


    const CustomerAttributes_possibleTypes: string[] = ['CustomerAttributes']
    export const isCustomerAttributes = (obj?: { __typename?: any } | null): obj is CustomerAttributes => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isCustomerAttributes"')
      return CustomerAttributes_possibleTypes.includes(obj.__typename)
    }
    


    const DateFieldOption_possibleTypes: string[] = ['DateFieldOption']
    export const isDateFieldOption = (obj?: { __typename?: any } | null): obj is DateFieldOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDateFieldOption"')
      return DateFieldOption_possibleTypes.includes(obj.__typename)
    }
    


    const DateTimeExtended_possibleTypes: string[] = ['DateTimeExtended']
    export const isDateTimeExtended = (obj?: { __typename?: any } | null): obj is DateTimeExtended => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDateTimeExtended"')
      return DateTimeExtended_possibleTypes.includes(obj.__typename)
    }
    


    const DeleteCartLineItemResult_possibleTypes: string[] = ['DeleteCartLineItemResult']
    export const isDeleteCartLineItemResult = (obj?: { __typename?: any } | null): obj is DeleteCartLineItemResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDeleteCartLineItemResult"')
      return DeleteCartLineItemResult_possibleTypes.includes(obj.__typename)
    }
    


    const DeleteCartResult_possibleTypes: string[] = ['DeleteCartResult']
    export const isDeleteCartResult = (obj?: { __typename?: any } | null): obj is DeleteCartResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDeleteCartResult"')
      return DeleteCartResult_possibleTypes.includes(obj.__typename)
    }
    


    const DeleteWishlistItemsResult_possibleTypes: string[] = ['DeleteWishlistItemsResult']
    export const isDeleteWishlistItemsResult = (obj?: { __typename?: any } | null): obj is DeleteWishlistItemsResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDeleteWishlistItemsResult"')
      return DeleteWishlistItemsResult_possibleTypes.includes(obj.__typename)
    }
    


    const DeleteWishlistResult_possibleTypes: string[] = ['DeleteWishlistResult']
    export const isDeleteWishlistResult = (obj?: { __typename?: any } | null): obj is DeleteWishlistResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDeleteWishlistResult"')
      return DeleteWishlistResult_possibleTypes.includes(obj.__typename)
    }
    


    const DisplayField_possibleTypes: string[] = ['DisplayField']
    export const isDisplayField = (obj?: { __typename?: any } | null): obj is DisplayField => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDisplayField"')
      return DisplayField_possibleTypes.includes(obj.__typename)
    }
    


    const Distance_possibleTypes: string[] = ['Distance']
    export const isDistance = (obj?: { __typename?: any } | null): obj is Distance => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isDistance"')
      return Distance_possibleTypes.includes(obj.__typename)
    }
    


    const ExternalLinkPage_possibleTypes: string[] = ['ExternalLinkPage']
    export const isExternalLinkPage = (obj?: { __typename?: any } | null): obj is ExternalLinkPage => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isExternalLinkPage"')
      return ExternalLinkPage_possibleTypes.includes(obj.__typename)
    }
    


    const FileUploadFieldOption_possibleTypes: string[] = ['FileUploadFieldOption']
    export const isFileUploadFieldOption = (obj?: { __typename?: any } | null): obj is FileUploadFieldOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isFileUploadFieldOption"')
      return FileUploadFieldOption_possibleTypes.includes(obj.__typename)
    }
    


    const GiftWrapping_possibleTypes: string[] = ['GiftWrapping']
    export const isGiftWrapping = (obj?: { __typename?: any } | null): obj is GiftWrapping => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isGiftWrapping"')
      return GiftWrapping_possibleTypes.includes(obj.__typename)
    }
    


    const GiftWrappingConnection_possibleTypes: string[] = ['GiftWrappingConnection']
    export const isGiftWrappingConnection = (obj?: { __typename?: any } | null): obj is GiftWrappingConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isGiftWrappingConnection"')
      return GiftWrappingConnection_possibleTypes.includes(obj.__typename)
    }
    


    const GiftWrappingEdge_possibleTypes: string[] = ['GiftWrappingEdge']
    export const isGiftWrappingEdge = (obj?: { __typename?: any } | null): obj is GiftWrappingEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isGiftWrappingEdge"')
      return GiftWrappingEdge_possibleTypes.includes(obj.__typename)
    }
    


    const Image_possibleTypes: string[] = ['Image']
    export const isImage = (obj?: { __typename?: any } | null): obj is Image => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isImage"')
      return Image_possibleTypes.includes(obj.__typename)
    }
    


    const ImageConnection_possibleTypes: string[] = ['ImageConnection']
    export const isImageConnection = (obj?: { __typename?: any } | null): obj is ImageConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isImageConnection"')
      return ImageConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ImageEdge_possibleTypes: string[] = ['ImageEdge']
    export const isImageEdge = (obj?: { __typename?: any } | null): obj is ImageEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isImageEdge"')
      return ImageEdge_possibleTypes.includes(obj.__typename)
    }
    


    const Inventory_possibleTypes: string[] = ['Inventory']
    export const isInventory = (obj?: { __typename?: any } | null): obj is Inventory => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isInventory"')
      return Inventory_possibleTypes.includes(obj.__typename)
    }
    


    const InventoryAddress_possibleTypes: string[] = ['InventoryAddress']
    export const isInventoryAddress = (obj?: { __typename?: any } | null): obj is InventoryAddress => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isInventoryAddress"')
      return InventoryAddress_possibleTypes.includes(obj.__typename)
    }
    


    const InventoryByLocations_possibleTypes: string[] = ['InventoryByLocations']
    export const isInventoryByLocations = (obj?: { __typename?: any } | null): obj is InventoryByLocations => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isInventoryByLocations"')
      return InventoryByLocations_possibleTypes.includes(obj.__typename)
    }
    


    const InventoryLocation_possibleTypes: string[] = ['InventoryLocation']
    export const isInventoryLocation = (obj?: { __typename?: any } | null): obj is InventoryLocation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isInventoryLocation"')
      return InventoryLocation_possibleTypes.includes(obj.__typename)
    }
    


    const InventoryLocationConnection_possibleTypes: string[] = ['InventoryLocationConnection']
    export const isInventoryLocationConnection = (obj?: { __typename?: any } | null): obj is InventoryLocationConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isInventoryLocationConnection"')
      return InventoryLocationConnection_possibleTypes.includes(obj.__typename)
    }
    


    const InventoryLocationEdge_possibleTypes: string[] = ['InventoryLocationEdge']
    export const isInventoryLocationEdge = (obj?: { __typename?: any } | null): obj is InventoryLocationEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isInventoryLocationEdge"')
      return InventoryLocationEdge_possibleTypes.includes(obj.__typename)
    }
    


    const InventorySettings_possibleTypes: string[] = ['InventorySettings']
    export const isInventorySettings = (obj?: { __typename?: any } | null): obj is InventorySettings => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isInventorySettings"')
      return InventorySettings_possibleTypes.includes(obj.__typename)
    }
    


    const LocationConnection_possibleTypes: string[] = ['LocationConnection']
    export const isLocationConnection = (obj?: { __typename?: any } | null): obj is LocationConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLocationConnection"')
      return LocationConnection_possibleTypes.includes(obj.__typename)
    }
    


    const LocationEdge_possibleTypes: string[] = ['LocationEdge']
    export const isLocationEdge = (obj?: { __typename?: any } | null): obj is LocationEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLocationEdge"')
      return LocationEdge_possibleTypes.includes(obj.__typename)
    }
    


    const LoginResult_possibleTypes: string[] = ['LoginResult']
    export const isLoginResult = (obj?: { __typename?: any } | null): obj is LoginResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLoginResult"')
      return LoginResult_possibleTypes.includes(obj.__typename)
    }
    


    const LogoField_possibleTypes: string[] = ['LogoField']
    export const isLogoField = (obj?: { __typename?: any } | null): obj is LogoField => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLogoField"')
      return LogoField_possibleTypes.includes(obj.__typename)
    }
    


    const LogoutResult_possibleTypes: string[] = ['LogoutResult']
    export const isLogoutResult = (obj?: { __typename?: any } | null): obj is LogoutResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isLogoutResult"')
      return LogoutResult_possibleTypes.includes(obj.__typename)
    }
    


    const Measurement_possibleTypes: string[] = ['Measurement']
    export const isMeasurement = (obj?: { __typename?: any } | null): obj is Measurement => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMeasurement"')
      return Measurement_possibleTypes.includes(obj.__typename)
    }
    


    const MetafieldConnection_possibleTypes: string[] = ['MetafieldConnection']
    export const isMetafieldConnection = (obj?: { __typename?: any } | null): obj is MetafieldConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMetafieldConnection"')
      return MetafieldConnection_possibleTypes.includes(obj.__typename)
    }
    


    const MetafieldEdge_possibleTypes: string[] = ['MetafieldEdge']
    export const isMetafieldEdge = (obj?: { __typename?: any } | null): obj is MetafieldEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMetafieldEdge"')
      return MetafieldEdge_possibleTypes.includes(obj.__typename)
    }
    


    const Metafields_possibleTypes: string[] = ['Metafields']
    export const isMetafields = (obj?: { __typename?: any } | null): obj is Metafields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMetafields"')
      return Metafields_possibleTypes.includes(obj.__typename)
    }
    


    const Money_possibleTypes: string[] = ['Money']
    export const isMoney = (obj?: { __typename?: any } | null): obj is Money => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMoney"')
      return Money_possibleTypes.includes(obj.__typename)
    }
    


    const MoneyRange_possibleTypes: string[] = ['MoneyRange']
    export const isMoneyRange = (obj?: { __typename?: any } | null): obj is MoneyRange => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMoneyRange"')
      return MoneyRange_possibleTypes.includes(obj.__typename)
    }
    


    const MultiLineTextFieldOption_possibleTypes: string[] = ['MultiLineTextFieldOption']
    export const isMultiLineTextFieldOption = (obj?: { __typename?: any } | null): obj is MultiLineTextFieldOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMultiLineTextFieldOption"')
      return MultiLineTextFieldOption_possibleTypes.includes(obj.__typename)
    }
    


    const MultipleChoiceOption_possibleTypes: string[] = ['MultipleChoiceOption']
    export const isMultipleChoiceOption = (obj?: { __typename?: any } | null): obj is MultipleChoiceOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMultipleChoiceOption"')
      return MultipleChoiceOption_possibleTypes.includes(obj.__typename)
    }
    


    const MultipleChoiceOptionValue_possibleTypes: string[] = ['MultipleChoiceOptionValue']
    export const isMultipleChoiceOptionValue = (obj?: { __typename?: any } | null): obj is MultipleChoiceOptionValue => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMultipleChoiceOptionValue"')
      return MultipleChoiceOptionValue_possibleTypes.includes(obj.__typename)
    }
    


    const Mutation_possibleTypes: string[] = ['Mutation']
    export const isMutation = (obj?: { __typename?: any } | null): obj is Mutation => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isMutation"')
      return Mutation_possibleTypes.includes(obj.__typename)
    }
    


    const Node_possibleTypes: string[] = ['Banner','Blog','BlogPost','Brand','Cart','Category','ContactPage','NormalPage','Product','RawHtmlPage','Variant']
    export const isNode = (obj?: { __typename?: any } | null): obj is Node => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNode"')
      return Node_possibleTypes.includes(obj.__typename)
    }
    


    const NormalPage_possibleTypes: string[] = ['NormalPage']
    export const isNormalPage = (obj?: { __typename?: any } | null): obj is NormalPage => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNormalPage"')
      return NormalPage_possibleTypes.includes(obj.__typename)
    }
    


    const NumberFieldOption_possibleTypes: string[] = ['NumberFieldOption']
    export const isNumberFieldOption = (obj?: { __typename?: any } | null): obj is NumberFieldOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isNumberFieldOption"')
      return NumberFieldOption_possibleTypes.includes(obj.__typename)
    }
    


    const OperatingDay_possibleTypes: string[] = ['OperatingDay']
    export const isOperatingDay = (obj?: { __typename?: any } | null): obj is OperatingDay => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOperatingDay"')
      return OperatingDay_possibleTypes.includes(obj.__typename)
    }
    


    const OperatingHours_possibleTypes: string[] = ['OperatingHours']
    export const isOperatingHours = (obj?: { __typename?: any } | null): obj is OperatingHours => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOperatingHours"')
      return OperatingHours_possibleTypes.includes(obj.__typename)
    }
    


    const OptionConnection_possibleTypes: string[] = ['OptionConnection']
    export const isOptionConnection = (obj?: { __typename?: any } | null): obj is OptionConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOptionConnection"')
      return OptionConnection_possibleTypes.includes(obj.__typename)
    }
    


    const OptionEdge_possibleTypes: string[] = ['OptionEdge']
    export const isOptionEdge = (obj?: { __typename?: any } | null): obj is OptionEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOptionEdge"')
      return OptionEdge_possibleTypes.includes(obj.__typename)
    }
    


    const OptionValueConnection_possibleTypes: string[] = ['OptionValueConnection']
    export const isOptionValueConnection = (obj?: { __typename?: any } | null): obj is OptionValueConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOptionValueConnection"')
      return OptionValueConnection_possibleTypes.includes(obj.__typename)
    }
    


    const OptionValueEdge_possibleTypes: string[] = ['OptionValueEdge']
    export const isOptionValueEdge = (obj?: { __typename?: any } | null): obj is OptionValueEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOptionValueEdge"')
      return OptionValueEdge_possibleTypes.includes(obj.__typename)
    }
    


    const OtherSearchFilter_possibleTypes: string[] = ['OtherSearchFilter']
    export const isOtherSearchFilter = (obj?: { __typename?: any } | null): obj is OtherSearchFilter => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOtherSearchFilter"')
      return OtherSearchFilter_possibleTypes.includes(obj.__typename)
    }
    


    const OtherSearchFilterItem_possibleTypes: string[] = ['OtherSearchFilterItem']
    export const isOtherSearchFilterItem = (obj?: { __typename?: any } | null): obj is OtherSearchFilterItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isOtherSearchFilterItem"')
      return OtherSearchFilterItem_possibleTypes.includes(obj.__typename)
    }
    


    const PageConnection_possibleTypes: string[] = ['PageConnection']
    export const isPageConnection = (obj?: { __typename?: any } | null): obj is PageConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageConnection"')
      return PageConnection_possibleTypes.includes(obj.__typename)
    }
    


    const PageEdge_possibleTypes: string[] = ['PageEdge']
    export const isPageEdge = (obj?: { __typename?: any } | null): obj is PageEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageEdge"')
      return PageEdge_possibleTypes.includes(obj.__typename)
    }
    


    const PageInfo_possibleTypes: string[] = ['PageInfo']
    export const isPageInfo = (obj?: { __typename?: any } | null): obj is PageInfo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPageInfo"')
      return PageInfo_possibleTypes.includes(obj.__typename)
    }
    


    const PopularBrandConnection_possibleTypes: string[] = ['PopularBrandConnection']
    export const isPopularBrandConnection = (obj?: { __typename?: any } | null): obj is PopularBrandConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPopularBrandConnection"')
      return PopularBrandConnection_possibleTypes.includes(obj.__typename)
    }
    


    const PopularBrandEdge_possibleTypes: string[] = ['PopularBrandEdge']
    export const isPopularBrandEdge = (obj?: { __typename?: any } | null): obj is PopularBrandEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPopularBrandEdge"')
      return PopularBrandEdge_possibleTypes.includes(obj.__typename)
    }
    


    const PopularBrandType_possibleTypes: string[] = ['PopularBrandType']
    export const isPopularBrandType = (obj?: { __typename?: any } | null): obj is PopularBrandType => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPopularBrandType"')
      return PopularBrandType_possibleTypes.includes(obj.__typename)
    }
    


    const PriceRanges_possibleTypes: string[] = ['PriceRanges']
    export const isPriceRanges = (obj?: { __typename?: any } | null): obj is PriceRanges => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPriceRanges"')
      return PriceRanges_possibleTypes.includes(obj.__typename)
    }
    


    const PriceSearchFilter_possibleTypes: string[] = ['PriceSearchFilter']
    export const isPriceSearchFilter = (obj?: { __typename?: any } | null): obj is PriceSearchFilter => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPriceSearchFilter"')
      return PriceSearchFilter_possibleTypes.includes(obj.__typename)
    }
    


    const PriceSearchFilterItem_possibleTypes: string[] = ['PriceSearchFilterItem']
    export const isPriceSearchFilterItem = (obj?: { __typename?: any } | null): obj is PriceSearchFilterItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPriceSearchFilterItem"')
      return PriceSearchFilterItem_possibleTypes.includes(obj.__typename)
    }
    


    const Prices_possibleTypes: string[] = ['Prices']
    export const isPrices = (obj?: { __typename?: any } | null): obj is Prices => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPrices"')
      return Prices_possibleTypes.includes(obj.__typename)
    }
    


    const Product_possibleTypes: string[] = ['Product']
    export const isProduct = (obj?: { __typename?: any } | null): obj is Product => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProduct"')
      return Product_possibleTypes.includes(obj.__typename)
    }
    


    const ProductAttributeSearchFilter_possibleTypes: string[] = ['ProductAttributeSearchFilter']
    export const isProductAttributeSearchFilter = (obj?: { __typename?: any } | null): obj is ProductAttributeSearchFilter => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductAttributeSearchFilter"')
      return ProductAttributeSearchFilter_possibleTypes.includes(obj.__typename)
    }
    


    const ProductAttributeSearchFilterItem_possibleTypes: string[] = ['ProductAttributeSearchFilterItem']
    export const isProductAttributeSearchFilterItem = (obj?: { __typename?: any } | null): obj is ProductAttributeSearchFilterItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductAttributeSearchFilterItem"')
      return ProductAttributeSearchFilterItem_possibleTypes.includes(obj.__typename)
    }
    


    const ProductAttributeSearchFilterItemConnection_possibleTypes: string[] = ['ProductAttributeSearchFilterItemConnection']
    export const isProductAttributeSearchFilterItemConnection = (obj?: { __typename?: any } | null): obj is ProductAttributeSearchFilterItemConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductAttributeSearchFilterItemConnection"')
      return ProductAttributeSearchFilterItemConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ProductAttributeSearchFilterItemEdge_possibleTypes: string[] = ['ProductAttributeSearchFilterItemEdge']
    export const isProductAttributeSearchFilterItemEdge = (obj?: { __typename?: any } | null): obj is ProductAttributeSearchFilterItemEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductAttributeSearchFilterItemEdge"')
      return ProductAttributeSearchFilterItemEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ProductAvailability_possibleTypes: string[] = ['ProductAvailable','ProductPreOrder','ProductUnavailable']
    export const isProductAvailability = (obj?: { __typename?: any } | null): obj is ProductAvailability => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductAvailability"')
      return ProductAvailability_possibleTypes.includes(obj.__typename)
    }
    


    const ProductAvailable_possibleTypes: string[] = ['ProductAvailable']
    export const isProductAvailable = (obj?: { __typename?: any } | null): obj is ProductAvailable => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductAvailable"')
      return ProductAvailable_possibleTypes.includes(obj.__typename)
    }
    


    const ProductConnection_possibleTypes: string[] = ['ProductConnection']
    export const isProductConnection = (obj?: { __typename?: any } | null): obj is ProductConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductConnection"')
      return ProductConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ProductEdge_possibleTypes: string[] = ['ProductEdge']
    export const isProductEdge = (obj?: { __typename?: any } | null): obj is ProductEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductEdge"')
      return ProductEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ProductInventory_possibleTypes: string[] = ['ProductInventory']
    export const isProductInventory = (obj?: { __typename?: any } | null): obj is ProductInventory => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductInventory"')
      return ProductInventory_possibleTypes.includes(obj.__typename)
    }
    


    const ProductOption_possibleTypes: string[] = ['ProductOption']
    export const isProductOption = (obj?: { __typename?: any } | null): obj is ProductOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductOption"')
      return ProductOption_possibleTypes.includes(obj.__typename)
    }
    


    const ProductOptionConnection_possibleTypes: string[] = ['ProductOptionConnection']
    export const isProductOptionConnection = (obj?: { __typename?: any } | null): obj is ProductOptionConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductOptionConnection"')
      return ProductOptionConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ProductOptionEdge_possibleTypes: string[] = ['ProductOptionEdge']
    export const isProductOptionEdge = (obj?: { __typename?: any } | null): obj is ProductOptionEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductOptionEdge"')
      return ProductOptionEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ProductOptionValue_possibleTypes: string[] = ['ProductOptionValue']
    export const isProductOptionValue = (obj?: { __typename?: any } | null): obj is ProductOptionValue => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductOptionValue"')
      return ProductOptionValue_possibleTypes.includes(obj.__typename)
    }
    


    const ProductOptionValueConnection_possibleTypes: string[] = ['ProductOptionValueConnection']
    export const isProductOptionValueConnection = (obj?: { __typename?: any } | null): obj is ProductOptionValueConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductOptionValueConnection"')
      return ProductOptionValueConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ProductOptionValueEdge_possibleTypes: string[] = ['ProductOptionValueEdge']
    export const isProductOptionValueEdge = (obj?: { __typename?: any } | null): obj is ProductOptionValueEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductOptionValueEdge"')
      return ProductOptionValueEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ProductPickListOptionValue_possibleTypes: string[] = ['ProductPickListOptionValue']
    export const isProductPickListOptionValue = (obj?: { __typename?: any } | null): obj is ProductPickListOptionValue => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductPickListOptionValue"')
      return ProductPickListOptionValue_possibleTypes.includes(obj.__typename)
    }
    


    const ProductPreOrder_possibleTypes: string[] = ['ProductPreOrder']
    export const isProductPreOrder = (obj?: { __typename?: any } | null): obj is ProductPreOrder => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductPreOrder"')
      return ProductPreOrder_possibleTypes.includes(obj.__typename)
    }
    


    const ProductUnavailable_possibleTypes: string[] = ['ProductUnavailable']
    export const isProductUnavailable = (obj?: { __typename?: any } | null): obj is ProductUnavailable => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isProductUnavailable"')
      return ProductUnavailable_possibleTypes.includes(obj.__typename)
    }
    


    const PublicWishlist_possibleTypes: string[] = ['PublicWishlist']
    export const isPublicWishlist = (obj?: { __typename?: any } | null): obj is PublicWishlist => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isPublicWishlist"')
      return PublicWishlist_possibleTypes.includes(obj.__typename)
    }
    


    const Query_possibleTypes: string[] = ['Query']
    export const isQuery = (obj?: { __typename?: any } | null): obj is Query => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isQuery"')
      return Query_possibleTypes.includes(obj.__typename)
    }
    


    const RatingSearchFilter_possibleTypes: string[] = ['RatingSearchFilter']
    export const isRatingSearchFilter = (obj?: { __typename?: any } | null): obj is RatingSearchFilter => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRatingSearchFilter"')
      return RatingSearchFilter_possibleTypes.includes(obj.__typename)
    }
    


    const RatingSearchFilterItem_possibleTypes: string[] = ['RatingSearchFilterItem']
    export const isRatingSearchFilterItem = (obj?: { __typename?: any } | null): obj is RatingSearchFilterItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRatingSearchFilterItem"')
      return RatingSearchFilterItem_possibleTypes.includes(obj.__typename)
    }
    


    const RatingSearchFilterItemConnection_possibleTypes: string[] = ['RatingSearchFilterItemConnection']
    export const isRatingSearchFilterItemConnection = (obj?: { __typename?: any } | null): obj is RatingSearchFilterItemConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRatingSearchFilterItemConnection"')
      return RatingSearchFilterItemConnection_possibleTypes.includes(obj.__typename)
    }
    


    const RatingSearchFilterItemEdge_possibleTypes: string[] = ['RatingSearchFilterItemEdge']
    export const isRatingSearchFilterItemEdge = (obj?: { __typename?: any } | null): obj is RatingSearchFilterItemEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRatingSearchFilterItemEdge"')
      return RatingSearchFilterItemEdge_possibleTypes.includes(obj.__typename)
    }
    


    const RawHtmlPage_possibleTypes: string[] = ['RawHtmlPage']
    export const isRawHtmlPage = (obj?: { __typename?: any } | null): obj is RawHtmlPage => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRawHtmlPage"')
      return RawHtmlPage_possibleTypes.includes(obj.__typename)
    }
    


    const ReCaptchaSettings_possibleTypes: string[] = ['ReCaptchaSettings']
    export const isReCaptchaSettings = (obj?: { __typename?: any } | null): obj is ReCaptchaSettings => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isReCaptchaSettings"')
      return ReCaptchaSettings_possibleTypes.includes(obj.__typename)
    }
    


    const Region_possibleTypes: string[] = ['Region']
    export const isRegion = (obj?: { __typename?: any } | null): obj is Region => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRegion"')
      return Region_possibleTypes.includes(obj.__typename)
    }
    


    const RelatedProductsConnection_possibleTypes: string[] = ['RelatedProductsConnection']
    export const isRelatedProductsConnection = (obj?: { __typename?: any } | null): obj is RelatedProductsConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRelatedProductsConnection"')
      return RelatedProductsConnection_possibleTypes.includes(obj.__typename)
    }
    


    const RelatedProductsEdge_possibleTypes: string[] = ['RelatedProductsEdge']
    export const isRelatedProductsEdge = (obj?: { __typename?: any } | null): obj is RelatedProductsEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRelatedProductsEdge"')
      return RelatedProductsEdge_possibleTypes.includes(obj.__typename)
    }
    


    const RenderedRegionsByPageType_possibleTypes: string[] = ['RenderedRegionsByPageType']
    export const isRenderedRegionsByPageType = (obj?: { __typename?: any } | null): obj is RenderedRegionsByPageType => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRenderedRegionsByPageType"')
      return RenderedRegionsByPageType_possibleTypes.includes(obj.__typename)
    }
    


    const Review_possibleTypes: string[] = ['Review']
    export const isReview = (obj?: { __typename?: any } | null): obj is Review => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isReview"')
      return Review_possibleTypes.includes(obj.__typename)
    }
    


    const ReviewConnection_possibleTypes: string[] = ['ReviewConnection']
    export const isReviewConnection = (obj?: { __typename?: any } | null): obj is ReviewConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isReviewConnection"')
      return ReviewConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ReviewEdge_possibleTypes: string[] = ['ReviewEdge']
    export const isReviewEdge = (obj?: { __typename?: any } | null): obj is ReviewEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isReviewEdge"')
      return ReviewEdge_possibleTypes.includes(obj.__typename)
    }
    


    const Reviews_possibleTypes: string[] = ['Reviews']
    export const isReviews = (obj?: { __typename?: any } | null): obj is Reviews => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isReviews"')
      return Reviews_possibleTypes.includes(obj.__typename)
    }
    


    const Route_possibleTypes: string[] = ['Route']
    export const isRoute = (obj?: { __typename?: any } | null): obj is Route => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isRoute"')
      return Route_possibleTypes.includes(obj.__typename)
    }
    


    const Search_possibleTypes: string[] = ['Search']
    export const isSearch = (obj?: { __typename?: any } | null): obj is Search => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSearch"')
      return Search_possibleTypes.includes(obj.__typename)
    }
    


    const SearchProductFilter_possibleTypes: string[] = ['BrandSearchFilter','CategorySearchFilter','OtherSearchFilter','PriceSearchFilter','ProductAttributeSearchFilter','RatingSearchFilter']
    export const isSearchProductFilter = (obj?: { __typename?: any } | null): obj is SearchProductFilter => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSearchProductFilter"')
      return SearchProductFilter_possibleTypes.includes(obj.__typename)
    }
    


    const SearchProductFilterConnection_possibleTypes: string[] = ['SearchProductFilterConnection']
    export const isSearchProductFilterConnection = (obj?: { __typename?: any } | null): obj is SearchProductFilterConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSearchProductFilterConnection"')
      return SearchProductFilterConnection_possibleTypes.includes(obj.__typename)
    }
    


    const SearchProductFilterEdge_possibleTypes: string[] = ['SearchProductFilterEdge']
    export const isSearchProductFilterEdge = (obj?: { __typename?: any } | null): obj is SearchProductFilterEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSearchProductFilterEdge"')
      return SearchProductFilterEdge_possibleTypes.includes(obj.__typename)
    }
    


    const SearchProducts_possibleTypes: string[] = ['SearchProducts']
    export const isSearchProducts = (obj?: { __typename?: any } | null): obj is SearchProducts => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSearchProducts"')
      return SearchProducts_possibleTypes.includes(obj.__typename)
    }
    


    const SearchQueries_possibleTypes: string[] = ['SearchQueries']
    export const isSearchQueries = (obj?: { __typename?: any } | null): obj is SearchQueries => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSearchQueries"')
      return SearchQueries_possibleTypes.includes(obj.__typename)
    }
    


    const SeoDetails_possibleTypes: string[] = ['SeoDetails']
    export const isSeoDetails = (obj?: { __typename?: any } | null): obj is SeoDetails => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSeoDetails"')
      return SeoDetails_possibleTypes.includes(obj.__typename)
    }
    


    const Settings_possibleTypes: string[] = ['Settings']
    export const isSettings = (obj?: { __typename?: any } | null): obj is Settings => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSettings"')
      return Settings_possibleTypes.includes(obj.__typename)
    }
    


    const ShopByPriceConnection_possibleTypes: string[] = ['ShopByPriceConnection']
    export const isShopByPriceConnection = (obj?: { __typename?: any } | null): obj is ShopByPriceConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isShopByPriceConnection"')
      return ShopByPriceConnection_possibleTypes.includes(obj.__typename)
    }
    


    const ShopByPriceEdge_possibleTypes: string[] = ['ShopByPriceEdge']
    export const isShopByPriceEdge = (obj?: { __typename?: any } | null): obj is ShopByPriceEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isShopByPriceEdge"')
      return ShopByPriceEdge_possibleTypes.includes(obj.__typename)
    }
    


    const ShopByPriceRange_possibleTypes: string[] = ['ShopByPriceRange']
    export const isShopByPriceRange = (obj?: { __typename?: any } | null): obj is ShopByPriceRange => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isShopByPriceRange"')
      return ShopByPriceRange_possibleTypes.includes(obj.__typename)
    }
    


    const Site_possibleTypes: string[] = ['Site']
    export const isSite = (obj?: { __typename?: any } | null): obj is Site => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSite"')
      return Site_possibleTypes.includes(obj.__typename)
    }
    


    const SocialMediaLink_possibleTypes: string[] = ['SocialMediaLink']
    export const isSocialMediaLink = (obj?: { __typename?: any } | null): obj is SocialMediaLink => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSocialMediaLink"')
      return SocialMediaLink_possibleTypes.includes(obj.__typename)
    }
    


    const SpecialHour_possibleTypes: string[] = ['SpecialHour']
    export const isSpecialHour = (obj?: { __typename?: any } | null): obj is SpecialHour => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSpecialHour"')
      return SpecialHour_possibleTypes.includes(obj.__typename)
    }
    


    const StoreImageLogo_possibleTypes: string[] = ['StoreImageLogo']
    export const isStoreImageLogo = (obj?: { __typename?: any } | null): obj is StoreImageLogo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isStoreImageLogo"')
      return StoreImageLogo_possibleTypes.includes(obj.__typename)
    }
    


    const StoreLogo_possibleTypes: string[] = ['StoreImageLogo','StoreTextLogo']
    export const isStoreLogo = (obj?: { __typename?: any } | null): obj is StoreLogo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isStoreLogo"')
      return StoreLogo_possibleTypes.includes(obj.__typename)
    }
    


    const StoreTextLogo_possibleTypes: string[] = ['StoreTextLogo']
    export const isStoreTextLogo = (obj?: { __typename?: any } | null): obj is StoreTextLogo => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isStoreTextLogo"')
      return StoreTextLogo_possibleTypes.includes(obj.__typename)
    }
    


    const Storefront_possibleTypes: string[] = ['Storefront']
    export const isStorefront = (obj?: { __typename?: any } | null): obj is Storefront => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isStorefront"')
      return Storefront_possibleTypes.includes(obj.__typename)
    }
    


    const SubCategorySearchFilterItem_possibleTypes: string[] = ['SubCategorySearchFilterItem']
    export const isSubCategorySearchFilterItem = (obj?: { __typename?: any } | null): obj is SubCategorySearchFilterItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSubCategorySearchFilterItem"')
      return SubCategorySearchFilterItem_possibleTypes.includes(obj.__typename)
    }
    


    const SubCategorySearchFilterItemConnection_possibleTypes: string[] = ['SubCategorySearchFilterItemConnection']
    export const isSubCategorySearchFilterItemConnection = (obj?: { __typename?: any } | null): obj is SubCategorySearchFilterItemConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSubCategorySearchFilterItemConnection"')
      return SubCategorySearchFilterItemConnection_possibleTypes.includes(obj.__typename)
    }
    


    const SubCategorySearchFilterItemEdge_possibleTypes: string[] = ['SubCategorySearchFilterItemEdge']
    export const isSubCategorySearchFilterItemEdge = (obj?: { __typename?: any } | null): obj is SubCategorySearchFilterItemEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSubCategorySearchFilterItemEdge"')
      return SubCategorySearchFilterItemEdge_possibleTypes.includes(obj.__typename)
    }
    


    const SwatchOptionValue_possibleTypes: string[] = ['SwatchOptionValue']
    export const isSwatchOptionValue = (obj?: { __typename?: any } | null): obj is SwatchOptionValue => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isSwatchOptionValue"')
      return SwatchOptionValue_possibleTypes.includes(obj.__typename)
    }
    


    const TaxDisplaySettings_possibleTypes: string[] = ['TaxDisplaySettings']
    export const isTaxDisplaySettings = (obj?: { __typename?: any } | null): obj is TaxDisplaySettings => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTaxDisplaySettings"')
      return TaxDisplaySettings_possibleTypes.includes(obj.__typename)
    }
    


    const TextFieldOption_possibleTypes: string[] = ['TextFieldOption']
    export const isTextFieldOption = (obj?: { __typename?: any } | null): obj is TextFieldOption => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isTextFieldOption"')
      return TextFieldOption_possibleTypes.includes(obj.__typename)
    }
    


    const UnassignCartFromCustomerResult_possibleTypes: string[] = ['UnassignCartFromCustomerResult']
    export const isUnassignCartFromCustomerResult = (obj?: { __typename?: any } | null): obj is UnassignCartFromCustomerResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUnassignCartFromCustomerResult"')
      return UnassignCartFromCustomerResult_possibleTypes.includes(obj.__typename)
    }
    


    const UpdateCartCurrencyResult_possibleTypes: string[] = ['UpdateCartCurrencyResult']
    export const isUpdateCartCurrencyResult = (obj?: { __typename?: any } | null): obj is UpdateCartCurrencyResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUpdateCartCurrencyResult"')
      return UpdateCartCurrencyResult_possibleTypes.includes(obj.__typename)
    }
    


    const UpdateCartLineItemResult_possibleTypes: string[] = ['UpdateCartLineItemResult']
    export const isUpdateCartLineItemResult = (obj?: { __typename?: any } | null): obj is UpdateCartLineItemResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUpdateCartLineItemResult"')
      return UpdateCartLineItemResult_possibleTypes.includes(obj.__typename)
    }
    


    const UpdateWishlistResult_possibleTypes: string[] = ['UpdateWishlistResult']
    export const isUpdateWishlistResult = (obj?: { __typename?: any } | null): obj is UpdateWishlistResult => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUpdateWishlistResult"')
      return UpdateWishlistResult_possibleTypes.includes(obj.__typename)
    }
    


    const UrlField_possibleTypes: string[] = ['UrlField']
    export const isUrlField = (obj?: { __typename?: any } | null): obj is UrlField => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isUrlField"')
      return UrlField_possibleTypes.includes(obj.__typename)
    }
    


    const Variant_possibleTypes: string[] = ['Variant']
    export const isVariant = (obj?: { __typename?: any } | null): obj is Variant => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isVariant"')
      return Variant_possibleTypes.includes(obj.__typename)
    }
    


    const VariantConnection_possibleTypes: string[] = ['VariantConnection']
    export const isVariantConnection = (obj?: { __typename?: any } | null): obj is VariantConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isVariantConnection"')
      return VariantConnection_possibleTypes.includes(obj.__typename)
    }
    


    const VariantEdge_possibleTypes: string[] = ['VariantEdge']
    export const isVariantEdge = (obj?: { __typename?: any } | null): obj is VariantEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isVariantEdge"')
      return VariantEdge_possibleTypes.includes(obj.__typename)
    }
    


    const VariantInventory_possibleTypes: string[] = ['VariantInventory']
    export const isVariantInventory = (obj?: { __typename?: any } | null): obj is VariantInventory => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isVariantInventory"')
      return VariantInventory_possibleTypes.includes(obj.__typename)
    }
    


    const WebPage_possibleTypes: string[] = ['BlogIndexPage','ContactPage','ExternalLinkPage','NormalPage','RawHtmlPage']
    export const isWebPage = (obj?: { __typename?: any } | null): obj is WebPage => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWebPage"')
      return WebPage_possibleTypes.includes(obj.__typename)
    }
    


    const Wishlist_possibleTypes: string[] = ['Wishlist']
    export const isWishlist = (obj?: { __typename?: any } | null): obj is Wishlist => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWishlist"')
      return Wishlist_possibleTypes.includes(obj.__typename)
    }
    


    const WishlistConnection_possibleTypes: string[] = ['WishlistConnection']
    export const isWishlistConnection = (obj?: { __typename?: any } | null): obj is WishlistConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWishlistConnection"')
      return WishlistConnection_possibleTypes.includes(obj.__typename)
    }
    


    const WishlistEdge_possibleTypes: string[] = ['WishlistEdge']
    export const isWishlistEdge = (obj?: { __typename?: any } | null): obj is WishlistEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWishlistEdge"')
      return WishlistEdge_possibleTypes.includes(obj.__typename)
    }
    


    const WishlistItem_possibleTypes: string[] = ['WishlistItem']
    export const isWishlistItem = (obj?: { __typename?: any } | null): obj is WishlistItem => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWishlistItem"')
      return WishlistItem_possibleTypes.includes(obj.__typename)
    }
    


    const WishlistItemConnection_possibleTypes: string[] = ['WishlistItemConnection']
    export const isWishlistItemConnection = (obj?: { __typename?: any } | null): obj is WishlistItemConnection => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWishlistItemConnection"')
      return WishlistItemConnection_possibleTypes.includes(obj.__typename)
    }
    


    const WishlistItemEdge_possibleTypes: string[] = ['WishlistItemEdge']
    export const isWishlistItemEdge = (obj?: { __typename?: any } | null): obj is WishlistItemEdge => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWishlistItemEdge"')
      return WishlistItemEdge_possibleTypes.includes(obj.__typename)
    }
    


    const WishlistMutations_possibleTypes: string[] = ['WishlistMutations']
    export const isWishlistMutations = (obj?: { __typename?: any } | null): obj is WishlistMutations => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isWishlistMutations"')
      return WishlistMutations_possibleTypes.includes(obj.__typename)
    }
    

export const enumBannerLocation = {
   BOTTOM: 'BOTTOM' as const,
   TOP: 'TOP' as const
}

export const enumCartGiftCertificateTheme = {
   BIRTHDAY: 'BIRTHDAY' as const,
   BOY: 'BOY' as const,
   CELEBRATION: 'CELEBRATION' as const,
   CHRISTMAS: 'CHRISTMAS' as const,
   GENERAL: 'GENERAL' as const,
   GIRL: 'GIRL' as const
}

export const enumCategoryProductSort = {
   A_TO_Z: 'A_TO_Z' as const,
   BEST_REVIEWED: 'BEST_REVIEWED' as const,
   BEST_SELLING: 'BEST_SELLING' as const,
   DEFAULT: 'DEFAULT' as const,
   FEATURED: 'FEATURED' as const,
   HIGHEST_PRICE: 'HIGHEST_PRICE' as const,
   LOWEST_PRICE: 'LOWEST_PRICE' as const,
   NEWEST: 'NEWEST' as const,
   Z_TO_A: 'Z_TO_A' as const
}

export const enumCurrencySymbolPosition = {
   LEFT: 'LEFT' as const,
   RIGHT: 'RIGHT' as const
}

export const enumEntityPageType = {
   BLOG_POST: 'BLOG_POST' as const,
   BRAND: 'BRAND' as const,
   CATEGORY: 'CATEGORY' as const,
   CONTACT_US: 'CONTACT_US' as const,
   PAGE: 'PAGE' as const,
   PRODUCT: 'PRODUCT' as const
}

export const enumLengthUnit = {
   Kilometres: 'Kilometres' as const,
   Miles: 'Miles' as const
}

export const enumLimitDateOption = {
   EARLIEST_DATE: 'EARLIEST_DATE' as const,
   LATEST_DATE: 'LATEST_DATE' as const,
   NO_LIMIT: 'NO_LIMIT' as const,
   RANGE: 'RANGE' as const
}

export const enumLimitInputBy = {
   HIGHEST_VALUE: 'HIGHEST_VALUE' as const,
   LOWEST_VALUE: 'LOWEST_VALUE' as const,
   NO_LIMIT: 'NO_LIMIT' as const,
   RANGE: 'RANGE' as const
}

export const enumOptionOutOfStockBehavior = {
   DO_NOTHING: 'DO_NOTHING' as const,
   HIDE_OPTION: 'HIDE_OPTION' as const,
   LABEL_OPTION: 'LABEL_OPTION' as const
}

export const enumPageType = {
   ACCOUNT_ADDRESS: 'ACCOUNT_ADDRESS' as const,
   ACCOUNT_ADD_ADDRESS: 'ACCOUNT_ADD_ADDRESS' as const,
   ACCOUNT_ADD_RETURN: 'ACCOUNT_ADD_RETURN' as const,
   ACCOUNT_ADD_WISHLIST: 'ACCOUNT_ADD_WISHLIST' as const,
   ACCOUNT_DOWNLOAD_ITEM: 'ACCOUNT_DOWNLOAD_ITEM' as const,
   ACCOUNT_EDIT: 'ACCOUNT_EDIT' as const,
   ACCOUNT_INBOX: 'ACCOUNT_INBOX' as const,
   ACCOUNT_ORDERS_ALL: 'ACCOUNT_ORDERS_ALL' as const,
   ACCOUNT_ORDERS_COMPLETED: 'ACCOUNT_ORDERS_COMPLETED' as const,
   ACCOUNT_ORDERS_DETAILS: 'ACCOUNT_ORDERS_DETAILS' as const,
   ACCOUNT_ORDERS_INVOICE: 'ACCOUNT_ORDERS_INVOICE' as const,
   ACCOUNT_RECENT_ITEMS: 'ACCOUNT_RECENT_ITEMS' as const,
   ACCOUNT_RETURNS: 'ACCOUNT_RETURNS' as const,
   ACCOUNT_RETURN_SAVED: 'ACCOUNT_RETURN_SAVED' as const,
   ACCOUNT_WISHLISTS: 'ACCOUNT_WISHLISTS' as const,
   ACCOUNT_WISHLIST_DETAILS: 'ACCOUNT_WISHLIST_DETAILS' as const,
   AUTH_ACCOUNT_CREATED: 'AUTH_ACCOUNT_CREATED' as const,
   AUTH_CREATE_ACC: 'AUTH_CREATE_ACC' as const,
   AUTH_FORGOT_PASS: 'AUTH_FORGOT_PASS' as const,
   AUTH_LOGIN: 'AUTH_LOGIN' as const,
   AUTH_NEW_PASS: 'AUTH_NEW_PASS' as const,
   BLOG: 'BLOG' as const,
   BRANDS: 'BRANDS' as const,
   CART: 'CART' as const,
   COMPARE: 'COMPARE' as const,
   GIFT_CERT_BALANCE: 'GIFT_CERT_BALANCE' as const,
   GIFT_CERT_PURCHASE: 'GIFT_CERT_PURCHASE' as const,
   GIFT_CERT_REDEEM: 'GIFT_CERT_REDEEM' as const,
   HOME: 'HOME' as const,
   ORDER_INFO: 'ORDER_INFO' as const,
   SEARCH: 'SEARCH' as const,
   SITEMAP: 'SITEMAP' as const,
   SUBSCRIBED: 'SUBSCRIBED' as const,
   UNSUBSCRIBE: 'UNSUBSCRIBE' as const
}

export const enumProductAvailabilityStatus = {
   Available: 'Available' as const,
   Preorder: 'Preorder' as const,
   Unavailable: 'Unavailable' as const
}

export const enumProductConditionType = {
   NEW: 'NEW' as const,
   REFURBISHED: 'REFURBISHED' as const,
   USED: 'USED' as const
}

export const enumProductOutOfStockBehavior = {
   DO_NOTHING: 'DO_NOTHING' as const,
   HIDE_PRODUCT: 'HIDE_PRODUCT' as const,
   HIDE_PRODUCT_AND_ACCESSIBLE: 'HIDE_PRODUCT_AND_ACCESSIBLE' as const,
   HIDE_PRODUCT_AND_REDIRECT: 'HIDE_PRODUCT_AND_REDIRECT' as const
}

export const enumProductReviewsSortInput = {
   HIGHEST_RATING: 'HIGHEST_RATING' as const,
   LOWEST_RATING: 'LOWEST_RATING' as const,
   NEWEST: 'NEWEST' as const,
   OLDEST: 'OLDEST' as const
}

export const enumSearchProductsSortInput = {
   A_TO_Z: 'A_TO_Z' as const,
   BEST_REVIEWED: 'BEST_REVIEWED' as const,
   BEST_SELLING: 'BEST_SELLING' as const,
   FEATURED: 'FEATURED' as const,
   HIGHEST_PRICE: 'HIGHEST_PRICE' as const,
   LOWEST_PRICE: 'LOWEST_PRICE' as const,
   NEWEST: 'NEWEST' as const,
   RELEVANCE: 'RELEVANCE' as const,
   Z_TO_A: 'Z_TO_A' as const
}

export const enumStockLevelDisplay = {
   DONT_SHOW: 'DONT_SHOW' as const,
   SHOW: 'SHOW' as const,
   SHOW_WHEN_LOW: 'SHOW_WHEN_LOW' as const
}

export const enumStorefrontStatusType = {
   HIBERNATION: 'HIBERNATION' as const,
   LAUNCHED: 'LAUNCHED' as const,
   MAINTENANCE: 'MAINTENANCE' as const,
   PRE_LAUNCH: 'PRE_LAUNCH' as const
}

export const enumTaxPriceDisplay = {
   BOTH: 'BOTH' as const,
   EX: 'EX' as const,
   INC: 'INC' as const
}

export const enumWebPageType = {
   BLOG: 'BLOG' as const,
   CONTACT: 'CONTACT' as const,
   LINK: 'LINK' as const,
   NORMAL: 'NORMAL' as const,
   RAW: 'RAW' as const
}

export const enumCountryCode = {
   AD: 'AD' as const,
   AE: 'AE' as const,
   AF: 'AF' as const,
   AG: 'AG' as const,
   AI: 'AI' as const,
   AL: 'AL' as const,
   AM: 'AM' as const,
   AO: 'AO' as const,
   AQ: 'AQ' as const,
   AR: 'AR' as const,
   AS: 'AS' as const,
   AT: 'AT' as const,
   AU: 'AU' as const,
   AW: 'AW' as const,
   AX: 'AX' as const,
   AZ: 'AZ' as const,
   BA: 'BA' as const,
   BB: 'BB' as const,
   BD: 'BD' as const,
   BE: 'BE' as const,
   BF: 'BF' as const,
   BG: 'BG' as const,
   BH: 'BH' as const,
   BI: 'BI' as const,
   BJ: 'BJ' as const,
   BL: 'BL' as const,
   BM: 'BM' as const,
   BN: 'BN' as const,
   BO: 'BO' as const,
   BQ: 'BQ' as const,
   BR: 'BR' as const,
   BS: 'BS' as const,
   BT: 'BT' as const,
   BV: 'BV' as const,
   BW: 'BW' as const,
   BY: 'BY' as const,
   BZ: 'BZ' as const,
   CA: 'CA' as const,
   CC: 'CC' as const,
   CD: 'CD' as const,
   CF: 'CF' as const,
   CG: 'CG' as const,
   CH: 'CH' as const,
   CI: 'CI' as const,
   CK: 'CK' as const,
   CL: 'CL' as const,
   CM: 'CM' as const,
   CN: 'CN' as const,
   CO: 'CO' as const,
   CR: 'CR' as const,
   CU: 'CU' as const,
   CV: 'CV' as const,
   CW: 'CW' as const,
   CX: 'CX' as const,
   CY: 'CY' as const,
   CZ: 'CZ' as const,
   DE: 'DE' as const,
   DJ: 'DJ' as const,
   DK: 'DK' as const,
   DM: 'DM' as const,
   DO: 'DO' as const,
   DZ: 'DZ' as const,
   EC: 'EC' as const,
   EE: 'EE' as const,
   EG: 'EG' as const,
   EH: 'EH' as const,
   ER: 'ER' as const,
   ES: 'ES' as const,
   ET: 'ET' as const,
   FI: 'FI' as const,
   FJ: 'FJ' as const,
   FK: 'FK' as const,
   FM: 'FM' as const,
   FO: 'FO' as const,
   FR: 'FR' as const,
   GA: 'GA' as const,
   GB: 'GB' as const,
   GD: 'GD' as const,
   GE: 'GE' as const,
   GF: 'GF' as const,
   GG: 'GG' as const,
   GH: 'GH' as const,
   GI: 'GI' as const,
   GL: 'GL' as const,
   GM: 'GM' as const,
   GN: 'GN' as const,
   GP: 'GP' as const,
   GQ: 'GQ' as const,
   GR: 'GR' as const,
   GS: 'GS' as const,
   GT: 'GT' as const,
   GU: 'GU' as const,
   GW: 'GW' as const,
   GY: 'GY' as const,
   HK: 'HK' as const,
   HM: 'HM' as const,
   HN: 'HN' as const,
   HR: 'HR' as const,
   HT: 'HT' as const,
   HU: 'HU' as const,
   ID: 'ID' as const,
   IE: 'IE' as const,
   IL: 'IL' as const,
   IM: 'IM' as const,
   IN: 'IN' as const,
   IO: 'IO' as const,
   IQ: 'IQ' as const,
   IR: 'IR' as const,
   IS: 'IS' as const,
   IT: 'IT' as const,
   JE: 'JE' as const,
   JM: 'JM' as const,
   JO: 'JO' as const,
   JP: 'JP' as const,
   KE: 'KE' as const,
   KG: 'KG' as const,
   KH: 'KH' as const,
   KI: 'KI' as const,
   KM: 'KM' as const,
   KN: 'KN' as const,
   KP: 'KP' as const,
   KR: 'KR' as const,
   KW: 'KW' as const,
   KY: 'KY' as const,
   KZ: 'KZ' as const,
   LA: 'LA' as const,
   LB: 'LB' as const,
   LC: 'LC' as const,
   LI: 'LI' as const,
   LK: 'LK' as const,
   LR: 'LR' as const,
   LS: 'LS' as const,
   LT: 'LT' as const,
   LU: 'LU' as const,
   LV: 'LV' as const,
   LY: 'LY' as const,
   MA: 'MA' as const,
   MC: 'MC' as const,
   MD: 'MD' as const,
   ME: 'ME' as const,
   MF: 'MF' as const,
   MG: 'MG' as const,
   MH: 'MH' as const,
   MK: 'MK' as const,
   ML: 'ML' as const,
   MM: 'MM' as const,
   MN: 'MN' as const,
   MO: 'MO' as const,
   MP: 'MP' as const,
   MQ: 'MQ' as const,
   MR: 'MR' as const,
   MS: 'MS' as const,
   MT: 'MT' as const,
   MU: 'MU' as const,
   MV: 'MV' as const,
   MW: 'MW' as const,
   MX: 'MX' as const,
   MY: 'MY' as const,
   MZ: 'MZ' as const,
   NA: 'NA' as const,
   NC: 'NC' as const,
   NE: 'NE' as const,
   NF: 'NF' as const,
   NG: 'NG' as const,
   NI: 'NI' as const,
   NL: 'NL' as const,
   NO: 'NO' as const,
   NP: 'NP' as const,
   NR: 'NR' as const,
   NU: 'NU' as const,
   NZ: 'NZ' as const,
   OM: 'OM' as const,
   PA: 'PA' as const,
   PE: 'PE' as const,
   PF: 'PF' as const,
   PG: 'PG' as const,
   PH: 'PH' as const,
   PK: 'PK' as const,
   PL: 'PL' as const,
   PM: 'PM' as const,
   PN: 'PN' as const,
   PR: 'PR' as const,
   PS: 'PS' as const,
   PT: 'PT' as const,
   PW: 'PW' as const,
   PY: 'PY' as const,
   QA: 'QA' as const,
   RE: 'RE' as const,
   RO: 'RO' as const,
   RS: 'RS' as const,
   RU: 'RU' as const,
   RW: 'RW' as const,
   SA: 'SA' as const,
   SB: 'SB' as const,
   SC: 'SC' as const,
   SD: 'SD' as const,
   SE: 'SE' as const,
   SG: 'SG' as const,
   SH: 'SH' as const,
   SI: 'SI' as const,
   SJ: 'SJ' as const,
   SK: 'SK' as const,
   SL: 'SL' as const,
   SM: 'SM' as const,
   SN: 'SN' as const,
   SO: 'SO' as const,
   SR: 'SR' as const,
   SS: 'SS' as const,
   ST: 'ST' as const,
   SV: 'SV' as const,
   SX: 'SX' as const,
   SY: 'SY' as const,
   SZ: 'SZ' as const,
   TC: 'TC' as const,
   TD: 'TD' as const,
   TF: 'TF' as const,
   TG: 'TG' as const,
   TH: 'TH' as const,
   TJ: 'TJ' as const,
   TK: 'TK' as const,
   TL: 'TL' as const,
   TM: 'TM' as const,
   TN: 'TN' as const,
   TO: 'TO' as const,
   TR: 'TR' as const,
   TT: 'TT' as const,
   TV: 'TV' as const,
   TW: 'TW' as const,
   TZ: 'TZ' as const,
   UA: 'UA' as const,
   UG: 'UG' as const,
   UM: 'UM' as const,
   US: 'US' as const,
   UY: 'UY' as const,
   UZ: 'UZ' as const,
   VA: 'VA' as const,
   VC: 'VC' as const,
   VE: 'VE' as const,
   VG: 'VG' as const,
   VI: 'VI' as const,
   VN: 'VN' as const,
   VU: 'VU' as const,
   WF: 'WF' as const,
   WS: 'WS' as const,
   YE: 'YE' as const,
   YT: 'YT' as const,
   ZA: 'ZA' as const,
   ZM: 'ZM' as const,
   ZW: 'ZW' as const
}

export const enumCurrencyCode = {
   ADP: 'ADP' as const,
   AED: 'AED' as const,
   AFA: 'AFA' as const,
   AFN: 'AFN' as const,
   ALK: 'ALK' as const,
   ALL: 'ALL' as const,
   AMD: 'AMD' as const,
   ANG: 'ANG' as const,
   AOA: 'AOA' as const,
   AOK: 'AOK' as const,
   AON: 'AON' as const,
   AOR: 'AOR' as const,
   ARA: 'ARA' as const,
   ARL: 'ARL' as const,
   ARM: 'ARM' as const,
   ARP: 'ARP' as const,
   ARS: 'ARS' as const,
   ATS: 'ATS' as const,
   AUD: 'AUD' as const,
   AWG: 'AWG' as const,
   AZM: 'AZM' as const,
   AZN: 'AZN' as const,
   BAD: 'BAD' as const,
   BAM: 'BAM' as const,
   BAN: 'BAN' as const,
   BBD: 'BBD' as const,
   BDT: 'BDT' as const,
   BEC: 'BEC' as const,
   BEF: 'BEF' as const,
   BEL: 'BEL' as const,
   BGL: 'BGL' as const,
   BGM: 'BGM' as const,
   BGN: 'BGN' as const,
   BGO: 'BGO' as const,
   BHD: 'BHD' as const,
   BIF: 'BIF' as const,
   BMD: 'BMD' as const,
   BND: 'BND' as const,
   BOB: 'BOB' as const,
   BOL: 'BOL' as const,
   BOP: 'BOP' as const,
   BOV: 'BOV' as const,
   BRB: 'BRB' as const,
   BRC: 'BRC' as const,
   BRE: 'BRE' as const,
   BRL: 'BRL' as const,
   BRN: 'BRN' as const,
   BRR: 'BRR' as const,
   BRZ: 'BRZ' as const,
   BSD: 'BSD' as const,
   BTN: 'BTN' as const,
   BUK: 'BUK' as const,
   BWP: 'BWP' as const,
   BYB: 'BYB' as const,
   BYN: 'BYN' as const,
   BYR: 'BYR' as const,
   BZD: 'BZD' as const,
   CAD: 'CAD' as const,
   CDF: 'CDF' as const,
   CHE: 'CHE' as const,
   CHF: 'CHF' as const,
   CHW: 'CHW' as const,
   CLE: 'CLE' as const,
   CLF: 'CLF' as const,
   CLP: 'CLP' as const,
   CNX: 'CNX' as const,
   CNY: 'CNY' as const,
   COP: 'COP' as const,
   COU: 'COU' as const,
   CRC: 'CRC' as const,
   CSD: 'CSD' as const,
   CSK: 'CSK' as const,
   CUC: 'CUC' as const,
   CUP: 'CUP' as const,
   CVE: 'CVE' as const,
   CYP: 'CYP' as const,
   CZK: 'CZK' as const,
   DDM: 'DDM' as const,
   DEM: 'DEM' as const,
   DJF: 'DJF' as const,
   DKK: 'DKK' as const,
   DOP: 'DOP' as const,
   DZD: 'DZD' as const,
   ECS: 'ECS' as const,
   ECV: 'ECV' as const,
   EEK: 'EEK' as const,
   EGP: 'EGP' as const,
   ERN: 'ERN' as const,
   ESA: 'ESA' as const,
   ESB: 'ESB' as const,
   ESP: 'ESP' as const,
   ETB: 'ETB' as const,
   EUR: 'EUR' as const,
   FIM: 'FIM' as const,
   FJD: 'FJD' as const,
   FKP: 'FKP' as const,
   FRF: 'FRF' as const,
   GBP: 'GBP' as const,
   GEK: 'GEK' as const,
   GEL: 'GEL' as const,
   GHC: 'GHC' as const,
   GHS: 'GHS' as const,
   GIP: 'GIP' as const,
   GMD: 'GMD' as const,
   GNF: 'GNF' as const,
   GNS: 'GNS' as const,
   GQE: 'GQE' as const,
   GRD: 'GRD' as const,
   GTQ: 'GTQ' as const,
   GWE: 'GWE' as const,
   GWP: 'GWP' as const,
   GYD: 'GYD' as const,
   HKD: 'HKD' as const,
   HNL: 'HNL' as const,
   HRD: 'HRD' as const,
   HRK: 'HRK' as const,
   HTG: 'HTG' as const,
   HUF: 'HUF' as const,
   IDR: 'IDR' as const,
   IEP: 'IEP' as const,
   ILP: 'ILP' as const,
   ILR: 'ILR' as const,
   ILS: 'ILS' as const,
   INR: 'INR' as const,
   IQD: 'IQD' as const,
   IRR: 'IRR' as const,
   ISJ: 'ISJ' as const,
   ISK: 'ISK' as const,
   ITL: 'ITL' as const,
   JMD: 'JMD' as const,
   JOD: 'JOD' as const,
   JPY: 'JPY' as const,
   KES: 'KES' as const,
   KGS: 'KGS' as const,
   KHR: 'KHR' as const,
   KMF: 'KMF' as const,
   KPW: 'KPW' as const,
   KRH: 'KRH' as const,
   KRO: 'KRO' as const,
   KRW: 'KRW' as const,
   KWD: 'KWD' as const,
   KYD: 'KYD' as const,
   KZT: 'KZT' as const,
   LAK: 'LAK' as const,
   LBP: 'LBP' as const,
   LKR: 'LKR' as const,
   LRD: 'LRD' as const,
   LSL: 'LSL' as const,
   LTL: 'LTL' as const,
   LTT: 'LTT' as const,
   LUC: 'LUC' as const,
   LUF: 'LUF' as const,
   LUL: 'LUL' as const,
   LVL: 'LVL' as const,
   LVR: 'LVR' as const,
   LYD: 'LYD' as const,
   MAD: 'MAD' as const,
   MAF: 'MAF' as const,
   MCF: 'MCF' as const,
   MDC: 'MDC' as const,
   MDL: 'MDL' as const,
   MGA: 'MGA' as const,
   MGF: 'MGF' as const,
   MKD: 'MKD' as const,
   MKN: 'MKN' as const,
   MLF: 'MLF' as const,
   MMK: 'MMK' as const,
   MNT: 'MNT' as const,
   MOP: 'MOP' as const,
   MRO: 'MRO' as const,
   MTL: 'MTL' as const,
   MTP: 'MTP' as const,
   MUR: 'MUR' as const,
   MVP: 'MVP' as const,
   MVR: 'MVR' as const,
   MWK: 'MWK' as const,
   MXN: 'MXN' as const,
   MXP: 'MXP' as const,
   MXV: 'MXV' as const,
   MYR: 'MYR' as const,
   MZE: 'MZE' as const,
   MZM: 'MZM' as const,
   MZN: 'MZN' as const,
   NAD: 'NAD' as const,
   NGN: 'NGN' as const,
   NIC: 'NIC' as const,
   NIO: 'NIO' as const,
   NLG: 'NLG' as const,
   NOK: 'NOK' as const,
   NPR: 'NPR' as const,
   NZD: 'NZD' as const,
   OMR: 'OMR' as const,
   PAB: 'PAB' as const,
   PEI: 'PEI' as const,
   PEN: 'PEN' as const,
   PES: 'PES' as const,
   PGK: 'PGK' as const,
   PHP: 'PHP' as const,
   PKR: 'PKR' as const,
   PLN: 'PLN' as const,
   PLZ: 'PLZ' as const,
   PTE: 'PTE' as const,
   PYG: 'PYG' as const,
   QAR: 'QAR' as const,
   RHD: 'RHD' as const,
   ROL: 'ROL' as const,
   RON: 'RON' as const,
   RSD: 'RSD' as const,
   RUB: 'RUB' as const,
   RUR: 'RUR' as const,
   RWF: 'RWF' as const,
   SAR: 'SAR' as const,
   SBD: 'SBD' as const,
   SCR: 'SCR' as const,
   SDD: 'SDD' as const,
   SDG: 'SDG' as const,
   SDP: 'SDP' as const,
   SEK: 'SEK' as const,
   SGD: 'SGD' as const,
   SHP: 'SHP' as const,
   SIT: 'SIT' as const,
   SKK: 'SKK' as const,
   SLL: 'SLL' as const,
   SOS: 'SOS' as const,
   SRD: 'SRD' as const,
   SRG: 'SRG' as const,
   SSP: 'SSP' as const,
   STD: 'STD' as const,
   SUR: 'SUR' as const,
   SVC: 'SVC' as const,
   SYP: 'SYP' as const,
   SZL: 'SZL' as const,
   THB: 'THB' as const,
   TJR: 'TJR' as const,
   TJS: 'TJS' as const,
   TMM: 'TMM' as const,
   TMT: 'TMT' as const,
   TND: 'TND' as const,
   TOP: 'TOP' as const,
   TPE: 'TPE' as const,
   TRL: 'TRL' as const,
   TRY: 'TRY' as const,
   TTD: 'TTD' as const,
   TWD: 'TWD' as const,
   TZS: 'TZS' as const,
   UAH: 'UAH' as const,
   UAK: 'UAK' as const,
   UGS: 'UGS' as const,
   UGX: 'UGX' as const,
   USD: 'USD' as const,
   USN: 'USN' as const,
   USS: 'USS' as const,
   UYI: 'UYI' as const,
   UYP: 'UYP' as const,
   UYU: 'UYU' as const,
   UZS: 'UZS' as const,
   VEB: 'VEB' as const,
   VEF: 'VEF' as const,
   VND: 'VND' as const,
   VNN: 'VNN' as const,
   VUV: 'VUV' as const,
   WST: 'WST' as const,
   XAF: 'XAF' as const,
   XCD: 'XCD' as const,
   XEU: 'XEU' as const,
   XFO: 'XFO' as const,
   XFU: 'XFU' as const,
   XOF: 'XOF' as const,
   XPF: 'XPF' as const,
   XRE: 'XRE' as const,
   YDD: 'YDD' as const,
   YER: 'YER' as const,
   YUD: 'YUD' as const,
   YUM: 'YUM' as const,
   YUN: 'YUN' as const,
   YUR: 'YUR' as const,
   ZAL: 'ZAL' as const,
   ZAR: 'ZAR' as const,
   ZMK: 'ZMK' as const,
   ZMW: 'ZMW' as const,
   ZRN: 'ZRN' as const,
   ZRZ: 'ZRZ' as const,
   ZWD: 'ZWD' as const,
   ZWL: 'ZWL' as const,
   ZWR: 'ZWR' as const
}

export const enumSortBy = {
   NEWEST: 'NEWEST' as const,
   OLDEST: 'OLDEST' as const
}
