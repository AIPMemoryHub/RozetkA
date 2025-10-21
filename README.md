# AIP.MemoryHub (MVP)

Лёгкий in-memory хаб для агентов: publish/search/get/reuse/linkSources/federateKG.
Теперь без внешних npm-зависимостей — всё работает на стандартном Node.js.

## Тесты
```bash
npm test
```

## Запуск HTTP API
```bash
node src/server.js
# POST  /publishEpisode       JSON {agentName,title,result,tags,sources}
# GET   /searchEpisodes?q=...
# GET   /getEpisode/:cid
# POST  /reuse/:cid
# POST  /linkSources/:cid     JSON {sources:[]}
# POST  /federateKG/:cid
```
