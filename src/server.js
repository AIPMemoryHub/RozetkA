import { createServer } from "http";
import { parse } from "url";
import { hub } from "./hub.js";

function send(res, status, body){
  const json = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json", "content-length": Buffer.byteLength(json) });
  res.end(json);
}

async function readJson(req){
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
  } catch (err) {
    throw new Error("Invalid JSON payload");
  }
}

function match(pathname, pattern){
  const parts = pathname.split("/").filter(Boolean);
  const patternParts = pattern.split("/").filter(Boolean);
  if (parts.length !== patternParts.length) return null;
  const params = {};
  for (let i = 0; i < parts.length; i++){
    const segment = patternParts[i];
    if (segment.startsWith(":")) {
      params[segment.slice(1)] = decodeURIComponent(parts[i]);
    } else if (segment !== parts[i]) {
      return null;
    }
  }
  return params;
}

export function startServer({ port = Number(process.env.PORT) || 8787 } = {}){
  const server = createServer(async (req, res) => {
    if (!req.url || !req.method) return send(res, 400, { error: "bad request" });
    const { pathname, query } = parse(req.url, true);

    try {
      if (req.method === "POST" && pathname === "/publishEpisode"){
        const payload = await readJson(req);
        return send(res, 200, await hub.publishEpisode(payload));
      }
      if (req.method === "GET" && pathname === "/searchEpisodes"){
        const q = typeof query.q === "string" ? query.q : "";
        return send(res, 200, { hits: hub.searchEpisodes(q) });
      }
      const getEpisodeParams = match(pathname, "/getEpisode/:cid");
      if (req.method === "GET" && getEpisodeParams){
        const result = hub.getEpisode(getEpisodeParams.cid);
        return result ? send(res, 200, result) : send(res, 404, { error: "not found" });
      }
      const reuseParams = match(pathname, "/reuse/:cid");
      if (req.method === "POST" && reuseParams){
        const result = hub.reuse(reuseParams.cid);
        return send(res, result.ok ? 200 : 404, result);
      }
      const linkParams = match(pathname, "/linkSources/:cid");
      if (req.method === "POST" && linkParams){
        const payload = await readJson(req);
        const sources = Array.isArray(payload.sources) ? payload.sources : [];
        const result = hub.linkSources(linkParams.cid, sources);
        return send(res, result.ok ? 200 : 404, result);
      }
      const federateParams = match(pathname, "/federateKG/:cid");
      if (req.method === "POST" && federateParams){
        const result = await hub.federateKG(federateParams.cid);
        return send(res, result.ok ? 200 : 404, result);
      }

      send(res, 404, { error: "not found" });
    } catch (err) {
      send(res, 400, { error: err?.message || String(err) });
    }
  });

  server.listen(port, () => {
    const address = server.address();
    const display = typeof address === "object" && address ? address.port : port;
    console.log(`AIP.MemoryHub listening on http://localhost:${display}`);
  });

  return server;
}

if (import.meta.url === `file://${process.argv[1]}`){
  startServer();
}
