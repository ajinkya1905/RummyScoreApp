import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../styles/theme';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';
import PlayerCard from '../components/PlayerCard';
import GameModeCard from '../components/GameModeCard';

export default function GameSetupScreen({ navigation }) {
  const { players, gameModes, startGame, activeGames } = useGame();
  const [selectedMode, setSelectedMode] = useState(gameModes[0]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [targetScore, setTargetScore] = useState('500');
  const [gameName, setGameName] = useState('');
  const [step, setStep] = useState(1);
  
  // Drop points configuration
  const [dropPoints, setDropPoints] = useState('20');
  const [middleDropPoints, setMiddleDropPoints] = useState('40');
  const [fullPoints, setFullPoints] = useState('80');

  const togglePlayer = (player) => {
    setSelectedPlayers((prev) =>
      prev.find((p) => p.id === player.id)
        ? prev.filter((p) => p.id !== player.id)
        : [...prev, player]
    );
  };

  const handleStartGame = () => {
    if (selectedPlayers.length < 2) {
      Alert.alert('Error', 'Please select at least 2 players');
      return;
    }

    const name = gameName.trim() || `Game ${activeGames.length + 1}`;
    const gameDropPoints = {
      drop: parseInt(dropPoints) || 20,
      middleDrop: parseInt(middleDropPoints) || 40,
      fullPoints: parseInt(fullPoints) || 80,
    };
    startGame(selectedMode, selectedPlayers, parseInt(targetScore) || 500, name, gameDropPoints);
    navigation.replace('Game');
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Game Mode</Text>
      <Text style={styles.stepDescription}>
        Choose how you want to play
      </Text>
      
      <ScrollView style={styles.modeList} showsVerticalScrollIndicator={false}>
        {gameModes.map((mode) => (
          <GameModeCard
            key={mode.id}
            mode={mode}
            selected={selectedMode.id === mode.id}
            onSelect={setSelectedMode}
          />
        ))}
        
        {(selectedMode.id === 'points' || selectedMode.id === 'deals') && (
          <View style={styles.targetSection}>
            <Text style={styles.targetLabel}>
              {selectedMode.id === 'points' ? 'Target Score' : 'Number of Deals'}
            </Text>
            <TextInput
              style={styles.targetInput}
              keyboardType="numeric"
              value={targetScore}
              onChangeText={setTargetScore}
              placeholder={selectedMode.id === 'points' ? '500' : '5'}
            />
          </View>
        )}

        <View style={styles.targetSection}>
          <Text style={styles.targetLabel}>Game Name (optional)</Text>
          <TextInput
            style={styles.targetInput}
            value={gameName}
            onChangeText={setGameName}
            placeholder={`Game ${activeGames.length + 1}`}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.dropPointsSection}>
          <Text style={styles.sectionHeader}>Drop Points</Text>
          
          <View style={styles.dropPointRow}>
            <View style={styles.dropPointItem}>
              <Text style={styles.dropPointLabel}>Drop</Text>
              <TextInput
                style={styles.dropPointInput}
                keyboardType="numeric"
                value={dropPoints}
                onChangeText={setDropPoints}
                placeholder="20"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            
            <View style={styles.dropPointItem}>
              <Text style={styles.dropPointLabel}>Middle Drop</Text>
              <TextInput
                style={styles.dropPointInput}
                keyboardType="numeric"
                value={middleDropPoints}
                onChangeText={setMiddleDropPoints}
                placeholder="40"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            
            <View style={styles.dropPointItem}>
              <Text style={styles.dropPointLabel}>Full Points</Text>
              <TextInput
                style={styles.dropPointInput}
                keyboardType="numeric"
                value={fullPoints}
                onChangeText={setFullPoints}
                placeholder="80"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <Button
        title="Next: Select Players"
        onPress={() => setStep(2)}
        style={styles.nextButton}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Players</Text>
      <Text style={styles.stepDescription}>
        Choose who's playing ({selectedPlayers.length} selected)
      </Text>
      <Text style={styles.dealerNote}>
        Select players in dealing order (first selected = first dealer)
      </Text>

      {players.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyText}>No players available</Text>
          <Button
            title="Add Players"
            onPress={() => navigation.navigate('Players')}
            style={styles.addPlayersButton}
          />
        </View>
      ) : (
        <ScrollView style={styles.playerList} showsVerticalScrollIndicator={false}>
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              selected={selectedPlayers.some((p) => p.id === player.id)}
              onPress={() => togglePlayer(player)}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          variant="secondary"
          onPress={() => setStep(1)}
          style={styles.backButton}
        />
        <Button
          title="Start Game"
          onPress={handleStartGame}
          disabled={selectedPlayers.length < 2}
          style={styles.startButton}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.progressBar}>
        <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]}>
          <Text style={[styles.progressText, step >= 1 && styles.progressTextActive]}>
            1
          </Text>
        </View>
        <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
        <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]}>
          <Text style={[styles.progressText, step >= 2 && styles.progressTextActive]}>
            2
          </Text>
        </View>
      </View>

      {step === 1 ? renderStep1() : renderStep2()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepActive: {
    backgroundColor: colors.primary,
  },
  progressLine: {
    width: 60,
    height: 3,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  progressLineActive: {
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
  progressTextActive: {
    color: colors.surface,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: spacing.lg,
  },
  dealerNote: {
    fontSize: 14,
    color: colors.primary,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modeList: {
    flex: 1,
  },
  targetSection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  targetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  targetInput: {
    height: 48,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  playerList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  addPlayersButton: {
    paddingHorizontal: spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
  },
  backButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  startButton: {
    flex: 2,
  },
  nextButton: {
    marginVertical: spacing.lg,
  },
  dropPointsSection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  dropPointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropPointItem: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  dropPointLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  dropPointInput: {
    height: 44,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});
