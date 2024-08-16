export async function getNewsPosts(searchParams: PostsListParams) {
    const { tagId, limit = 9, before, after = 0, locale = 'en' } = searchParams;
    const start = before ? parseInt(before) - limit : after;
    const filter = tagId ? `&filters[tags][title][$eq]=${tagId}` : '';
  
    const apiResponse = await fetchStrapiData({
      endpoint: `/api/posts?locale=${locale}&populate=*&pagination[start]=${start}&pagination[limit]=${limit}&sort[0]=publishedAt:desc&${filter}`,
    });
  
    if (!apiResponse) {
      return null;
    }
  
    return transformDataToBlogPosts(apiResponse, tagId);
  }
  
  export async function getNewsPost(postParams: SinglePostParams) {
    const { blogId, locale = 'en' } = postParams;
  
    const siteContentData = await fetchStrapiData({
      endpoint: `/api/static-site-content?locale=${locale}`,
    });
  
    const apiResponse = await fetchStrapiData({
      endpoint: `/api/posts/${blogId}?populate=*`,
    });
  
    if (!apiResponse) {
      return null;
    }
  
    return transformDataToBlogPost(apiResponse, siteContentData.data.attributes.news_vanity_url);
  }
  
  export async function fetchStrapiData({ endpoint }: fetchStrapiDataParams) {
    const baseUrl = process.env.STRAPI_BASE_URL;
    try {
      const response = await fetch(baseUrl + endpoint, {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_KEY}` ?? '',
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(`API fetch error: ${response.status}`);
      }
  
      return data;
    } catch (error) {
      console.error(error);
    }
  }
  
  // These functions are here primarily here to emulate the BigCommerce responses powering the BlogPost pages by default,
  // so this can drop directly into an existing Catalyst page.
  //
  // e.g.  isVisibleInNavigation value is used in those pages and will render a 404 if it's set to false.
  //
  // That said, the functions do simplify the response used within the page and provide a central place to alter logic.
  
  function transformDataToBlogPosts(apiResponse: StrapiPostsResponse, tagId: string | undefined) {
    return {
      name: 'News' + (tagId ? `: ${tagId}` : ''),
      description: '',
      posts: {
        pageInfo: {
          hasNextPage:
            apiResponse.meta.pagination.total -
              (apiResponse.meta.pagination.start + apiResponse.meta.pagination.limit) >
            0,
          hasPreviousPage: apiResponse.meta.pagination.start - apiResponse.meta.pagination.limit >= 0,
          startCursor: apiResponse.meta.pagination.start.toString(),
          endCursor: (apiResponse.meta.pagination.start + apiResponse.meta.pagination.limit).toString(),
        },
        items: apiResponse.data.map((post) => {
          let summary = '';
          post.attributes.content.forEach((contentPart) => {
            contentPart.children.forEach((child) => {
              if (child.type === 'text') {
                summary += child.text + ' ';
              }
            });
          });
  
          return {
            author: post.attributes.author,
            entityId: post.id,
            name: post.attributes.title,
            plainTextSummary: `${summary.slice(0, 145)}${summary.length > 145 ? '...' : ''}`,
            publishedDate: { utc: post.attributes.publishedAt },
            thumbnailImage: post.attributes.thumbnail.data
              ? {
                  altText: post.attributes.thumbnail.data.attributes.alternativeText || '',
                  url:
                    post.attributes.thumbnail.data.attributes.formats.small.url.indexOf('http') === 0
                      ? `${post.attributes.thumbnail.data.attributes.formats.small.url}`
                      : `${process.env.STRAPI_BASE_URL}${post.attributes.thumbnail.data.attributes.formats.small.url}`,
                }
              : null,
          };
        }),
      },
      isVisibleInNavigation: true,
    };
  }
  
  function transformDataToBlogPost(apiResponse: StrapiPostResponse, vanityUrl: string) {
    return {
      author: apiResponse.data.attributes.author,
      htmlBody: null,
      content: apiResponse.data.attributes.content,
      id: apiResponse.data.id,
      name: apiResponse.data.attributes.title,
      publishedDate: { utc: apiResponse.data.attributes.publishedAt },
      tags: apiResponse.data.attributes.tags.data.map((tag) => tag.attributes.title),
      thumbnailImage: apiResponse.data.attributes.thumbnail.data
        ? {
            altText: apiResponse.data.attributes.thumbnail.data.attributes.alternativeText || '',
            url:
              apiResponse.data.attributes.thumbnail.data.attributes.formats.small.url.indexOf(
                'http',
              ) === 0
                ? `${apiResponse.data.attributes.thumbnail.data.attributes.formats.small.url}`
                : `${process.env.STRAPI_BASE_URL}${apiResponse.data.attributes.thumbnail.data.attributes.formats.small.url}`,
          }
        : null,
      seo: {
        metaKeywords: apiResponse.data.attributes.meta_keywords,
        metaDescription: apiResponse.data.attributes.meta_description,
        pageTitle: apiResponse.data.attributes.title,
      },
      isVisibleInNavigation: true,
      vanityUrl,
    };
  }