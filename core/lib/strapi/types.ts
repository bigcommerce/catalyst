type PostsListParams = {
    tagId?: string;
    limit?: number;
    before?: string;
    after?: string;
    locale?: string;
  };
  
  type SinglePostParams = {
    blogId: string;
    locale?: string;
  };
  
  type fetchStrapiDataParams = {
    endpoint: string;
  };
  
  type StrapiImageFormat = {
    name: string;
    hash: string;
    ext: string;
    mime: string;
    path: string | null;
    width: number;
    height: number;
    size: number;
    sizeInBytes: number;
    url: string;
  };
  
  type StrapiImageAttributes = {
    name: string;
    alternativeText: string | null;
    caption: string | null;
    width: number;
    height: number;
    formats: {
      thumbnail: StrapiImageFormat;
      small: StrapiImageFormat;
      medium: StrapiImageFormat;
      large: StrapiImageFormat;
    };
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: any;
    createdAt: string;
    updatedAt: string;
  };
  
  type StrapiImage = {
    data: {
      id: number;
      attributes: StrapiImageAttributes;
    } | null;
  };
  
  type StrapiPost = {
    id: number;
    attributes: {
      title: string;
      content: {
        type: string;
        children: {
          type: string;
          text?: string;
          bold?: boolean;
        }[];
        level?: number;
        image?: StrapiImageAttributes;
      }[];
      slug: string;
      createdAt: string;
      updatedAt: string;
      publishedAt: string;
      locale: string;
      meta_keywords: string | null;
      meta_description: string | null;
      author: any;
      thumbnail: StrapiImage;
      tags: {
        data: {
          id: number;
          attributes: {
            title: string;
            createdAt: string;
            updatedAt: string;
            locale: string;
          };
        }[];
      };
      localizations: {
        data: any[];
      };
    };
  };
  
  type StrapiPostsResponse = {
    data: StrapiPost[];
    meta: {
      pagination: {
        start: number;
        limit: number;
        total: number;
      };
    };
  };
  
  type StrapiPostResponse = {
    data: StrapiPost;
    meta: {};
  };