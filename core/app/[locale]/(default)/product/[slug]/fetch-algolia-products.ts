'use server';

const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || '';
const indexName: string = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || '';

export async function getRelatedProducts(objectId: number) {
  const response = await fetch(`https://${appId}.algolia.net/1/indexes/*/recommendations`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "x-algolia-application-id": appId,
      "x-algolia-api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      "requests": [{
        "indexName": indexName,
        "model": "related-products",
        "objectID": objectId.toString(),
        "threshold": 0,
        "maxRecommendations": 18
      }]
    }),
    cache: 'force-cache',
    //next: { revalidate: 3600 }
  });

  const data = await response.json();

  return data && data.results && data.results[0]?.hits ? data.results[0]?.hits : [];
}

export async function getCollectionProducts(objectId: number, brand: string, collection: string) {
  console.log(`brand_name:${encodeURIComponent(brand)} AND metafields.Akeneo.collection:${encodeURIComponent(collection)}`);
  const response = await fetch(`https://${appId}.algolia.net/1/indexes/${indexName}/query`, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "x-algolia-application-id": appId,
      "x-algolia-api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      //"filters": `metafields.Akeneo.collection:${encodeURIComponent(collection)}`,
      "filters": `brand_name:"${brand}" AND metafields.Akeneo.collection:"${collection}"`,
      "length": 7,
      "offset": 0
    }),
    cache: 'force-cache',
    //next: { revalidate: 3600 }
  });

  const data = await response.json();

  return data.hits && data.hits.length > 0 ? data.hits.filter((item: any) => item.objectID !== objectId.toString()).slice(0, 6) : [];
}