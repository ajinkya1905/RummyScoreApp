import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../styles/theme';
import { computeSettlement } from '../utils/settlement';

export default function SettlementCard({ game }) {
  const [pointValue, setPointValue] = useState('');
  const { balances, transactions } = useMemo(() => computeSettlement(game), [game]);

  const rate = parseFloat(pointValue.replace(',', '.'));
  const hasRate = !isNaN(rate) && rate > 0;
  const playerById = Object.fromEntries(game.players.map((p) => [p.id, p]));
  const formatMoney = (points) => (points * rate).toFixed(2);

  return (
    <View style={styles.card}>
      <View style={styles.rateRow}>
        <Text style={styles.rateLabel}>Value per point</Text>
        <TextInput
          style={styles.rateInput}
          value={pointValue}
          onChangeText={setPointValue}
          placeholder="optional"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
        />
      </View>

      {transactions.length === 0 ? (
        <Text style={styles.emptyText}>All square - nobody owes anything.</Text>
      ) : (
        transactions.map((t, index) => (
          <View key={`${t.from}-${t.to}-${index}`} style={styles.txRow}>
            <Text style={styles.txNames} numberOfLines={1}>
              {playerById[t.from]?.avatar} {playerById[t.from]?.name}
              <Text style={styles.arrow}>  pays  </Text>
              {playerById[t.to]?.avatar} {playerById[t.to]?.name}
            </Text>
            <View style={styles.txAmount}>
              <Text style={styles.txPoints}>{t.amount} pts</Text>
              {hasRate && <Text style={styles.txMoney}>{formatMoney(t.amount)}</Text>}
            </View>
          </View>
        ))
      )}

      <Text style={styles.netTitle}>Net per player</Text>
      <View style={styles.netGrid}>
        {game.players.map((p) => {
          const net = balances[p.id] || 0;
          return (
            <View key={p.id} style={styles.netChip}>
              <Text style={styles.netName} numberOfLines={1}>{p.avatar} {p.name}</Text>
              <Text style={[styles.netValue, net > 0 && styles.positive, net < 0 && styles.negative]}>
                {net > 0 ? '+' : ''}{net}{hasRate ? ` (${formatMoney(net)})` : ''}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  rateLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  rateInput: {
    minWidth: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 15,
    color: colors.text,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  txNames: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '400',
  },
  txAmount: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  txPoints: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
  },
  txMoney: {
    fontSize: 12,
    color: colors.textLight,
  },
  netTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  netGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  netChip: {
    width: '50%',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  netName: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  netValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
    marginLeft: spacing.xs,
  },
  positive: {
    color: colors.success,
  },
  negative: {
    color: colors.danger,
  },
});
