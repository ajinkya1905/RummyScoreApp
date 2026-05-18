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
import Button from '../components/Button';
import BannerAd from '../components/BannerAd';

export default function ActiveGamesScreen({ navigation }) {
  const { activeGames, selectGame } = useGame();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectGame = (gameId) => {
    selectGame(gameId);
    navigation.navigate('Game');
  };

  const renderGameCard = ({ item: game }) => {
    const sortedPlayers = [...game.players].sort((a, b) => a.totalScore - b.totalScore);
    const leader = sortedPlayers[0];

    return (
      <TouchableOpacity
        style={styles.gameCard}
        onPress={() => handleSelectGame(game.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.gameName}>{game.name}</Text>
          <View style={styles.modeTag}>
            <Text style={styles.modeText}>{game.mode.name}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{game.players.length}</Text>
            <Text style={styles.statLabel}>Players</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{game.rounds.length}</Text>
            <Text style={styles.statLabel}>Rounds</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{leader?.avatar || '👤'}</Text>
            <Text style={styles.statLabel}>Leading</Text>
          </View>
        </View>

        <View style={styles.playersPreview}>
          {game.players.slice(0, 4).map((player, index) => (
            <View
              key={player.id}
              style={[styles.avatarSmall, { marginLeft: index > 0 ? -10 : 0 }]}
            >
              <Text style={styles.avatarSmallText}>{player.avatar}</Text>
            </View>
          ))}
          {game.players.length > 4 && (
            <View style={[styles.avatarSmall, styles.avatarMore, { marginLeft: -10 }]}>
              <Text style={styles.avatarMoreText}>+{game.players.length - 4}</Text>
            </View>
          )}
          <Text style={styles.dateText}>{formatDate(game.startedAt)}</Text>
        </View>

        <View style={styles.continueButton}>
          <Text style={styles.continueText}>Continue →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {activeGames.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎮</Text>
          <Text style={styles.emptyTitle}>No active games</Text>
          <Text style={styles.emptySubtitle}>Start a new game to begin playing</Text>
          <Button
            title="Start New Game"
            onPress={() => navigation.navigate('GameSetup')}
            style={styles.newGameButton}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={activeGames}
            keyExtractor={(item) => item.id}
            renderItem={renderGameCard}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
          <View style={styles.footer}>
            <BannerAd style={styles.bannerAd} />
            <Button
              title="+ Start Another Game"
              onPress={() => navigation.navigate('GameSetup')}
            />
          </View>
        </>
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
  gameName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
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
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 2,
  },
  playersPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarSmallText: {
    fontSize: 16,
  },
  avatarMore: {
    backgroundColor: colors.primary,
  },
  avatarMoreText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.surface,
  },
  dateText: {
    fontSize: 12,
    color: colors.textLight,
    marginLeft: 'auto',
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  continueText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 14,
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
    marginBottom: spacing.xl,
  },
  newGameButton: {
    paddingHorizontal: spacing.xl,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bannerAd: {
    marginBottom: spacing.md,
  },
});
