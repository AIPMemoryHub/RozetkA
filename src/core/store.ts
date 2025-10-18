import type { Episode, Policy } from "./types.js";
import { nowISO, pseudoCIDFromJSON } from "./cid.js";
import { utilityScore } from "./policy.js";
import { putJSON } from "../adapters/storage-local.js";

const REP: Record<string, number> = { Atlas: 86, Maya: 79, Lumen: 64, Kepler: 71 };

export class MemoryHub {
  private episodes: Episode[] = [];
  constructor(public policy: Policy){}

  evaluate(ep: Episode){
    const rep = REP[ep.agent] || 60;
    const score = utilityScore(ep, rep, this.policy);
    const accept = score >= this.policy.min_score;
    return { accept, score, reason: accept ? "ok" : "below-threshold" };
  }

  async publishEpisode(payload: any){
    const json = JSON.stringify(payload);
    const cid = pseudoCIDFromJSON(json);
    const ep: Episode = {
      id: "0x" + Math.random().toString(16).slice(2, 7),
      agent: payload.agentName || "Console",
      title: payload.title || payload.task || "Episode",
      cid,
      tags: Array.isArray(payload.tags) ? payload.tags.map(String) : ["custom"],
      status: "success",
      reuse: 0,
      ts: nowISO(),
      result: payload.result || "",
      sources: Array.isArray(payload.sources) ? payload.sources.slice(0,8) : []
    };
    const { accept, score } = this.evaluate(ep);
    if (accept) {
      await putJSON(payload);
      ep.score = score;
      this.episodes.push(ep);
    }
    return { cid: ep.cid, score, accepted: accept };
  }

  searchEpisodes(q: string){
    const s = String(q).toLowerCase();
    return this.episodes
      .filter(e => (e.title + " " + e.tags.join(" ") + " " + e.agent).toLowerCase().includes(s))
      .map(e => ({ cid:e.cid, title:e.title, tags:e.tags, score:e.score || 0, ts:e.ts }));
  }

  getEpisode(cid: string){
    const e = this.episodes.find(x => x.cid === cid);
    if (!e) return null;
    return { episode: e, rawCid: e.cid, sources: e.sources || [] };
  }

  reuse(cid: string){
    const e = this.episodes.find(x => x.cid === cid);
    if (!e) return { ok:false, reason: "not found" };
    e.reuse += 1;
    return { ok: true, reuse: e.reuse };
  }

  linkSources(cid: string, sources: string[]){
    const e = this.episodes.find(x => x.cid === cid);
    if (!e) return { ok:false, reason: "not found" };
    e.sources = Array.from(new Set([...(e.sources || []), ...sources])).slice(0, 16);
    return { ok:true, count: e.sources.length };
  }

  async federateKG(cid: string){
    // MVP: простая заглушка — вернём триплеты на основе тегов
    const e = this.episodes.find(x => x.cid === cid);
    if (!e) return { ok:false, reason: "not found" };
    const t = new Date().toISOString();
    const triples = (e.tags || []).map(tag => ({ from: "Episode:"+cid, to: "Tag:"+tag, rel: "hasTag", t }));
    return { ok:true, triples };
  }

  all(){ return this.episodes; }
}
