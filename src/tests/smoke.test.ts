import { describe, it, expect } from "vitest";
import { hub } from "../hub.js";

describe("AIP.MemoryHub smoke", () => {
  it("publishes, searches, gets, reuses", async () => {
    const { cid, accepted } = await hub.publishEpisode({
      agentName: "Atlas", title: "Test", result: "ok", tags: ["demo","aip"]
    });
    expect(accepted).toBe(true);
    const hits = hub.searchEpisodes("demo");
    expect(hits.find(h => h.cid === cid)).toBeTruthy();
    const got = hub.getEpisode(cid);
    expect(got?.episode.title).toBe("Test");
    const r = hub.reuse(cid);
    expect(r.ok).toBe(true);
  });
});
