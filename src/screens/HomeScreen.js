import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../styles/theme';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';

export default function HomeScreen({ navigation }) {
  const { activeGames, players, games, selectGame } = useGame();

  const handleResumeGame = (gameId) => {
    selectGame(gameId);
    navigation.navigate('Game');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🃏</Text>
        <Text style={styles.title}>Rummy Score</Text>
        <Text style={styles.subtitle}>Track your game scores easily</Text>
      </View>

      <View style={styles.content}>
        {activeGames.length > 0 && (
          <TouchableOpacity
            style={styles.resumeCard}
            activeOpacity={0.7}
            onPress={() => {
              if (activeGames.length === 1) {
                handleResumeGame(activeGames[0].id);
              } else {
                navigation.navigate('ActiveGames');
              }
            }}
          >
            <View style={styles.resumeInfo}>
              <Text style={styles.resumeTitle}>
                {activeGames.length === 1 ? 'Game in Progress' : `${activeGames.length} Active Games`}
              </Text>
              <Text style={styles.resumeSubtitle}>
                {activeGames.length === 1 
                  ? `${activeGames[0].players.length} players • Round ${activeGames[0].rounds.length + 1}`
                  : 'Tap to see all active games'
                }
              </Text>
            </View>
            <Text style={styles.resumeArrow}>→</Text>
          </TouchableOpacity>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{players.length}</Text>
            <Text style={styles.statLabel}>Players</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeGames.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{games.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Start New Game"
            onPress={() => navigation.navigate('GameSetup')}
            style={styles.mainButton}
          />
          <Button
            title="Manage Players"
            variant="secondary"
            onPress={() => navigation.navigate('Players')}
            style={styles.secondaryButton}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.historyLink}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.historyText}>View Game History →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  resumeInfo: {},
  resumeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.surface,
    marginBottom: 4,
  },
  resumeSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  resumeArrow: {
    fontSize: 24,
    color: colors.surface,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  actions: {
    marginTop: spacing.md,
  },
  mainButton: {
    marginBottom: spacing.md,
  },
  secondaryButton: {},
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  historyLink: {
    padding: spacing.md,
  },
  historyText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
});
