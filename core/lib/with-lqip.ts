'use server';

async function blobToBase64(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binaryString = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binaryString += String.fromCharCode(uint8Array[i]!);
  }
  return btoa(binaryString);
}

const lqipData = async (url: string) => {
  'use cache'
  const response = await fetch(url, { cache: 'force-cache' }); // cache forever
  const blob = await response.blob();
  const base64 = await blobToBase64(blob);
  return `data:${blob.type};base64,${base64}`;
};

type HasLqip = {
  lqipUrl: string;
  blurDataURL?: string; // Make it optional since we'll add it
};

// Helper to check if an object has lqipUrl
function hasLqipUrl(obj: unknown): obj is HasLqip {
  return typeof obj === 'object' && obj !== null && 'lqipUrl' in obj;
}

// Recursive function to process the data
export async function withLQIP<T>(data: T): Promise<T> {
  if (!data || typeof data !== 'object' || process.env.DISABLE_LQIP === 'true') {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    const results = await Promise.all(data.map(item => withLQIP(item)));
    return results as unknown as T;
  }

  // Create a copy of the object to modify
  const result = { ...data };

  // Process all properties
  await Promise.all(
    Object.entries(result).map(async ([key, value]) => {
      if (hasLqipUrl(value)) {
          // Add blurDataURL to objects with lqipUrl by fetching a 10px wide
          // image from the BigCommerce CDN and inlining it as base64 data
        (result as any)[key] = {
          ...value,
          blurDataURL: await lqipData(value.lqipUrl),
        };
      } else if (typeof value === 'object' && value !== null) {
        // Recursively process nested objects
        (result as any)[key] = await withLQIP(value);
      }
    }),
  );

  return result;
}
