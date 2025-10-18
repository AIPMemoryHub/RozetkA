import "dotenv/config";
import express from "express";
import { hub } from "./hub.js";
import { WebSocketServer } from "ws";

const app = express();
app.use(express.json({ limit: "1mb" }));

// ---- HTTP endpoints (для локальной проверки без MCP клиента)
app.post("/publishEpisode", async (req, res) => {
  try { const r = await hub.publishEpisode(req.body); res.json(r); }
  catch (e:any){ res.status(400).json({ error: String(e.message || e) }); }
});

app.get("/searchEpisodes", (req, res) => {
  const q = String(req.query.q || "");
  res.json({ hits: hub.searchEpisodes(q) });
});

app.get("/getEpisode/:cid", (req, res) => {
  const r = hub.getEpisode(req.params.cid);
  if (!r) return res.status(404).json({ error: "not found" });
  res.json(r);
});

app.post("/reuse/:cid", (req, res) => {
  const r = hub.reuse(req.params.cid);
  if (!r.ok) return res.status(404).json(r);
  res.json(r);
});

app.post("/linkSources/:cid", (req, res) => {
  const src = Array.isArray(req.body?.sources) ? req.body.sources : [];
  const r = hub.linkSources(req.params.cid, src);
  if (!r.ok) return res.status(404).json(r);
  res.json(r);
});

app.post("/federateKG/:cid", async (req, res) => {
  const r = await hub.federateKG(req.params.cid);
  if (!r.ok) return res.status(404).json(r);
  res.json(r);
});

// ---- WebSocket JSON-RPC (заготовка под MCP-интеграцию)
const wss = new WebSocketServer({ noServer: true });
wss.on("connection", (ws) => {
  ws.on("message", async (buf) => {
    try {
      const msg = JSON.parse(String(buf));
      const { id, method, params } = msg;
      const send = (result:any)=> ws.send(JSON.stringify({ jsonrpc:"2.0", id, result }));
      switch(method){
        case "publishEpisode": return send(await hub.publishEpisode(params?.json));
        case "searchEpisodes": return send({ hits: hub.searchEpisodes(params?.query || "") });
        case "getEpisode":     return send(hub.getEpisode(params?.cid));
        case "reuse":          return send(hub.reuse(params?.cid));
        case "linkSources":    return send(hub.linkSources(params?.cid, params?.sources || []));
        case "federateKG":     return send(await hub.federateKG(params?.cid));
        default: return ws.send(JSON.stringify({ jsonrpc:"2.0", id, error:{ code:-32601, message:"method not found" } }));
      }
    } catch(e:any){
      ws.send(JSON.stringify({ jsonrpc:"2.0", id:null, error:{ code:-32000, message:String(e?.message || e) }}));
    }
  });
});

const server = app.listen(process.env.PORT || 8787, ()=> {
  const { port } = server.address() as any;
  console.log(`AIP.MemoryHub listening on http://localhost:${port}`);
});

server.on("upgrade", (req, socket, head) => {
  // Пример: ws://localhost:8787/rpc
  if (req.url === "/rpc") {
    wss.handleUpgrade(req, socket as any, head, (ws) => wss.emit("connection", ws, req));
  } else {
    socket.destroy();
  }
});
