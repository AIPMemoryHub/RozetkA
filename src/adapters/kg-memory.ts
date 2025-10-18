export type KGEdge = { from:string; to:string; rel:string; t:string };
const edges: KGEdge[] = [];

export async function insertTriples(cid: string, triples: KGEdge[]){
  edges.push(...triples);
  return { ok: true, count: triples.length };
}

export async function federatedQuery(rel?: string){
  return edges.filter(e => !rel || e.rel === rel);
}
