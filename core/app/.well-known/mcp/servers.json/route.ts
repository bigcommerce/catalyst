export const GET = async () => {
    const canonicalDomain: string = process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';
    const canonicalUrl = `https://store-${process.env.BIGCOMMERCE_STORE_HASH}-${process.env.BIGCOMMERCE_CHANNEL_ID}.${canonicalDomain}`
    const mcpServerUrl = `${canonicalUrl}/api/mcp`

  return new Response(JSON.stringify({
    servers: {
      [mcpServerUrl]: {
        name: 'primary',
        version: '1.0.0',
        description: 'MCP Server exposing shopping cart and checkout functionality',
      },
    },
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
