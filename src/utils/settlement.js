// Points Rummy: in each round every loser pays the round winner (0 points) their round score.
export function computeBalances(game) {
  const balances = {};
  game.players.forEach((p) => {
    balances[p.id] = 0;
  });

  game.rounds.forEach((round) => {
    const entries = Object.entries(round.scores || {});
    const winners = entries.filter(([, score]) => score === 0);
    if (winners.length !== 1) return;
    const winnerId = winners[0][0];

    entries.forEach(([playerId, score]) => {
      if (playerId === winnerId || !(score > 0)) return;
      balances[playerId] = (balances[playerId] || 0) - score;
      balances[winnerId] = (balances[winnerId] || 0) + score;
    });
  });

  return balances;
}

function settleGreedy(people) {
  const debtors = people.filter((p) => p.amount < 0).map((p) => ({ ...p, amount: -p.amount }));
  const creditors = people.filter((p) => p.amount > 0).map((p) => ({ ...p }));
  const transactions = [];

  while (debtors.length && creditors.length) {
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    const debtor = debtors[0];
    const creditor = creditors[0];
    const amount = Math.min(debtor.amount, creditor.amount);

    transactions.push({ from: debtor.id, to: creditor.id, amount });
    debtor.amount -= amount;
    creditor.amount -= amount;
    if (debtor.amount === 0) debtors.shift();
    if (creditor.amount === 0) creditors.shift();
  }

  return transactions;
}

// Minimum transfers = people - (max number of disjoint zero-sum groups); exact via subset DP.
export function minimizeTransactions(balances) {
  const people = Object.entries(balances)
    .filter(([, amount]) => amount !== 0)
    .map(([id, amount]) => ({ id, amount }));
  const n = people.length;
  if (n === 0) return [];
  if (n > 12) return settleGreedy(people);

  const full = (1 << n) - 1;
  const sum = new Array(full + 1).fill(0);
  for (let mask = 1; mask <= full; mask++) {
    const low = mask & -mask;
    sum[mask] = sum[mask ^ low] + people[Math.log2(low)].amount;
  }

  const groups = new Array(full + 1).fill(-1);
  const choice = new Array(full + 1).fill(0);
  groups[0] = 0;
  for (let mask = 1; mask <= full; mask++) {
    if (sum[mask] !== 0) continue;
    const low = mask & -mask;
    for (let sub = mask; sub; sub = (sub - 1) & mask) {
      if (!(sub & low) || sum[sub] !== 0) continue;
      const rest = groups[mask ^ sub];
      if (rest >= 0 && rest + 1 > groups[mask]) {
        groups[mask] = rest + 1;
        choice[mask] = sub;
      }
    }
  }

  const transactions = [];
  for (let mask = full; mask; mask ^= choice[mask]) {
    const group = people.filter((_, i) => choice[mask] & (1 << i));
    transactions.push(...settleGreedy(group));
  }
  return transactions;
}

export function computeSettlement(game) {
  const balances = computeBalances(game);
  return { balances, transactions: minimizeTransactions(balances) };
}
