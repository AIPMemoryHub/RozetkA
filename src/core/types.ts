export type Episode = {
  id: string;
  agent: string;
  title: string;
  cid: string;
  tags: string[];
  status: "success" | "fail" | "pending";
  reuse: number;
  ts: string;
  score?: number;
  result?: string;
  sources?: string[];
};

export type Policy = {
  reuse_weight: number;
  recency_half_life_min: number;
  rep_weight: number;
  min_score: number;
};

export const defaultPolicy: Policy = {
  reuse_weight: 1.0,
  recency_half_life_min: 120,
  rep_weight: 0.5,
  min_score: 0.35
};
