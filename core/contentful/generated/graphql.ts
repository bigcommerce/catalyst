import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  DateTime: { input: string; output: string };
  Dimension: { input: any; output: any };
  HexColor: { input: any; output: any };
  JSON: { input: any; output: any };
  Quality: { input: any; output: any };
};

/** Represents a binary file in a space. An asset can be any file type. */
export type Asset = {
  __typename?: 'Asset';
  contentType?: Maybe<Scalars['String']['output']>;
  contentfulMetadata: ContentfulMetadata;
  description?: Maybe<Scalars['String']['output']>;
  fileName?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['Int']['output']>;
  linkedFrom?: Maybe<AssetLinkingCollections>;
  size?: Maybe<Scalars['Int']['output']>;
  sys: Sys;
  title?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  width?: Maybe<Scalars['Int']['output']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetContentTypeArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetDescriptionArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetFileNameArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetHeightArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetLinkedFromArgs = {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetSizeArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetTitleArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetUrlArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
  transform?: InputMaybe<ImageTransformOptions>;
};

/** Represents a binary file in a space. An asset can be any file type. */
export type AssetWidthArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

export type AssetCollection = {
  __typename?: 'AssetCollection';
  items: Array<Maybe<Asset>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type AssetFilter = {
  AND?: InputMaybe<Array<InputMaybe<AssetFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<AssetFilter>>>;
  contentType?: InputMaybe<Scalars['String']['input']>;
  contentType_contains?: InputMaybe<Scalars['String']['input']>;
  contentType_exists?: InputMaybe<Scalars['Boolean']['input']>;
  contentType_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  contentType_not?: InputMaybe<Scalars['String']['input']>;
  contentType_not_contains?: InputMaybe<Scalars['String']['input']>;
  contentType_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  description?: InputMaybe<Scalars['String']['input']>;
  description_contains?: InputMaybe<Scalars['String']['input']>;
  description_exists?: InputMaybe<Scalars['Boolean']['input']>;
  description_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description_not?: InputMaybe<Scalars['String']['input']>;
  description_not_contains?: InputMaybe<Scalars['String']['input']>;
  description_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  fileName?: InputMaybe<Scalars['String']['input']>;
  fileName_contains?: InputMaybe<Scalars['String']['input']>;
  fileName_exists?: InputMaybe<Scalars['Boolean']['input']>;
  fileName_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  fileName_not?: InputMaybe<Scalars['String']['input']>;
  fileName_not_contains?: InputMaybe<Scalars['String']['input']>;
  fileName_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  height?: InputMaybe<Scalars['Int']['input']>;
  height_exists?: InputMaybe<Scalars['Boolean']['input']>;
  height_gt?: InputMaybe<Scalars['Int']['input']>;
  height_gte?: InputMaybe<Scalars['Int']['input']>;
  height_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  height_lt?: InputMaybe<Scalars['Int']['input']>;
  height_lte?: InputMaybe<Scalars['Int']['input']>;
  height_not?: InputMaybe<Scalars['Int']['input']>;
  height_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  size?: InputMaybe<Scalars['Int']['input']>;
  size_exists?: InputMaybe<Scalars['Boolean']['input']>;
  size_gt?: InputMaybe<Scalars['Int']['input']>;
  size_gte?: InputMaybe<Scalars['Int']['input']>;
  size_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  size_lt?: InputMaybe<Scalars['Int']['input']>;
  size_lte?: InputMaybe<Scalars['Int']['input']>;
  size_not?: InputMaybe<Scalars['Int']['input']>;
  size_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  sys?: InputMaybe<SysFilter>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_contains?: InputMaybe<Scalars['String']['input']>;
  title_exists?: InputMaybe<Scalars['Boolean']['input']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title_not?: InputMaybe<Scalars['String']['input']>;
  title_not_contains?: InputMaybe<Scalars['String']['input']>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  url?: InputMaybe<Scalars['String']['input']>;
  url_contains?: InputMaybe<Scalars['String']['input']>;
  url_exists?: InputMaybe<Scalars['Boolean']['input']>;
  url_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  url_not?: InputMaybe<Scalars['String']['input']>;
  url_not_contains?: InputMaybe<Scalars['String']['input']>;
  url_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  width?: InputMaybe<Scalars['Int']['input']>;
  width_exists?: InputMaybe<Scalars['Boolean']['input']>;
  width_gt?: InputMaybe<Scalars['Int']['input']>;
  width_gte?: InputMaybe<Scalars['Int']['input']>;
  width_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  width_lt?: InputMaybe<Scalars['Int']['input']>;
  width_lte?: InputMaybe<Scalars['Int']['input']>;
  width_not?: InputMaybe<Scalars['Int']['input']>;
  width_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type AssetLinkingCollections = {
  __typename?: 'AssetLinkingCollections';
  cardCollection?: Maybe<CardCollection>;
  carouselCollection?: Maybe<CarouselCollection>;
  entryCollection?: Maybe<EntryCollection>;
  landingPageCollection?: Maybe<LandingPageCollection>;
  personaTypeCollection?: Maybe<PersonaTypeCollection>;
  slideCollection?: Maybe<SlideCollection>;
};

export type AssetLinkingCollectionsCardCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type AssetLinkingCollectionsCarouselCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type AssetLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type AssetLinkingCollectionsLandingPageCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type AssetLinkingCollectionsPersonaTypeCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type AssetLinkingCollectionsSlideCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum AssetOrder {
  ContentTypeAsc = 'contentType_ASC',
  ContentTypeDesc = 'contentType_DESC',
  FileNameAsc = 'fileName_ASC',
  FileNameDesc = 'fileName_DESC',
  HeightAsc = 'height_ASC',
  HeightDesc = 'height_DESC',
  SizeAsc = 'size_ASC',
  SizeDesc = 'size_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  UrlAsc = 'url_ASC',
  UrlDesc = 'url_DESC',
  WidthAsc = 'width_ASC',
  WidthDesc = 'width_DESC',
}

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/banner) */
export type Banner = Entry &
  _Node & {
    __typename?: 'Banner';
    _id: Scalars['ID']['output'];
    bannerCardsCollection?: Maybe<BannerBannerCardsCollection>;
    bannerColour?: Maybe<Scalars['JSON']['output']>;
    contentfulMetadata: ContentfulMetadata;
    linkedFrom?: Maybe<BannerLinkingCollections>;
    order?: Maybe<Scalars['Int']['output']>;
    slug?: Maybe<Scalars['String']['output']>;
    sys: Sys;
    title?: Maybe<Scalars['String']['output']>;
  };

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/banner) */
export type BannerBannerCardsCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<BannerBannerCardsCollectionOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<CardFilter>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/banner) */
export type BannerBannerColourArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/banner) */
export type BannerLinkedFromArgs = {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/banner) */
export type BannerOrderArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/banner) */
export type BannerSlugArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/banner) */
export type BannerTitleArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

