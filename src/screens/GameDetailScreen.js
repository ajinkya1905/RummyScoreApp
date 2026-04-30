import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../styles/theme';
import { useGame } from '../context/GameContext';
import PlayerCard from '../components/PlayerCard';

export default function GameDetailScreen({ route, navigation }) {
  const { games } = useGame();
  const { gameId } = route.params;
  
  const game = games.find(g => g.id === gameId);
  
  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noGame}>
          <Text style={styles.noGameText}>Game not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sortedPlayers = [...game.players].sort((a, b) => a.totalScore - b.totalScore);
  const winner = game.winner || sortedPlayers[0];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.modeTag}>
            <Text style={styles.modeText}>{game.mode.name}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(game.startedAt)}</Text>
        </View>

        <View style={styles.winnerCard}>
          <Text style={styles.trophyIcon}>🏆</Text>
          <Text style={styles.winnerLabel}>Winner</Text>
          <Text style={styles.winnerName}>{winner.name}</Text>
          <Text style={styles.winnerScore}>{winner.totalScore} points</Text>
        </View>

        <Text style={styles.sectionTitle}>Final Standings</Text>
        {sortedPlayers.map((player, index) => (
          <PlayerCard
            key={player.id}
            player={player}
            rank={index + 1}
            showScore
          />
        ))}

        <Text style={styles.sectionTitle}>Score History</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.historyTable}>
            <View style={styles.historyHeader}>
              <Text style={[styles.historyHeaderCell, styles.playerColumn]}>Player</Text>
              {game.rounds.map((_, i) => (
                <Text key={i} style={styles.historyHeaderCell}>R{i + 1}</Text>
              ))}
              <Text style={[styles.historyHeaderCell, styles.totalColumn]}>Total</Text>
            </View>
            {game.players.map((player) => (
              <View key={player.id} style={styles.historyRow}>
                <View style={[styles.playerColumn, styles.playerCell]}>
                  <Text style={styles.playerAvatar}>{player.avatar}</Text>
                  <Text style={styles.playerName} numberOfLines={1}>{player.name}</Text>
                </View>
                {player.scores.map((score, i) => (
                  <Text key={i} style={styles.historyCell}>{score}</Text>
                ))}
                <Text style={[styles.historyCell, styles.totalColumn, styles.totalText]}>
                  {player.totalScore}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Game Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{game.rounds.length}</Text>
              <Text style={styles.statLabel}>Rounds</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{game.players.length}</Text>
              <Text style={styles.statLabel}>Players</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(
                  game.players.reduce((sum, p) => sum + p.totalScore, 0) / game.players.length
                )}
              </Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modeTag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  dateText: {
    fontSize: 12,
    color: colors.textLight,
  },
  winnerCard: {
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
  },
  trophyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  winnerLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  winnerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  winnerScore: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  historyTable: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minWidth: '100%',
  },
  historyHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  historyHeaderCell: {
    width: 50,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
    textAlign: 'center',
  },
  playerColumn: {
    width: 100,
    textAlign: 'left',
  },
  totalColumn: {
    width: 60,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  playerCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  playerName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    width: 70,
  },
  historyCell: {
    width: 50,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  totalText: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  noGame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noGameText: {
    fontSize: 18,
    color: colors.textLight,
  },
});
