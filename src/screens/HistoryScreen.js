import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../styles/theme';
import { useGame } from '../context/GameContext';

export default function HistoryScreen({ navigation }) {
  const { games } = useGame();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderGameCard = ({ item: game }) => {
    const sortedPlayers = [...game.players].sort((a, b) => a.totalScore - b.totalScore);
    const winner = game.winner || sortedPlayers[0];

    return (
      <TouchableOpacity
        style={styles.gameCard}
        onPress={() => navigation.navigate('GameDetail', { gameId: game.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.modeTag}>
            <Text style={styles.modeText}>{game.mode.name}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(game.startedAt)}</Text>
        </View>

        <View style={styles.winnerSection}>
          <Text style={styles.trophyIcon}>🏆</Text>
          <View style={styles.winnerInfo}>
            <Text style={styles.winnerLabel}>Winner</Text>
            <Text style={styles.winnerName}>{winner.name}</Text>
          </View>
          <Text style={styles.winnerScore}>{winner.totalScore} pts</Text>
        </View>

        <View style={styles.playersSection}>
          <Text style={styles.playersLabel}>
            {game.players.length} players • {game.rounds.length} rounds
          </Text>
          <View style={styles.playerAvatars}>
            {game.players.slice(0, 4).map((player, index) => (
              <View
                key={player.id}
                style={[styles.avatarSmall, { marginLeft: index > 0 ? -8 : 0 }]}
              >
                <Text style={styles.avatarSmallText}>{player.avatar}</Text>
              </View>
            ))}
            {game.players.length > 4 && (
              <View style={[styles.avatarSmall, styles.avatarMore, { marginLeft: -8 }]}>
                <Text style={styles.avatarMoreText}>+{game.players.length - 4}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {games.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No games yet</Text>
          <Text style={styles.emptySubtitle}>
            Your completed games will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item.id}
          renderItem={renderGameCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
  },
  gameCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modeTag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  dateText: {
    fontSize: 12,
    color: colors.textLight,
  },
  winnerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  trophyIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  winnerInfo: {
    flex: 1,
  },
  winnerLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  winnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  winnerScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  playersSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playersLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  playerAvatars: {
    flexDirection: 'row',
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarSmallText: {
    fontSize: 14,
  },
  avatarMore: {
    backgroundColor: colors.primary,
  },
  avatarMoreText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.surface,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
});
