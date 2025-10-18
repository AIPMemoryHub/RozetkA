import type { Episode, Policy } from "./types.js";

const clamp = (n:number,a:number,b:number)=> Math.max(a, Math.min(b, n));
const decayByMinutes = (d:number, halfLife:number)=> Math.pow(0.5, d/Math.max(1, halfLife));

export function utilityScore(ep: Episode, agentRep: number, policy: Policy){
  const reuseC = (ep.reuse || 0) * policy.reuse_weight;
  const minutes = (Date.now() - new Date(ep.ts).getTime())/60000;
  const recC = decayByMinutes(minutes, policy.recency_half_life_min);
  const repC = (agentRep || 0)/100 * policy.rep_weight;
  return clamp(reuseC + recC + repC, 0, 10);
}
