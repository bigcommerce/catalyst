import express from "express";
import httpProxy from "http-proxy";

const app = express();
const proxy = httpProxy.createProxyServer({ changeOrigin: true });
const port = 8080;

proxy.on("proxyReq", (_proxyReq, req, _res) => {
  const searchParams = new URL(req.headers["x-bc-graphql-url"]).searchParams;

  console.log();
  console.log(`[DATA CACHE MISS: ${req.headers["x-bc-request-hash"]}]`);
  console.log("  | Operation:", searchParams.get("operation"));
});

app.all("/graphql", (req, res) => {
  let target;

  try {
    const parsedUrl = new URL(req.headers["x-bc-graphql-url"]);
    target = parsedUrl.origin;
    req.url = parsedUrl.pathname + parsedUrl.search;
  } catch {
    return res.status(400).send("Invalid 'x-bc-graphql-url' header");
  }

  proxy.web(req, res, { target, headers: { host: new URL(target).host } });
});

app.listen(port, () => {
  console.log(`Catalyst proxy listening on port ${port}`);
});
