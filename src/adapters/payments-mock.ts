const balances: Record<string, number> = {};

export function settle(agent: string, amount: number, memo = "reuse credit"){
  balances[agent] = (balances[agent] || 0) + amount;
  balances["broker"] = (balances["broker"] || 0) + 0; // брокерскую комиссию добавим позже
  return { ok: true, agent, amount, memo };
}

export function getBalances(){ return balances; }
