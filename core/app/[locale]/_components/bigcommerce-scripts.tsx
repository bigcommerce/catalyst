import Script from 'next/script'

type BigCommerceScript = {
  id: string;
  html: string;
  loadStrategy: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
}

async function fetchBigCommerceScripts(): Promise<BigCommerceScript[]> {
  const response = await fetch(`https://api.bigcommerce.com/stores/${process.env.BIGCOMMERCE_STORE_HASH}/v3/content/scripts?channel_id:in=${process.env.BIGCOMMERCE_CHANNEL_ID}`, {
    headers: {
      'X-Auth-Token': process.env.BIGCOMMERCE_CONTENT_V3_API_TOKEN as string,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 3600 } // revalidate every hour
  })

  if (!response.ok) {
    throw new Error('Failed to fetch BigCommerce scripts')
  }

  const data = await response.json()

  // Filter and process scripts to only include those with HTML content
  return data.data
  .filter((script: any) => script.kind === 'script_tag' && script.html)
  .map((script: any) => {
    const html = script.html

    // The html below is being stripped of it's first and last tags, 
    // since BigCommerce scripts require a wrapping tag while next/script does not.
    return {
      id: script.uuid,
      html: html.slice(
        html.indexOf('>') + 1,
        html.lastIndexOf('<')
      ),
      loadStrategy: script.load_method === 'default' ? 'afterInteractive' : 
                    script.load_method === 'async' ? 'lazyOnload' : 'beforeInteractive'
    }
  })
}

export default async function BigCommerceScripts() {
  const scripts = await fetchBigCommerceScripts()

  return (
    <>
      {scripts.map((script) => (
        <Script
          key={script.id}
          id={script.id}
          dangerouslySetInnerHTML={{ __html: script.html }}
          strategy={script.loadStrategy}
        />
      ))}
    </>
  )
}