export type BannerBannerCardsCollection = {
  __typename?: 'BannerBannerCardsCollection';
  items: Array<Maybe<Card>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum BannerBannerCardsCollectionOrder {
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
}

export type BannerCollection = {
  __typename?: 'BannerCollection';
  items: Array<Maybe<Banner>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type BannerFilter = {
  AND?: InputMaybe<Array<InputMaybe<BannerFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<BannerFilter>>>;
  bannerCards?: InputMaybe<CfCardNestedFilter>;
  bannerCardsCollection_exists?: InputMaybe<Scalars['Boolean']['input']>;
  bannerColour_exists?: InputMaybe<Scalars['Boolean']['input']>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  order?: InputMaybe<Scalars['Int']['input']>;
  order_exists?: InputMaybe<Scalars['Boolean']['input']>;
  order_gt?: InputMaybe<Scalars['Int']['input']>;
  order_gte?: InputMaybe<Scalars['Int']['input']>;
  order_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  order_lt?: InputMaybe<Scalars['Int']['input']>;
  order_lte?: InputMaybe<Scalars['Int']['input']>;
  order_not?: InputMaybe<Scalars['Int']['input']>;
  order_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  slug?: InputMaybe<Scalars['String']['input']>;
  slug_contains?: InputMaybe<Scalars['String']['input']>;
  slug_exists?: InputMaybe<Scalars['Boolean']['input']>;
  slug_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  slug_not?: InputMaybe<Scalars['String']['input']>;
  slug_not_contains?: InputMaybe<Scalars['String']['input']>;
  slug_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sys?: InputMaybe<SysFilter>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_contains?: InputMaybe<Scalars['String']['input']>;
  title_exists?: InputMaybe<Scalars['Boolean']['input']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title_not?: InputMaybe<Scalars['String']['input']>;
  title_not_contains?: InputMaybe<Scalars['String']['input']>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type BannerLinkingCollections = {
  __typename?: 'BannerLinkingCollections';
  entryCollection?: Maybe<EntryCollection>;
};

export type BannerLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum BannerOrder {
  OrderAsc = 'order_ASC',
  OrderDesc = 'order_DESC',
  SlugAsc = 'slug_ASC',
  SlugDesc = 'slug_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
}

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/card) */
export type Card = Entry &
  _Node & {
    __typename?: 'Card';
    _id: Scalars['ID']['output'];
    body?: Maybe<CardBody>;
    contentfulMetadata: ContentfulMetadata;
    image?: Maybe<Asset>;
    linkedFrom?: Maybe<CardLinkingCollections>;
    sys: Sys;
    title?: Maybe<Scalars['String']['output']>;
  };

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/card) */
export type CardBodyArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/card) */
export type CardImageArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/card) */
export type CardLinkedFromArgs = {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/card) */
export type CardTitleArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

export type CardBody = {
  __typename?: 'CardBody';
  json: Scalars['JSON']['output'];
  links: CardBodyLinks;
};

export type CardBodyAssets = {
  __typename?: 'CardBodyAssets';
  block: Array<Maybe<Asset>>;
  hyperlink: Array<Maybe<Asset>>;
};

export type CardBodyEntries = {
  __typename?: 'CardBodyEntries';
  block: Array<Maybe<Entry>>;
  hyperlink: Array<Maybe<Entry>>;
  inline: Array<Maybe<Entry>>;
};

export type CardBodyLinks = {
  __typename?: 'CardBodyLinks';
  assets: CardBodyAssets;
  entries: CardBodyEntries;
  resources: CardBodyResources;
};

export type CardBodyResources = {
  __typename?: 'CardBodyResources';
  block: Array<CardBodyResourcesBlock>;
  hyperlink: Array<CardBodyResourcesHyperlink>;
  inline: Array<CardBodyResourcesInline>;
};

export type CardBodyResourcesBlock = ResourceLink & {
  __typename?: 'CardBodyResourcesBlock';
  sys: ResourceSys;
};

export type CardBodyResourcesHyperlink = ResourceLink & {
  __typename?: 'CardBodyResourcesHyperlink';
  sys: ResourceSys;
};

export type CardBodyResourcesInline = ResourceLink & {
  __typename?: 'CardBodyResourcesInline';
  sys: ResourceSys;
};

export type CardCollection = {
  __typename?: 'CardCollection';
  items: Array<Maybe<Card>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type CardFilter = {
  AND?: InputMaybe<Array<InputMaybe<CardFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<CardFilter>>>;
  body_contains?: InputMaybe<Scalars['String']['input']>;
  body_exists?: InputMaybe<Scalars['Boolean']['input']>;
  body_not_contains?: InputMaybe<Scalars['String']['input']>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  image_exists?: InputMaybe<Scalars['Boolean']['input']>;
  sys?: InputMaybe<SysFilter>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_contains?: InputMaybe<Scalars['String']['input']>;
  title_exists?: InputMaybe<Scalars['Boolean']['input']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title_not?: InputMaybe<Scalars['String']['input']>;
  title_not_contains?: InputMaybe<Scalars['String']['input']>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CardLinkingCollections = {
  __typename?: 'CardLinkingCollections';
  bannerCollection?: Maybe<BannerCollection>;
  entryCollection?: Maybe<EntryCollection>;
};

export type CardLinkingCollectionsBannerCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<CardLinkingCollectionsBannerCollectionOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type CardLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum CardLinkingCollectionsBannerCollectionOrder {
  OrderAsc = 'order_ASC',
  OrderDesc = 'order_DESC',
  SlugAsc = 'slug_ASC',
  SlugDesc = 'slug_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
}

export enum CardOrder {
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
}

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/carousel) */
export type Carousel = Entry &
  _Node & {
    __typename?: 'Carousel';
    _id: Scalars['ID']['output'];
    backgroundImage?: Maybe<Asset>;
    carouselBgColour?: Maybe<Scalars['JSON']['output']>;
    carouselType?: Maybe<Scalars['String']['output']>;
    contentfulMetadata: ContentfulMetadata;
    hideTitle?: Maybe<Scalars['Boolean']['output']>;
    introduction?: Maybe<CarouselIntroduction>;
    linkedFrom?: Maybe<CarouselLinkingCollections>;
    order?: Maybe<Scalars['Int']['output']>;
    slidesCollection?: Maybe<CarouselSlidesCollection>;
    slug?: Maybe<Scalars['String']['output']>;
    sys: Sys;
    title?: Maybe<Scalars['String']['output']>;
  };

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/carousel) */
export type CarouselBackgroundImageArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/carousel) */
export type CarouselCarouselBgColourArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/carousel) */
export type CarouselCarouselTypeArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/carousel) */
export type CarouselHideTitleArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/carousel) */
export type CarouselIntroductionArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/carousel) */
export type CarouselLinkedFromArgs = {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/carousel) */
export type CarouselOrderArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/carousel) */
export type CarouselSlidesCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<CarouselSlidesCollectionOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<SlideFilter>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/carousel) */
export type CarouselSlugArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/carousel) */
export type CarouselTitleArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

