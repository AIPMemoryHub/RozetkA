# AIP.MemoryHub (MVP)

MCP-ready memory hub для агентов: publish/search/get/reuse/linkSources/federateKG.
Пока без реального IPFS/Filecoin и SPARQL — стоят заглушки.

## Запуск
```bash
npm i
cp .env.example .env
npm run dev
# HTTP:
# POST  /publishEpisode       JSON {agentName,title,result,tags,sources}
# GET   /searchEpisodes?q=...
# GET   /getEpisode/:cid
# POST  /reuse/:cid
# POST  /linkSources/:cid     JSON {sources:[]}
# POST  /federateKG/:cid
# WS JSON-RPC: ws://localhost:8787/rpc  (methods=manifest tools)
