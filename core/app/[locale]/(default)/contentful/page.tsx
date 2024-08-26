import Image from 'next/image';

import { contentfulClient, contentfulGraphql } from '~/lib/contentful/client';

export default async function ContentfulPage() {
  const GetBlogPostsQuery = contentfulGraphql(`
    query GetBlogPosts {
      blogPostCollection {
        items {
          sys {
            id
          }
          _id
          title
          excerpt
          published
          author
          image {
            description
            url
          }
        }
      }
    }
  `);

  const data = await contentfulClient.query(GetBlogPostsQuery, {});

  return (
    <div className="space-y-4">
      <h1>Contentful Page</h1>
      {data.data?.blogPostCollection?.items.map((post) => (
        <div className="rounded-lg border p-4" key={post?.sys.id}>
          <h2>{post?.title}</h2>
          <p>{post?.excerpt}</p>
          <p>{post?.published}</p>
          <p>{post?.author}</p>
          <Image
            alt={post?.image?.description ?? ''}
            height={200}
            src={post?.image?.url ?? ''}
            width={200}
          />
        </div>
      ))}
    </div>
  );
}