export type CarouselCollection = {
  __typename?: 'CarouselCollection';
  items: Array<Maybe<Carousel>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type CarouselFilter = {
  AND?: InputMaybe<Array<InputMaybe<CarouselFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<CarouselFilter>>>;
  backgroundImage_exists?: InputMaybe<Scalars['Boolean']['input']>;
  carouselBgColour_exists?: InputMaybe<Scalars['Boolean']['input']>;
  carouselType?: InputMaybe<Scalars['String']['input']>;
  carouselType_contains?: InputMaybe<Scalars['String']['input']>;
  carouselType_exists?: InputMaybe<Scalars['Boolean']['input']>;
  carouselType_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  carouselType_not?: InputMaybe<Scalars['String']['input']>;
  carouselType_not_contains?: InputMaybe<Scalars['String']['input']>;
  carouselType_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  hideTitle?: InputMaybe<Scalars['Boolean']['input']>;
  hideTitle_exists?: InputMaybe<Scalars['Boolean']['input']>;
  hideTitle_not?: InputMaybe<Scalars['Boolean']['input']>;
  introduction_contains?: InputMaybe<Scalars['String']['input']>;
  introduction_exists?: InputMaybe<Scalars['Boolean']['input']>;
  introduction_not_contains?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  order_exists?: InputMaybe<Scalars['Boolean']['input']>;
  order_gt?: InputMaybe<Scalars['Int']['input']>;
  order_gte?: InputMaybe<Scalars['Int']['input']>;
  order_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  order_lt?: InputMaybe<Scalars['Int']['input']>;
  order_lte?: InputMaybe<Scalars['Int']['input']>;
  order_not?: InputMaybe<Scalars['Int']['input']>;
  order_not_in?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  slides?: InputMaybe<CfSlideNestedFilter>;
  slidesCollection_exists?: InputMaybe<Scalars['Boolean']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  slug_contains?: InputMaybe<Scalars['String']['input']>;
  slug_exists?: InputMaybe<Scalars['Boolean']['input']>;
  slug_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  slug_not?: InputMaybe<Scalars['String']['input']>;
  slug_not_contains?: InputMaybe<Scalars['String']['input']>;
  slug_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sys?: InputMaybe<SysFilter>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_contains?: InputMaybe<Scalars['String']['input']>;
  title_exists?: InputMaybe<Scalars['Boolean']['input']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title_not?: InputMaybe<Scalars['String']['input']>;
  title_not_contains?: InputMaybe<Scalars['String']['input']>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CarouselIntroduction = {
  __typename?: 'CarouselIntroduction';
  json: Scalars['JSON']['output'];
  links: CarouselIntroductionLinks;
};

export type CarouselIntroductionAssets = {
  __typename?: 'CarouselIntroductionAssets';
  block: Array<Maybe<Asset>>;
  hyperlink: Array<Maybe<Asset>>;
};

export type CarouselIntroductionEntries = {
  __typename?: 'CarouselIntroductionEntries';
  block: Array<Maybe<Entry>>;
  hyperlink: Array<Maybe<Entry>>;
  inline: Array<Maybe<Entry>>;
};

export type CarouselIntroductionLinks = {
  __typename?: 'CarouselIntroductionLinks';
  assets: CarouselIntroductionAssets;
  entries: CarouselIntroductionEntries;
  resources: CarouselIntroductionResources;
};

export type CarouselIntroductionResources = {
  __typename?: 'CarouselIntroductionResources';
  block: Array<CarouselIntroductionResourcesBlock>;
  hyperlink: Array<CarouselIntroductionResourcesHyperlink>;
  inline: Array<CarouselIntroductionResourcesInline>;
};

export type CarouselIntroductionResourcesBlock = ResourceLink & {
  __typename?: 'CarouselIntroductionResourcesBlock';
  sys: ResourceSys;
};

export type CarouselIntroductionResourcesHyperlink = ResourceLink & {
  __typename?: 'CarouselIntroductionResourcesHyperlink';
  sys: ResourceSys;
};

export type CarouselIntroductionResourcesInline = ResourceLink & {
  __typename?: 'CarouselIntroductionResourcesInline';
  sys: ResourceSys;
};

export type CarouselLinkingCollections = {
  __typename?: 'CarouselLinkingCollections';
  entryCollection?: Maybe<EntryCollection>;
};

export type CarouselLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum CarouselOrder {
  CarouselTypeAsc = 'carouselType_ASC',
  CarouselTypeDesc = 'carouselType_DESC',
  HideTitleAsc = 'hideTitle_ASC',
  HideTitleDesc = 'hideTitle_DESC',
  OrderAsc = 'order_ASC',
  OrderDesc = 'order_DESC',
  SlugAsc = 'slug_ASC',
  SlugDesc = 'slug_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
}

export type CarouselSlidesCollection = {
  __typename?: 'CarouselSlidesCollection';
  items: Array<Maybe<Slide>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum CarouselSlidesCollectionOrder {
  LinkAsc = 'link_ASC',
  LinkDesc = 'link_DESC',
  SlideDesignAsc = 'slideDesign_ASC',
  SlideDesignDesc = 'slideDesign_DESC',
  SlugAsc = 'slug_ASC',
  SlugDesc = 'slug_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
}

export type ContentfulMetadata = {
  __typename?: 'ContentfulMetadata';
  concepts: Array<Maybe<TaxonomyConcept>>;
  tags: Array<Maybe<ContentfulTag>>;
};

export type ContentfulMetadataConceptsDescendantsFilter = {
  id_contains_all?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_contains_none?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_contains_some?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ContentfulMetadataConceptsFilter = {
  descendants?: InputMaybe<ContentfulMetadataConceptsDescendantsFilter>;
  id_contains_all?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_contains_none?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_contains_some?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type ContentfulMetadataFilter = {
  concepts?: InputMaybe<ContentfulMetadataConceptsFilter>;
  concepts_exists?: InputMaybe<Scalars['Boolean']['input']>;
  tags?: InputMaybe<ContentfulMetadataTagsFilter>;
  tags_exists?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ContentfulMetadataTagsFilter = {
  id_contains_all?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_contains_none?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_contains_some?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/**
 * Represents a tag entity for finding and organizing content easily.
 *       Find out more here: https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/content-tags
 */
export type ContentfulTag = {
  __typename?: 'ContentfulTag';
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Entry = {
  contentfulMetadata: ContentfulMetadata;
  sys: Sys;
};

export type EntryCollection = {
  __typename?: 'EntryCollection';
  items: Array<Maybe<Entry>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type EntryFilter = {
  AND?: InputMaybe<Array<InputMaybe<EntryFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<EntryFilter>>>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  sys?: InputMaybe<SysFilter>;
};

export enum EntryOrder {
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
}

export enum ImageFormat {
  Avif = 'AVIF',
  /** JPG image format. */
  Jpg = 'JPG',
  /**
   * Progressive JPG format stores multiple passes of an image in progressively higher detail.
   *         When a progressive image is loading, the viewer will first see a lower quality pixelated version which
   *         will gradually improve in detail, until the image is fully downloaded. This is to display an image as
   *         early as possible to make the layout look as designed.
   */
  JpgProgressive = 'JPG_PROGRESSIVE',
  /** PNG image format */
  Png = 'PNG',
  /**
   * 8-bit PNG images support up to 256 colors and weigh less than the standard 24-bit PNG equivalent.
   *         The 8-bit PNG format is mostly used for simple images, such as icons or logos.
   */
  Png8 = 'PNG8',
  /** WebP image format. */
  Webp = 'WEBP',
}

export enum ImageResizeFocus {
  /** Focus the resizing on the bottom. */
  Bottom = 'BOTTOM',
  /** Focus the resizing on the bottom left. */
  BottomLeft = 'BOTTOM_LEFT',
  /** Focus the resizing on the bottom right. */
  BottomRight = 'BOTTOM_RIGHT',
  /** Focus the resizing on the center. */
  Center = 'CENTER',
  /** Focus the resizing on the largest face. */
  Face = 'FACE',
  /** Focus the resizing on the area containing all the faces. */
  Faces = 'FACES',
  /** Focus the resizing on the left. */
  Left = 'LEFT',
  /** Focus the resizing on the right. */
  Right = 'RIGHT',
  /** Focus the resizing on the top. */
  Top = 'TOP',
  /** Focus the resizing on the top left. */
  TopLeft = 'TOP_LEFT',
  /** Focus the resizing on the top right. */
  TopRight = 'TOP_RIGHT',
}

export enum ImageResizeStrategy {
  /** Crops a part of the original image to fit into the specified dimensions. */
  Crop = 'CROP',
  /** Resizes the image to the specified dimensions, cropping the image if needed. */
  Fill = 'FILL',
  /** Resizes the image to fit into the specified dimensions. */
  Fit = 'FIT',
  /**
   * Resizes the image to the specified dimensions, padding the image if needed.
   *         Uses desired background color as padding color.
   */
  Pad = 'PAD',
  /** Resizes the image to the specified dimensions, changing the original aspect ratio if needed. */
  Scale = 'SCALE',
  /** Creates a thumbnail from the image. */
  Thumb = 'THUMB',
}

export type ImageTransformOptions = {
  /**
   * Desired background color, used with corner radius or `PAD` resize strategy.
   *         Defaults to transparent (for `PNG`, `PNG8` and `WEBP`) or white (for `JPG` and `JPG_PROGRESSIVE`).
   */
  backgroundColor?: InputMaybe<Scalars['HexColor']['input']>;
  /**
   * Desired corner radius in pixels.
   *         Results in an image with rounded corners (pass `-1` for a full circle/ellipse).
   *         Defaults to `0`. Uses desired background color as padding color,
   *         unless the format is `JPG` or `JPG_PROGRESSIVE` and resize strategy is `PAD`, then defaults to white.
   */
  cornerRadius?: InputMaybe<Scalars['Int']['input']>;
  /** Desired image format. Defaults to the original image format. */
  format?: InputMaybe<ImageFormat>;
  /** Desired height in pixels. Defaults to the original image height. */
  height?: InputMaybe<Scalars['Dimension']['input']>;
  /**
   * Desired quality of the image in percents.
   *         Used for `PNG8`, `JPG`, `JPG_PROGRESSIVE` and `WEBP` formats.
   */
  quality?: InputMaybe<Scalars['Quality']['input']>;
  /** Desired resize focus area. Defaults to `CENTER`. */
  resizeFocus?: InputMaybe<ImageResizeFocus>;
  /** Desired resize strategy. Defaults to `FIT`. */
  resizeStrategy?: InputMaybe<ImageResizeStrategy>;
  /** Desired width in pixels. Defaults to the original image width. */
  width?: InputMaybe<Scalars['Dimension']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/landingPage) */
export type LandingPage = Entry &
  _Node & {
    __typename?: 'LandingPage';
    _id: Scalars['ID']['output'];
    backgroundImage?: Maybe<Asset>;
    contentfulMetadata: ContentfulMetadata;
    description?: Maybe<LandingPageDescription>;
    linkedFrom?: Maybe<LandingPageLinkingCollections>;
    slug?: Maybe<Scalars['String']['output']>;
    sys: Sys;
    title?: Maybe<Scalars['String']['output']>;
  };

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/landingPage) */
export type LandingPageBackgroundImageArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/landingPage) */
export type LandingPageDescriptionArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/landingPage) */
export type LandingPageLinkedFromArgs = {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/landingPage) */
export type LandingPageSlugArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/landingPage) */
export type LandingPageTitleArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

export type LandingPageCollection = {
  __typename?: 'LandingPageCollection';
  items: Array<Maybe<LandingPage>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type LandingPageDescription = {
  __typename?: 'LandingPageDescription';
  json: Scalars['JSON']['output'];
  links: LandingPageDescriptionLinks;
};

export type LandingPageDescriptionAssets = {
  __typename?: 'LandingPageDescriptionAssets';
  block: Array<Maybe<Asset>>;
  hyperlink: Array<Maybe<Asset>>;
};

export type LandingPageDescriptionEntries = {
  __typename?: 'LandingPageDescriptionEntries';
  block: Array<Maybe<Entry>>;
  hyperlink: Array<Maybe<Entry>>;
  inline: Array<Maybe<Entry>>;
};

export type LandingPageDescriptionLinks = {
  __typename?: 'LandingPageDescriptionLinks';
  assets: LandingPageDescriptionAssets;
  entries: LandingPageDescriptionEntries;
  resources: LandingPageDescriptionResources;
};

export type LandingPageDescriptionResources = {
  __typename?: 'LandingPageDescriptionResources';
  block: Array<LandingPageDescriptionResourcesBlock>;
  hyperlink: Array<LandingPageDescriptionResourcesHyperlink>;
  inline: Array<LandingPageDescriptionResourcesInline>;
};

export type LandingPageDescriptionResourcesBlock = ResourceLink & {
  __typename?: 'LandingPageDescriptionResourcesBlock';
  sys: ResourceSys;
};

export type LandingPageDescriptionResourcesHyperlink = ResourceLink & {
  __typename?: 'LandingPageDescriptionResourcesHyperlink';
  sys: ResourceSys;
};

export type LandingPageDescriptionResourcesInline = ResourceLink & {
  __typename?: 'LandingPageDescriptionResourcesInline';
  sys: ResourceSys;
};

export type LandingPageFilter = {
  AND?: InputMaybe<Array<InputMaybe<LandingPageFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<LandingPageFilter>>>;
  backgroundImage_exists?: InputMaybe<Scalars['Boolean']['input']>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  description_contains?: InputMaybe<Scalars['String']['input']>;
  description_exists?: InputMaybe<Scalars['Boolean']['input']>;
  description_not_contains?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  slug_contains?: InputMaybe<Scalars['String']['input']>;
  slug_exists?: InputMaybe<Scalars['Boolean']['input']>;
  slug_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  slug_not?: InputMaybe<Scalars['String']['input']>;
  slug_not_contains?: InputMaybe<Scalars['String']['input']>;
  slug_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sys?: InputMaybe<SysFilter>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_contains?: InputMaybe<Scalars['String']['input']>;
  title_exists?: InputMaybe<Scalars['Boolean']['input']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title_not?: InputMaybe<Scalars['String']['input']>;
  title_not_contains?: InputMaybe<Scalars['String']['input']>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type LandingPageLinkingCollections = {
  __typename?: 'LandingPageLinkingCollections';
  entryCollection?: Maybe<EntryCollection>;
};

export type LandingPageLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum LandingPageOrder {
  SlugAsc = 'slug_ASC',
  SlugDesc = 'slug_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
}

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/persona) */
export type Persona = Entry &
  _Node & {
    __typename?: 'Persona';
    _id: Scalars['ID']['output'];
    contentfulMetadata: ContentfulMetadata;
    description?: Maybe<PersonaDescription>;
    linkedFrom?: Maybe<PersonaLinkingCollections>;
    persona?: Maybe<PersonaType>;
    personaGroup?: Maybe<Scalars['String']['output']>;
    sys: Sys;
    type?: Maybe<Scalars['String']['output']>;
    variant?: Maybe<Scalars['String']['output']>;
  };

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/persona) */
export type PersonaDescriptionArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/persona) */
export type PersonaLinkedFromArgs = {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/persona) */
export type PersonaPersonaArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  where?: InputMaybe<PersonaTypeFilter>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/persona) */
export type PersonaPersonaGroupArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/persona) */
export type PersonaTypeArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/persona) */
export type PersonaVariantArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

export type PersonaCollection = {
  __typename?: 'PersonaCollection';
  items: Array<Maybe<Persona>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PersonaDescription = {
  __typename?: 'PersonaDescription';
  json: Scalars['JSON']['output'];
  links: PersonaDescriptionLinks;
};

export type PersonaDescriptionAssets = {
  __typename?: 'PersonaDescriptionAssets';
  block: Array<Maybe<Asset>>;
  hyperlink: Array<Maybe<Asset>>;
};

export type PersonaDescriptionEntries = {
  __typename?: 'PersonaDescriptionEntries';
  block: Array<Maybe<Entry>>;
  hyperlink: Array<Maybe<Entry>>;
  inline: Array<Maybe<Entry>>;
};

export type PersonaDescriptionLinks = {
  __typename?: 'PersonaDescriptionLinks';
  assets: PersonaDescriptionAssets;
  entries: PersonaDescriptionEntries;
  resources: PersonaDescriptionResources;
};

export type PersonaDescriptionResources = {
  __typename?: 'PersonaDescriptionResources';
  block: Array<PersonaDescriptionResourcesBlock>;
  hyperlink: Array<PersonaDescriptionResourcesHyperlink>;
  inline: Array<PersonaDescriptionResourcesInline>;
};

export type PersonaDescriptionResourcesBlock = ResourceLink & {
  __typename?: 'PersonaDescriptionResourcesBlock';
  sys: ResourceSys;
};

export type PersonaDescriptionResourcesHyperlink = ResourceLink & {
  __typename?: 'PersonaDescriptionResourcesHyperlink';
  sys: ResourceSys;
};

export type PersonaDescriptionResourcesInline = ResourceLink & {
  __typename?: 'PersonaDescriptionResourcesInline';
  sys: ResourceSys;
};

export type PersonaFilter = {
  AND?: InputMaybe<Array<InputMaybe<PersonaFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<PersonaFilter>>>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  description_contains?: InputMaybe<Scalars['String']['input']>;
  description_exists?: InputMaybe<Scalars['Boolean']['input']>;
  description_not_contains?: InputMaybe<Scalars['String']['input']>;
  persona?: InputMaybe<CfPersonaTypeNestedFilter>;
  personaGroup?: InputMaybe<Scalars['String']['input']>;
  personaGroup_contains?: InputMaybe<Scalars['String']['input']>;
  personaGroup_exists?: InputMaybe<Scalars['Boolean']['input']>;
  personaGroup_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  personaGroup_not?: InputMaybe<Scalars['String']['input']>;
  personaGroup_not_contains?: InputMaybe<Scalars['String']['input']>;
  personaGroup_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  persona_exists?: InputMaybe<Scalars['Boolean']['input']>;
  sys?: InputMaybe<SysFilter>;
  type?: InputMaybe<Scalars['String']['input']>;
  type_contains?: InputMaybe<Scalars['String']['input']>;
  type_exists?: InputMaybe<Scalars['Boolean']['input']>;
  type_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type_not?: InputMaybe<Scalars['String']['input']>;
  type_not_contains?: InputMaybe<Scalars['String']['input']>;
  type_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  variant?: InputMaybe<Scalars['String']['input']>;
  variant_contains?: InputMaybe<Scalars['String']['input']>;
  variant_exists?: InputMaybe<Scalars['Boolean']['input']>;
  variant_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  variant_not?: InputMaybe<Scalars['String']['input']>;
  variant_not_contains?: InputMaybe<Scalars['String']['input']>;
  variant_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type PersonaLinkingCollections = {
  __typename?: 'PersonaLinkingCollections';
  entryCollection?: Maybe<EntryCollection>;
  personasCollection?: Maybe<PersonasCollection>;
};

export type PersonaLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type PersonaLinkingCollectionsPersonasCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<PersonaLinkingCollectionsPersonasCollectionOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum PersonaLinkingCollectionsPersonasCollectionOrder {
  SlugAsc = 'slug_ASC',
  SlugDesc = 'slug_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
}

export enum PersonaOrder {
  PersonaGroupAsc = 'personaGroup_ASC',
  PersonaGroupDesc = 'personaGroup_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TypeAsc = 'type_ASC',
  TypeDesc = 'type_DESC',
  VariantAsc = 'variant_ASC',
  VariantDesc = 'variant_DESC',
}

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/personaType) */
export type PersonaType = Entry &
  _Node & {
    __typename?: 'PersonaType';
    _id: Scalars['ID']['output'];
    avatar?: Maybe<Asset>;
    characteristics?: Maybe<Scalars['String']['output']>;
    contentfulMetadata: ContentfulMetadata;
    default?: Maybe<Scalars['Boolean']['output']>;
    image?: Maybe<Asset>;
    linkedFrom?: Maybe<PersonaTypeLinkingCollections>;
    shortDescription?: Maybe<Scalars['String']['output']>;
    sys: Sys;
    title?: Maybe<Scalars['String']['output']>;
  };

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/personaType) */
export type PersonaTypeAvatarArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/personaType) */
export type PersonaTypeCharacteristicsArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/personaType) */
export type PersonaTypeDefaultArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/personaType) */
export type PersonaTypeImageArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/personaType) */
export type PersonaTypeLinkedFromArgs = {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/personaType) */
export type PersonaTypeShortDescriptionArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/personaType) */
export type PersonaTypeTitleArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

