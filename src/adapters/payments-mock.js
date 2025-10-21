const balances = Object.create(null);

export function settle(agent, amount, memo = "reuse credit"){
  balances[agent] = (balances[agent] || 0) + amount;
  balances.broker = (balances.broker || 0) + 0;
  return { ok: true, agent, amount, memo };
}

export function getBalances(){
  return { ...balances };
}
