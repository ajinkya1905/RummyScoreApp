import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing } from '../styles/theme';

export default function PlayerCard({ 
  player, 
  onPress, 
  onRemove, 
  selected = false,
  showScore = false,
  rank,
}) {
  return (
    <TouchableOpacity 
      style={[styles.card, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.left}>
        {rank && (
          <View style={[styles.rank, rank === 1 && styles.rankFirst]}>
            <Text style={[styles.rankText, rank === 1 && styles.rankFirstText]}>
              {rank}
            </Text>
          </View>
        )}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{player.avatar || '👤'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{player.name}</Text>
          {player.isEliminated && (
            <Text style={styles.eliminated}>Eliminated</Text>
          )}
        </View>
      </View>
      
      <View style={styles.right}>
        {showScore && (
          <Text style={[styles.score, player.isEliminated && styles.eliminatedScore]}>
            {player.totalScore}
          </Text>
        )}
        {onRemove && (
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => onRemove(player.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.removeText}>✕</Text>
          </TouchableOpacity>
        )}
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#E8F4F8',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rankFirst: {
    backgroundColor: colors.warning,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  rankFirstText: {
    color: '#000',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  eliminated: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: spacing.sm,
  },
  eliminatedScore: {
    color: colors.danger,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
  },
});