export type PersonaTypeCollection = {
  __typename?: 'PersonaTypeCollection';
  items: Array<Maybe<PersonaType>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PersonaTypeFilter = {
  AND?: InputMaybe<Array<InputMaybe<PersonaTypeFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<PersonaTypeFilter>>>;
  avatar_exists?: InputMaybe<Scalars['Boolean']['input']>;
  characteristics?: InputMaybe<Scalars['String']['input']>;
  characteristics_contains?: InputMaybe<Scalars['String']['input']>;
  characteristics_exists?: InputMaybe<Scalars['Boolean']['input']>;
  characteristics_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  characteristics_not?: InputMaybe<Scalars['String']['input']>;
  characteristics_not_contains?: InputMaybe<Scalars['String']['input']>;
  characteristics_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  default?: InputMaybe<Scalars['Boolean']['input']>;
  default_exists?: InputMaybe<Scalars['Boolean']['input']>;
  default_not?: InputMaybe<Scalars['Boolean']['input']>;
  image_exists?: InputMaybe<Scalars['Boolean']['input']>;
  shortDescription?: InputMaybe<Scalars['String']['input']>;
  shortDescription_contains?: InputMaybe<Scalars['String']['input']>;
  shortDescription_exists?: InputMaybe<Scalars['Boolean']['input']>;
  shortDescription_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  shortDescription_not?: InputMaybe<Scalars['String']['input']>;
  shortDescription_not_contains?: InputMaybe<Scalars['String']['input']>;
  shortDescription_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sys?: InputMaybe<SysFilter>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_contains?: InputMaybe<Scalars['String']['input']>;
  title_exists?: InputMaybe<Scalars['Boolean']['input']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title_not?: InputMaybe<Scalars['String']['input']>;
  title_not_contains?: InputMaybe<Scalars['String']['input']>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type PersonaTypeLinkingCollections = {
  __typename?: 'PersonaTypeLinkingCollections';
  entryCollection?: Maybe<EntryCollection>;
  personaCollection?: Maybe<PersonaCollection>;
  personasCollection?: Maybe<PersonasCollection>;
};

export type PersonaTypeLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type PersonaTypeLinkingCollectionsPersonaCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<PersonaTypeLinkingCollectionsPersonaCollectionOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type PersonaTypeLinkingCollectionsPersonasCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<PersonaTypeLinkingCollectionsPersonasCollectionOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum PersonaTypeLinkingCollectionsPersonaCollectionOrder {
  PersonaGroupAsc = 'personaGroup_ASC',
  PersonaGroupDesc = 'personaGroup_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TypeAsc = 'type_ASC',
  TypeDesc = 'type_DESC',
  VariantAsc = 'variant_ASC',
  VariantDesc = 'variant_DESC',
}

export enum PersonaTypeLinkingCollectionsPersonasCollectionOrder {
  SlugAsc = 'slug_ASC',
  SlugDesc = 'slug_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
}

export enum PersonaTypeOrder {
  DefaultAsc = 'default_ASC',
  DefaultDesc = 'default_DESC',
  ShortDescriptionAsc = 'shortDescription_ASC',
  ShortDescriptionDesc = 'shortDescription_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
}

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/personas) */
export type Personas = Entry &
  _Node & {
    __typename?: 'Personas';
    _id: Scalars['ID']['output'];
    contentfulMetadata: ContentfulMetadata;
    linkedFrom?: Maybe<PersonasLinkingCollections>;
    personasCollection?: Maybe<PersonasPersonasCollection>;
    recommendationCollection?: Maybe<PersonasRecommendationCollection>;
    slug?: Maybe<Scalars['String']['output']>;
    sys: Sys;
    title?: Maybe<Scalars['String']['output']>;
  };

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/personas) */
export type PersonasLinkedFromArgs = {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/personas) */
export type PersonasPersonasCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<PersonasPersonasCollectionOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<PersonaFilter>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/personas) */
export type PersonasRecommendationCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<PersonasRecommendationCollectionOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<PersonaTypeFilter>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/personas) */
export type PersonasSlugArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/personas) */
export type PersonasTitleArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

