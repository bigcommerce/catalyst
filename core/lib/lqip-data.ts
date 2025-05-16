'use server';

type WaitUntilFunction = (promise: Promise<any>) => void;

// Safely access waitUntil without TypeScript errors
const getWaitUntil = (): WaitUntilFunction | undefined => {
  // @ts-expect-error - waitUntil might exist in Vercel environment
  if (typeof globalThis !== 'undefined' && typeof globalThis.waitUntil === 'function') {
    // @ts-expect-error - waitUntil might exist in Vercel environment
    return globalThis.waitUntil;
  }
  return undefined;
};

async function blobToBase64(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binaryString = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binaryString += String.fromCharCode(uint8Array[i]!);
  }
  return btoa(binaryString);
}

export async function getLqipData(url: string): Promise<string> {
  'use cache';
  
  try {
    const response = await fetch(url, { cache: 'force-cache' });
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    return `data:${blob.type};base64,${base64}`;
  } catch (error) {
    console.error('Failed to generate LQIP data:', error);
    return '';
  }
}

export function hydrateLqipCache(url: string): void {
  const waitUntil = getWaitUntil();
  if (waitUntil) {
    waitUntil(getLqipData(url));
  }
}
