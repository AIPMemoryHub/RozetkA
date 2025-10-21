import { nowISO, pseudoCIDFromJSON } from "./cid.js";
import { utilityScore } from "./policy.js";
import { putJSON } from "../adapters/storage-local.js";

const REP = { Atlas: 86, Maya: 79, Lumen: 64, Kepler: 71 };

export class MemoryHub {
  constructor(policy){
    this.policy = policy;
    this.episodes = [];
  }

  evaluate(ep){
    const rep = REP[ep.agent] || 60;
    const score = utilityScore(ep, rep, this.policy);
    const accept = score >= this.policy.min_score;
    return { accept, score, reason: accept ? "ok" : "below-threshold" };
  }

  async publishEpisode(payload){
    const json = JSON.stringify(payload);
    const cid = pseudoCIDFromJSON(json);
    const episode = {
      id: "0x" + Math.random().toString(16).slice(2, 7),
      agent: payload.agentName || "Console",
      title: payload.title || payload.task || "Episode",
      cid,
      tags: Array.isArray(payload.tags) ? payload.tags.map(String) : ["custom"],
      status: "success",
      reuse: 0,
      ts: nowISO(),
      result: payload.result || "",
      sources: Array.isArray(payload.sources) ? payload.sources.slice(0, 8) : []
    };

    const { accept, score } = this.evaluate(episode);
    if (accept) {
      await putJSON(payload);
      episode.score = score;
      this.episodes.push(episode);
    }
    return { cid: episode.cid, score, accepted: accept };
  }

  searchEpisodes(q){
    const needle = String(q).toLowerCase();
    return this.episodes
      .filter(e => (e.title + " " + e.tags.join(" ") + " " + e.agent).toLowerCase().includes(needle))
      .map(e => ({ cid: e.cid, title: e.title, tags: e.tags, score: e.score || 0, ts: e.ts }));
  }

  getEpisode(cid){
    const episode = this.episodes.find(x => x.cid === cid);
    if (!episode) return null;
    return { episode, rawCid: episode.cid, sources: episode.sources || [] };
  }

  reuse(cid){
    const episode = this.episodes.find(x => x.cid === cid);
    if (!episode) return { ok: false, reason: "not found" };
    episode.reuse += 1;
    return { ok: true, reuse: episode.reuse };
  }

  linkSources(cid, sources){
    const episode = this.episodes.find(x => x.cid === cid);
    if (!episode) return { ok: false, reason: "not found" };
    const nextSources = new Set([...(episode.sources || []), ...sources]);
    episode.sources = Array.from(nextSources).slice(0, 16);
    return { ok: true, count: episode.sources.length };
  }

  async federateKG(cid){
    const episode = this.episodes.find(x => x.cid === cid);
    if (!episode) return { ok: false, reason: "not found" };
    const t = new Date().toISOString();
    const triples = (episode.tags || []).map(tag => ({ from: `Episode:${cid}`, to: `Tag:${tag}`, rel: "hasTag", t }));
    return { ok: true, triples };
  }

  all(){
    return this.episodes;
  }
}