export type PersonasCollection = {
  __typename?: 'PersonasCollection';
  items: Array<Maybe<Personas>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PersonasFilter = {
  AND?: InputMaybe<Array<InputMaybe<PersonasFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<PersonasFilter>>>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  personas?: InputMaybe<CfPersonaNestedFilter>;
  personasCollection_exists?: InputMaybe<Scalars['Boolean']['input']>;
  recommendation?: InputMaybe<CfPersonaTypeNestedFilter>;
  recommendationCollection_exists?: InputMaybe<Scalars['Boolean']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  slug_contains?: InputMaybe<Scalars['String']['input']>;
  slug_exists?: InputMaybe<Scalars['Boolean']['input']>;
  slug_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  slug_not?: InputMaybe<Scalars['String']['input']>;
  slug_not_contains?: InputMaybe<Scalars['String']['input']>;
  slug_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sys?: InputMaybe<SysFilter>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_contains?: InputMaybe<Scalars['String']['input']>;
  title_exists?: InputMaybe<Scalars['Boolean']['input']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title_not?: InputMaybe<Scalars['String']['input']>;
  title_not_contains?: InputMaybe<Scalars['String']['input']>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type PersonasLinkingCollections = {
  __typename?: 'PersonasLinkingCollections';
  entryCollection?: Maybe<EntryCollection>;
};

export type PersonasLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum PersonasOrder {
  SlugAsc = 'slug_ASC',
  SlugDesc = 'slug_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
}

export type PersonasPersonasCollection = {
  __typename?: 'PersonasPersonasCollection';
  items: Array<Maybe<Persona>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum PersonasPersonasCollectionOrder {
  PersonaGroupAsc = 'personaGroup_ASC',
  PersonaGroupDesc = 'personaGroup_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TypeAsc = 'type_ASC',
  TypeDesc = 'type_DESC',
  VariantAsc = 'variant_ASC',
  VariantDesc = 'variant_DESC',
}

export type PersonasRecommendationCollection = {
  __typename?: 'PersonasRecommendationCollection';
  items: Array<Maybe<PersonaType>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export enum PersonasRecommendationCollectionOrder {
  DefaultAsc = 'default_ASC',
  DefaultDesc = 'default_DESC',
  ShortDescriptionAsc = 'shortDescription_ASC',
  ShortDescriptionDesc = 'shortDescription_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
}

export type Query = {
  __typename?: 'Query';
  _node?: Maybe<_Node>;
  asset?: Maybe<Asset>;
  assetCollection?: Maybe<AssetCollection>;
  banner?: Maybe<Banner>;
  bannerCollection?: Maybe<BannerCollection>;
  card?: Maybe<Card>;
  cardCollection?: Maybe<CardCollection>;
  carousel?: Maybe<Carousel>;
  carouselCollection?: Maybe<CarouselCollection>;
  entryCollection?: Maybe<EntryCollection>;
  landingPage?: Maybe<LandingPage>;
  landingPageCollection?: Maybe<LandingPageCollection>;
  persona?: Maybe<Persona>;
  personaCollection?: Maybe<PersonaCollection>;
  personaType?: Maybe<PersonaType>;
  personaTypeCollection?: Maybe<PersonaTypeCollection>;
  personas?: Maybe<Personas>;
  personasCollection?: Maybe<PersonasCollection>;
  slide?: Maybe<Slide>;
  slideCollection?: Maybe<SlideCollection>;
  test?: Maybe<Test>;
  testCollection?: Maybe<TestCollection>;
};

export type Query_NodeArgs = {
  id: Scalars['ID']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryAssetArgs = {
  id: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryAssetCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<AssetOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<AssetFilter>;
};

export type QueryBannerArgs = {
  id: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryBannerCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<BannerOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<BannerFilter>;
};

export type QueryCardArgs = {
  id: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryCardCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<CardOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<CardFilter>;
};

export type QueryCarouselArgs = {
  id: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryCarouselCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<CarouselOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<CarouselFilter>;
};

export type QueryEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<EntryOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<EntryFilter>;
};

export type QueryLandingPageArgs = {
  id: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryLandingPageCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<LandingPageOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<LandingPageFilter>;
};

export type QueryPersonaArgs = {
  id: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryPersonaCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<PersonaOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<PersonaFilter>;
};

export type QueryPersonaTypeArgs = {
  id: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryPersonaTypeCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<PersonaTypeOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<PersonaTypeFilter>;
};

export type QueryPersonasArgs = {
  id: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryPersonasCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<PersonasOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<PersonasFilter>;
};

export type QuerySlideArgs = {
  id: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QuerySlideCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<SlideOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<SlideFilter>;
};

export type QueryTestArgs = {
  id: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryTestCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<TestOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<TestFilter>;
};

export type ResourceLink = {
  sys: ResourceSys;
};

export type ResourceSys = {
  __typename?: 'ResourceSys';
  linkType: Scalars['String']['output'];
  urn: Scalars['String']['output'];
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/slide) */
export type Slide = Entry &
  _Node & {
    __typename?: 'Slide';
    _id: Scalars['ID']['output'];
    body?: Maybe<SlideBody>;
    contentfulMetadata: ContentfulMetadata;
    image?: Maybe<Asset>;
    link?: Maybe<Scalars['String']['output']>;
    linkedFrom?: Maybe<SlideLinkingCollections>;
    slideColour?: Maybe<Scalars['JSON']['output']>;
    slideDesign?: Maybe<Scalars['String']['output']>;
    slideTextColour?: Maybe<Scalars['JSON']['output']>;
    slug?: Maybe<Scalars['String']['output']>;
    sys: Sys;
    title?: Maybe<Scalars['String']['output']>;
  };

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/slide) */
export type SlideBodyArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/slide) */
export type SlideImageArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/slide) */
export type SlideLinkArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/slide) */
export type SlideLinkedFromArgs = {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/slide) */
export type SlideSlideColourArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/slide) */
export type SlideSlideDesignArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/slide) */
export type SlideSlideTextColourArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/slide) */
export type SlideSlugArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/slide) */
export type SlideTitleArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

