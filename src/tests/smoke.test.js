import test from "node:test";
import assert from "node:assert/strict";
import { hub } from "../hub.js";

test("AIP.MemoryHub smoke", async () => {
  const { cid, accepted } = await hub.publishEpisode({
    agentName: "Atlas",
    title: "Test",
    result: "ok",
    tags: ["demo", "aip"]
  });

  assert.equal(accepted, true);

  const hits = hub.searchEpisodes("demo");
  assert.ok(hits.find(h => h.cid === cid));

  const got = hub.getEpisode(cid);
  assert.equal(got?.episode.title, "Test");

  const reuseResult = hub.reuse(cid);
  assert.equal(reuseResult.ok, true);
});
