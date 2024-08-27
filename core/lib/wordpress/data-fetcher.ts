type PostsListParams = {
  tagId?: string;
  page?: number;
  perPage?: number;
  offset?: number;
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'relevance' | 'id' | 'include' | 'title' | 'slug';
  locale?: string;
};

type SinglePostParams = {
  blogId: string;
  locale?: string;
};

type SinglePageParams = {
  path: string;
  locale?: string;
};

const SITE_URL = process.env.WORDPRESS_URL || '';

export async function getWordPressPosts(searchParams: PostsListParams) {
  const {
    tagId,
    page = 1,
    perPage = 9,
    offset,
    order = 'desc',
    orderby = 'date',
    locale = 'en',
  } = searchParams;

  console.log('searchParams', searchParams)

  let url = `${SITE_URL}/wp-json/wp/v2/posts?_embed&page=${page}&per_page=${perPage}&order=${order}&orderby=${orderby}`;

  let tagName = '';
  if (tagId) {
    // The tagId param is a string, so the url is human readable, while the WP API filter uses
    // an integer ID to filter posts on tags. So we will reach out to the WP API to get the tag integer ID.
    const tagsApiUrl = `${SITE_URL}/wp-json/wp/v2/tags?slug=${tagId}`;
    const tagsResponse = await fetch(tagsApiUrl);
    if (!tagsResponse.ok) {
        throw new Error(`WordPress API fetch error: ${tagsApiUrl} (code: ${tagsResponse.status})`);
    }

    const tags = await tagsResponse.json();
    if (tags.length === 0) {
        return null
    }

    tagName = tags[0].name

    url += `&tags=${tags[0].id}`;
  }
  if (offset) {
    url += `&offset=${offset}`;
  }

  console.log('url', url)

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`WordPress API fetch error: ${url} (code: ${response.status})`);
  }

  const posts = await response.json();
  const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0', 10);
  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);

  const pageTitle = 'Blog' + (tagName ? `: ${tagName}` : '')

  return transformDataToBlogPosts(posts, pageTitle, totalPosts, totalPages, page, perPage);
}

export async function getWordPressPost(postParams: SinglePostParams) {
  const { blogId, locale = 'en' } = postParams;

  const url = `${SITE_URL}/wp-json/wp/v2/posts?slug=${blogId}&_embed`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API fetch error: ${response.status}`);
  }

  const posts = await response.json();
  if (posts.length === 0) {
    return null;
  }

  return transformDataToBlogPost(posts[0]);
}

export async function getWordPressPage(params: SinglePageParams) {
  const { path, locale = 'en' } = params;
  const url = `${SITE_URL}/wp-json/wp/v2/pages?slug=${path.split('/').pop()}&_embed`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API fetch error: ${response.status}`);
  }

  const pages = await response.json();
  if (pages.length === 0) {
    return null;
  }

  return pages[0];
}

function transformDataToBlogPosts(
  posts: any[],
  pageTitle: string,
  totalPosts: number,
  totalPages: number,
  currentPage: number,
  perPage: number,
) {
  return {
    name: pageTitle,
    description: '',
    posts: {
      pageInfo: {
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        startCursor: currentPage.toString(),
        endCursor: (currentPage + 1).toString(),
        currentPage,
        totalPages,
        totalPosts,
        perPage,
      },
      items: posts.map((post: any) => ({
        author: post._embedded?.author?.[0]?.name || '',
        entityId: post.slug,
        name: post.title.rendered.replaceAll('&#8217;', "'").replaceAll('&#8220;', '"').replaceAll('&#8221;', '"'),
        plainTextSummary: post.excerpt.rendered.replace(/(<([^>]+)>)/gi, '').replaceAll('&#8217;', "'").replace('&#8230;', '...').replace('Continue Reading', ''),
        publishedDate: { utc: post.date_gmt },
        thumbnailImage: post._embedded?.['wp:featuredmedia']?.[0]
          ? {
              altText: post._embedded['wp:featuredmedia'][0].alt_text || '',
              url: post._embedded['wp:featuredmedia'][0].source_url,
            }
          : null,
      })),
    },
    isVisibleInNavigation: true,
  };
}

function transformDataToBlogPost(post: any) {
  return {
    author: post._embedded?.author?.[0]?.name || '',
    htmlBody: post.content.rendered,
    content: post.content.rendered,
    id: post.slug,
    name: post.title.rendered,
    publishedDate: { utc: post.date_gmt },
    tags:
      post._embedded?.['wp:term']?.[1]?.map((tag: { name: string, slug: string }) => ({
        name: tag.name,
        href: `/blog/tag/${tag.slug}`,
      })) || [],
    thumbnailImage: post._embedded?.['wp:featuredmedia']?.[0]
      ? {
          altText: post._embedded['wp:featuredmedia'][0].alt_text || '',
          url: post._embedded['wp:featuredmedia'][0].source_url,
        }
      : null,
    seo: {
      metaKeywords: post._embedded?.['wp:term']?.[1]?.map((tag: { name: string, slug: string }) => tag.name).join(',') || '',
      metaDescription: post.excerpt.rendered.replace(/(<([^>]+)>)/gi, ''),
      pageTitle: post.title.rendered,
    },
    isVisibleInNavigation: true,
    vanityUrl: post.link,
  };
}