export type SlideBody = {
  __typename?: 'SlideBody';
  json: Scalars['JSON']['output'];
  links: SlideBodyLinks;
};

export type SlideBodyAssets = {
  __typename?: 'SlideBodyAssets';
  block: Array<Maybe<Asset>>;
  hyperlink: Array<Maybe<Asset>>;
};

export type SlideBodyEntries = {
  __typename?: 'SlideBodyEntries';
  block: Array<Maybe<Entry>>;
  hyperlink: Array<Maybe<Entry>>;
  inline: Array<Maybe<Entry>>;
};

export type SlideBodyLinks = {
  __typename?: 'SlideBodyLinks';
  assets: SlideBodyAssets;
  entries: SlideBodyEntries;
  resources: SlideBodyResources;
};

export type SlideBodyResources = {
  __typename?: 'SlideBodyResources';
  block: Array<SlideBodyResourcesBlock>;
  hyperlink: Array<SlideBodyResourcesHyperlink>;
  inline: Array<SlideBodyResourcesInline>;
};

export type SlideBodyResourcesBlock = ResourceLink & {
  __typename?: 'SlideBodyResourcesBlock';
  sys: ResourceSys;
};

export type SlideBodyResourcesHyperlink = ResourceLink & {
  __typename?: 'SlideBodyResourcesHyperlink';
  sys: ResourceSys;
};

export type SlideBodyResourcesInline = ResourceLink & {
  __typename?: 'SlideBodyResourcesInline';
  sys: ResourceSys;
};

