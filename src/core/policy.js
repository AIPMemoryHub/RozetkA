const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const decayByMinutes = (minutes, halfLife) => Math.pow(0.5, minutes / Math.max(1, halfLife));

/**
 * @param {import('./types.js').Episode} ep
 * @param {number} agentRep
 * @param {import('./types.js').Policy} policy
 */
export function utilityScore(ep, agentRep, policy) {
  const reuseContribution = (ep.reuse || 0) * policy.reuse_weight;
  const minutesFromNow = (Date.now() - new Date(ep.ts).getTime()) / 60000;
  const recencyContribution = decayByMinutes(minutesFromNow, policy.recency_half_life_min);
  const reputationContribution = (agentRep || 0) / 100 * policy.rep_weight;
  return clamp(reuseContribution + recencyContribution + reputationContribution, 0, 10);
}
