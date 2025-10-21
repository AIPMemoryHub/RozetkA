/** @typedef {{ from:string, to:string, rel:string, t:string }} KGEdge */
const edges = [];

/**
 * @param {string} cid
 * @param {KGEdge[]} triples
 */
export async function insertTriples(cid, triples){
  void cid;
  edges.push(...triples);
  return { ok: true, count: triples.length };
}

export async function federatedQuery(rel){
  return edges.filter(e => !rel || e.rel === rel);
}