export type SlideCollection = {
  __typename?: 'SlideCollection';
  items: Array<Maybe<Slide>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type SlideFilter = {
  AND?: InputMaybe<Array<InputMaybe<SlideFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<SlideFilter>>>;
  body_contains?: InputMaybe<Scalars['String']['input']>;
  body_exists?: InputMaybe<Scalars['Boolean']['input']>;
  body_not_contains?: InputMaybe<Scalars['String']['input']>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  image_exists?: InputMaybe<Scalars['Boolean']['input']>;
  link?: InputMaybe<Scalars['String']['input']>;
  link_contains?: InputMaybe<Scalars['String']['input']>;
  link_exists?: InputMaybe<Scalars['Boolean']['input']>;
  link_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link_not?: InputMaybe<Scalars['String']['input']>;
  link_not_contains?: InputMaybe<Scalars['String']['input']>;
  link_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  slideColour_exists?: InputMaybe<Scalars['Boolean']['input']>;
  slideDesign?: InputMaybe<Scalars['String']['input']>;
  slideDesign_contains?: InputMaybe<Scalars['String']['input']>;
  slideDesign_exists?: InputMaybe<Scalars['Boolean']['input']>;
  slideDesign_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  slideDesign_not?: InputMaybe<Scalars['String']['input']>;
  slideDesign_not_contains?: InputMaybe<Scalars['String']['input']>;
  slideDesign_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  slideTextColour_exists?: InputMaybe<Scalars['Boolean']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  slug_contains?: InputMaybe<Scalars['String']['input']>;
  slug_exists?: InputMaybe<Scalars['Boolean']['input']>;
  slug_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  slug_not?: InputMaybe<Scalars['String']['input']>;
  slug_not_contains?: InputMaybe<Scalars['String']['input']>;
  slug_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sys?: InputMaybe<SysFilter>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_contains?: InputMaybe<Scalars['String']['input']>;
  title_exists?: InputMaybe<Scalars['Boolean']['input']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title_not?: InputMaybe<Scalars['String']['input']>;
  title_not_contains?: InputMaybe<Scalars['String']['input']>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type SlideLinkingCollections = {
  __typename?: 'SlideLinkingCollections';
  carouselCollection?: Maybe<CarouselCollection>;
  entryCollection?: Maybe<EntryCollection>;
};

export type SlideLinkingCollectionsCarouselCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Array<InputMaybe<SlideLinkingCollectionsCarouselCollectionOrder>>>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type SlideLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum SlideLinkingCollectionsCarouselCollectionOrder {
  CarouselTypeAsc = 'carouselType_ASC',
  CarouselTypeDesc = 'carouselType_DESC',
  HideTitleAsc = 'hideTitle_ASC',
  HideTitleDesc = 'hideTitle_DESC',
  OrderAsc = 'order_ASC',
  OrderDesc = 'order_DESC',
  SlugAsc = 'slug_ASC',
  SlugDesc = 'slug_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
}

export enum SlideOrder {
  LinkAsc = 'link_ASC',
  LinkDesc = 'link_DESC',
  SlideDesignAsc = 'slideDesign_ASC',
  SlideDesignDesc = 'slideDesign_DESC',
  SlugAsc = 'slug_ASC',
  SlugDesc = 'slug_DESC',
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
}

export type Sys = {
  __typename?: 'Sys';
  environmentId: Scalars['String']['output'];
  firstPublishedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  /** The locale that was requested. */
  locale?: Maybe<Scalars['String']['output']>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  publishedVersion?: Maybe<Scalars['Int']['output']>;
  spaceId: Scalars['String']['output'];
};

export type SysFilter = {
  firstPublishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  firstPublishedAt_exists?: InputMaybe<Scalars['Boolean']['input']>;
  firstPublishedAt_gt?: InputMaybe<Scalars['DateTime']['input']>;
  firstPublishedAt_gte?: InputMaybe<Scalars['DateTime']['input']>;
  firstPublishedAt_in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  firstPublishedAt_lt?: InputMaybe<Scalars['DateTime']['input']>;
  firstPublishedAt_lte?: InputMaybe<Scalars['DateTime']['input']>;
  firstPublishedAt_not?: InputMaybe<Scalars['DateTime']['input']>;
  firstPublishedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  id?: InputMaybe<Scalars['String']['input']>;
  id_contains?: InputMaybe<Scalars['String']['input']>;
  id_exists?: InputMaybe<Scalars['Boolean']['input']>;
  id_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  id_not?: InputMaybe<Scalars['String']['input']>;
  id_not_contains?: InputMaybe<Scalars['String']['input']>;
  id_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  publishedAt?: InputMaybe<Scalars['DateTime']['input']>;
  publishedAt_exists?: InputMaybe<Scalars['Boolean']['input']>;
  publishedAt_gt?: InputMaybe<Scalars['DateTime']['input']>;
  publishedAt_gte?: InputMaybe<Scalars['DateTime']['input']>;
  publishedAt_in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  publishedAt_lt?: InputMaybe<Scalars['DateTime']['input']>;
  publishedAt_lte?: InputMaybe<Scalars['DateTime']['input']>;
  publishedAt_not?: InputMaybe<Scalars['DateTime']['input']>;
  publishedAt_not_in?: InputMaybe<Array<InputMaybe<Scalars['DateTime']['input']>>>;
  publishedVersion?: InputMaybe<Scalars['Float']['input']>;
  publishedVersion_exists?: InputMaybe<Scalars['Boolean']['input']>;
  publishedVersion_gt?: InputMaybe<Scalars['Float']['input']>;
  publishedVersion_gte?: InputMaybe<Scalars['Float']['input']>;
  publishedVersion_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
  publishedVersion_lt?: InputMaybe<Scalars['Float']['input']>;
  publishedVersion_lte?: InputMaybe<Scalars['Float']['input']>;
  publishedVersion_not?: InputMaybe<Scalars['Float']['input']>;
  publishedVersion_not_in?: InputMaybe<Array<InputMaybe<Scalars['Float']['input']>>>;
};

/**
 * Represents a taxonomy concept entity for finding and organizing content easily.
 *         Find out more here: https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/content-concepts
 */
export type TaxonomyConcept = {
  __typename?: 'TaxonomyConcept';
  id?: Maybe<Scalars['String']['output']>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/test) */
export type Test = Entry &
  _Node & {
    __typename?: 'Test';
    _id: Scalars['ID']['output'];
    contentfulMetadata: ContentfulMetadata;
    linkedFrom?: Maybe<TestLinkingCollections>;
    sys: Sys;
    title?: Maybe<Scalars['String']['output']>;
  };

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/test) */
export type TestLinkedFromArgs = {
  allowedLocales?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

/** [See type definition](https://app.contentful.com/spaces/uhvj8afx5bqy/content_types/test) */
export type TestTitleArgs = {
  locale?: InputMaybe<Scalars['String']['input']>;
};

export type TestCollection = {
  __typename?: 'TestCollection';
  items: Array<Maybe<Test>>;
  limit: Scalars['Int']['output'];
  skip: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type TestFilter = {
  AND?: InputMaybe<Array<InputMaybe<TestFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<TestFilter>>>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  sys?: InputMaybe<SysFilter>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_contains?: InputMaybe<Scalars['String']['input']>;
  title_exists?: InputMaybe<Scalars['Boolean']['input']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title_not?: InputMaybe<Scalars['String']['input']>;
  title_not_contains?: InputMaybe<Scalars['String']['input']>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type TestLinkingCollections = {
  __typename?: 'TestLinkingCollections';
  entryCollection?: Maybe<EntryCollection>;
};

export type TestLinkingCollectionsEntryCollectionArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  locale?: InputMaybe<Scalars['String']['input']>;
  preview?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export enum TestOrder {
  SysFirstPublishedAtAsc = 'sys_firstPublishedAt_ASC',
  SysFirstPublishedAtDesc = 'sys_firstPublishedAt_DESC',
  SysIdAsc = 'sys_id_ASC',
  SysIdDesc = 'sys_id_DESC',
  SysPublishedAtAsc = 'sys_publishedAt_ASC',
  SysPublishedAtDesc = 'sys_publishedAt_DESC',
  SysPublishedVersionAsc = 'sys_publishedVersion_ASC',
  SysPublishedVersionDesc = 'sys_publishedVersion_DESC',
  TitleAsc = 'title_ASC',
  TitleDesc = 'title_DESC',
}

export type _Node = {
  _id: Scalars['ID']['output'];
};

export type CfCardNestedFilter = {
  AND?: InputMaybe<Array<InputMaybe<CfCardNestedFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<CfCardNestedFilter>>>;
  body_contains?: InputMaybe<Scalars['String']['input']>;
  body_exists?: InputMaybe<Scalars['Boolean']['input']>;
  body_not_contains?: InputMaybe<Scalars['String']['input']>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  image_exists?: InputMaybe<Scalars['Boolean']['input']>;
  sys?: InputMaybe<SysFilter>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_contains?: InputMaybe<Scalars['String']['input']>;
  title_exists?: InputMaybe<Scalars['Boolean']['input']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title_not?: InputMaybe<Scalars['String']['input']>;
  title_not_contains?: InputMaybe<Scalars['String']['input']>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CfPersonaNestedFilter = {
  AND?: InputMaybe<Array<InputMaybe<CfPersonaNestedFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<CfPersonaNestedFilter>>>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  description_contains?: InputMaybe<Scalars['String']['input']>;
  description_exists?: InputMaybe<Scalars['Boolean']['input']>;
  description_not_contains?: InputMaybe<Scalars['String']['input']>;
  personaGroup?: InputMaybe<Scalars['String']['input']>;
  personaGroup_contains?: InputMaybe<Scalars['String']['input']>;
  personaGroup_exists?: InputMaybe<Scalars['Boolean']['input']>;
  personaGroup_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  personaGroup_not?: InputMaybe<Scalars['String']['input']>;
  personaGroup_not_contains?: InputMaybe<Scalars['String']['input']>;
  personaGroup_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  persona_exists?: InputMaybe<Scalars['Boolean']['input']>;
  sys?: InputMaybe<SysFilter>;
  type?: InputMaybe<Scalars['String']['input']>;
  type_contains?: InputMaybe<Scalars['String']['input']>;
  type_exists?: InputMaybe<Scalars['Boolean']['input']>;
  type_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  type_not?: InputMaybe<Scalars['String']['input']>;
  type_not_contains?: InputMaybe<Scalars['String']['input']>;
  type_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  variant?: InputMaybe<Scalars['String']['input']>;
  variant_contains?: InputMaybe<Scalars['String']['input']>;
  variant_exists?: InputMaybe<Scalars['Boolean']['input']>;
  variant_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  variant_not?: InputMaybe<Scalars['String']['input']>;
  variant_not_contains?: InputMaybe<Scalars['String']['input']>;
  variant_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CfPersonaTypeNestedFilter = {
  AND?: InputMaybe<Array<InputMaybe<CfPersonaTypeNestedFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<CfPersonaTypeNestedFilter>>>;
  avatar_exists?: InputMaybe<Scalars['Boolean']['input']>;
  characteristics?: InputMaybe<Scalars['String']['input']>;
  characteristics_contains?: InputMaybe<Scalars['String']['input']>;
  characteristics_exists?: InputMaybe<Scalars['Boolean']['input']>;
  characteristics_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  characteristics_not?: InputMaybe<Scalars['String']['input']>;
  characteristics_not_contains?: InputMaybe<Scalars['String']['input']>;
  characteristics_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  default?: InputMaybe<Scalars['Boolean']['input']>;
  default_exists?: InputMaybe<Scalars['Boolean']['input']>;
  default_not?: InputMaybe<Scalars['Boolean']['input']>;
  image_exists?: InputMaybe<Scalars['Boolean']['input']>;
  shortDescription?: InputMaybe<Scalars['String']['input']>;
  shortDescription_contains?: InputMaybe<Scalars['String']['input']>;
  shortDescription_exists?: InputMaybe<Scalars['Boolean']['input']>;
  shortDescription_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  shortDescription_not?: InputMaybe<Scalars['String']['input']>;
  shortDescription_not_contains?: InputMaybe<Scalars['String']['input']>;
  shortDescription_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sys?: InputMaybe<SysFilter>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_contains?: InputMaybe<Scalars['String']['input']>;
  title_exists?: InputMaybe<Scalars['Boolean']['input']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title_not?: InputMaybe<Scalars['String']['input']>;
  title_not_contains?: InputMaybe<Scalars['String']['input']>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CfSlideNestedFilter = {
  AND?: InputMaybe<Array<InputMaybe<CfSlideNestedFilter>>>;
  OR?: InputMaybe<Array<InputMaybe<CfSlideNestedFilter>>>;
  body_contains?: InputMaybe<Scalars['String']['input']>;
  body_exists?: InputMaybe<Scalars['Boolean']['input']>;
  body_not_contains?: InputMaybe<Scalars['String']['input']>;
  contentfulMetadata?: InputMaybe<ContentfulMetadataFilter>;
  image_exists?: InputMaybe<Scalars['Boolean']['input']>;
  link?: InputMaybe<Scalars['String']['input']>;
  link_contains?: InputMaybe<Scalars['String']['input']>;
  link_exists?: InputMaybe<Scalars['Boolean']['input']>;
  link_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  link_not?: InputMaybe<Scalars['String']['input']>;
  link_not_contains?: InputMaybe<Scalars['String']['input']>;
  link_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  slideColour_exists?: InputMaybe<Scalars['Boolean']['input']>;
  slideDesign?: InputMaybe<Scalars['String']['input']>;
  slideDesign_contains?: InputMaybe<Scalars['String']['input']>;
  slideDesign_exists?: InputMaybe<Scalars['Boolean']['input']>;
  slideDesign_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  slideDesign_not?: InputMaybe<Scalars['String']['input']>;
  slideDesign_not_contains?: InputMaybe<Scalars['String']['input']>;
  slideDesign_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  slideTextColour_exists?: InputMaybe<Scalars['Boolean']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  slug_contains?: InputMaybe<Scalars['String']['input']>;
  slug_exists?: InputMaybe<Scalars['Boolean']['input']>;
  slug_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  slug_not?: InputMaybe<Scalars['String']['input']>;
  slug_not_contains?: InputMaybe<Scalars['String']['input']>;
  slug_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  sys?: InputMaybe<SysFilter>;
  title?: InputMaybe<Scalars['String']['input']>;
  title_contains?: InputMaybe<Scalars['String']['input']>;
  title_exists?: InputMaybe<Scalars['Boolean']['input']>;
  title_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title_not?: InputMaybe<Scalars['String']['input']>;
  title_not_contains?: InputMaybe<Scalars['String']['input']>;
  title_not_in?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type GetCarouselQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;

export type GetCarouselQuery = {
  __typename?: 'Query';
  carouselCollection?: {
    __typename?: 'CarouselCollection';
    items: Array<{
      __typename: 'Carousel';
      title?: string | null;
      hideTitle?: boolean | null;
      carouselBgColour?: any | null;
      carouselType?: string | null;
      order?: number | null;
      sys: { __typename?: 'Sys'; id: string };
      introduction?: { __typename?: 'CarouselIntroduction'; json: any } | null;
      backgroundImage?: {
        __typename?: 'Asset';
        url?: string | null;
        description?: string | null;
        title?: string | null;
      } | null;
      slidesCollection?: {
        __typename?: 'CarouselSlidesCollection';
        items: Array<{
          __typename?: 'Slide';
          title?: string | null;
          slug?: string | null;
          slideColour?: any | null;
          slideTextColour?: any | null;
          slideDesign?: string | null;
          sys: { __typename?: 'Sys'; id: string };
          body?: { __typename?: 'SlideBody'; json: any } | null;
          image?: {
            __typename?: 'Asset';
            url?: string | null;
            title?: string | null;
            description?: string | null;
          } | null;
        } | null>;
      } | null;
    } | null>;
  } | null;
};

export const GetCarouselDocument = gql`
  query GetCarousel($slug: String!) {
    carouselCollection(where: { slug: $slug }, limit: 10, order: order_ASC) {
      items {
        sys {
          id
        }
        __typename
        title
        hideTitle
        introduction {
          json
        }
        backgroundImage {
          url
          description
          title
        }
        carouselBgColour
        carouselType
        order
        slidesCollection(limit: 10) {
          items {
            sys {
              id
            }
            title
            slug
            slideColour
            slideTextColour
            slideDesign
            body {
              json
            }
            image {
              url
              title
              description
            }
          }
        }
      }
    }
  }
`;

/**
 * __useGetCarouselQuery__
 *
 * To run a query within a React component, call `useGetCarouselQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCarouselQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCarouselQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGetCarouselQuery(
  baseOptions: Apollo.QueryHookOptions<GetCarouselQuery, GetCarouselQueryVariables> &
    ({ variables: GetCarouselQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCarouselQuery, GetCarouselQueryVariables>(GetCarouselDocument, options);
}
export function useGetCarouselLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetCarouselQuery, GetCarouselQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCarouselQuery, GetCarouselQueryVariables>(
    GetCarouselDocument,
    options,
  );
}
export function useGetCarouselSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetCarouselQuery, GetCarouselQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetCarouselQuery, GetCarouselQueryVariables>(
    GetCarouselDocument,
    options,
  );
}
export type GetCarouselQueryHookResult = ReturnType<typeof useGetCarouselQuery>;
export type GetCarouselLazyQueryHookResult = ReturnType<typeof useGetCarouselLazyQuery>;
export type GetCarouselSuspenseQueryHookResult = ReturnType<typeof useGetCarouselSuspenseQuery>;
export type GetCarouselQueryResult = Apollo.QueryResult<
  GetCarouselQuery,
  GetCarouselQueryVariables
>;
