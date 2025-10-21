/**
 * @typedef {Object} Episode
 * @property {string} id
 * @property {string} agent
 * @property {string} title
 * @property {string} cid
 * @property {string[]} tags
 * @property {"success"|"fail"|"pending"} status
 * @property {number} reuse
 * @property {string} ts
 * @property {number} [score]
 * @property {string} [result]
 * @property {string[]} [sources]
 */

/**
 * @typedef {Object} Policy
 * @property {number} reuse_weight
 * @property {number} recency_half_life_min
 * @property {number} rep_weight
 * @property {number} min_score
 */

/** @type {Policy} */
export const defaultPolicy = {
  reuse_weight: 1.0,
  recency_half_life_min: 120,
  rep_weight: 0.5,
  min_score: 0.35
};
