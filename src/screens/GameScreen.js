import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../styles/theme';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';
import ScoreInput from '../components/ScoreInput';

export default function GameScreen({ navigation }) {
  const { currentGame, addRound, editRound, endGame, cancelGame } = useGame();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [roundScores, setRoundScores] = useState({});
  const [editingRoundIndex, setEditingRoundIndex] = useState(null);

  if (!currentGame) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noGame}>
          <Text style={styles.noGameIcon}>🎴</Text>
          <Text style={styles.noGameText}>No active game</Text>
          <Button
            title="Start New Game"
            onPress={() => navigation.replace('GameSetup')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const activePlayers = currentGame.players.filter(p => !p.isEliminated);
  const sortedPlayers = [...currentGame.players].sort((a, b) => a.totalScore - b.totalScore);

  const checkGameEnd = () => {
    const mode = currentGame.mode;
    
    if (mode.id === 'pool101' || mode.id === 'pool201') {
      const stillActive = currentGame.players.filter(p => !p.isEliminated);
      if (stillActive.length === 1) {
        return stillActive[0];
      }
    }
    
    if (mode.id === 'points') {
      const reachedTarget = currentGame.players.find(
        p => p.totalScore >= currentGame.targetScore
      );
      if (reachedTarget) {
        return sortedPlayers[0]; // Lowest score wins in points rummy
      }
    }
    
    if (mode.id === 'deals' && currentGame.rounds.length >= currentGame.targetScore) {
      return sortedPlayers[0];
    }
    
    return null;
  };

  const handleOpenScoreModal = (roundIndex = null) => {
    const initialScores = {};
    if (roundIndex !== null && currentGame.rounds[roundIndex]) {
      // Editing existing round - pre-fill with existing scores
      const existingScores = currentGame.rounds[roundIndex].scores;
      currentGame.players.forEach(p => {
        initialScores[p.id] = existingScores[p.id]?.toString() || '0';
      });
      setEditingRoundIndex(roundIndex);
    } else {
      // New round
      activePlayers.forEach(p => {
        initialScores[p.id] = '';
      });
      setEditingRoundIndex(null);
    }
    setRoundScores(initialScores);
    setShowScoreModal(true);
  };

  const handleCloseScoreModal = () => {
    setShowScoreModal(false);
    setEditingRoundIndex(null);
  };

  const handleSubmitRound = () => {
    const scores = {};
    let zeroCount = 0;
    let hasAnyScore = false;
    
    for (const playerId of Object.keys(roundScores)) {
      const score = parseInt(roundScores[playerId]);
      if (roundScores[playerId] === '' || isNaN(score)) {
        Alert.alert('Error', 'Please enter scores for all players');
        return;
      }
      scores[playerId] = score;
      if (score === 0) zeroCount++;
      if (score > 0) hasAnyScore = true;
    }
    
    if (zeroCount === 0) {
      Alert.alert('Error', 'Round winner must have 0 points (Show/Winner)');
      return;
    }
    
    if (zeroCount > 1) {
      Alert.alert('Error', 'Only one player can have 0 points per round');
      return;
    }
    
    if (editingRoundIndex !== null) {
      // Editing existing round
      editRound(editingRoundIndex, scores);
    } else {
      // Adding new round
      addRound(scores);
    }
    handleCloseScoreModal();
    
    // Check for game end after a short delay (only for new rounds)
    if (editingRoundIndex === null) {
      setTimeout(() => {
        const winner = checkGameEnd();
        if (winner) {
          Alert.alert(
            '🏆 Game Over!',
            `${winner.name} wins with ${winner.totalScore} points!`,
            [
              {
                text: 'End Game',
                onPress: () => {
                  endGame(winner);
                  navigation.replace('Home');
                },
              },
            ]
          );
        }
      }, 100);
    }
  };

  const handleEndGame = () => {
    setShowEndModal(true);
  };

  const handleEndAndSave = () => {
    setShowEndModal(false);
    endGame(sortedPlayers[0]);
    navigation.replace('Home');
  };

  const handleCancelGame = () => {
    setShowEndModal(false);
    cancelGame();
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.gameInfo}>
          <Text style={styles.modeName}>{currentGame.name || currentGame.mode.name}</Text>
          <Text style={styles.roundInfo}>
            {currentGame.mode.name} • Round {currentGame.rounds.length + 1}
          </Text>
        </View>
        <Button
          title="End"
          variant="danger"
          onPress={handleEndGame}
          style={styles.endButton}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Scoreboard</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.historyTable}>
            <View style={styles.historyHeader}>
              <View style={styles.playerNameContainer}>
                <Text style={styles.historyPlayerCell}>Player</Text>
              </View>
              {currentGame.rounds.map((_, i) => (
                <TouchableOpacity 
                  key={i} 
                  onPress={() => handleOpenScoreModal(i)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.historyHeaderCell, styles.editableRound]}>R{i + 1} ✎</Text>
                </TouchableOpacity>
              ))}
              <Text style={[styles.historyHeaderCell, styles.totalCell]}>Total</Text>
            </View>
            {currentGame.players.map((player, index) => {
              // Dealer rotates: round 0 = player 0, round 1 = player 1, etc.
              const nextDealerIndex = currentGame.rounds.length % currentGame.players.length;
              const isNextDealer = index === nextDealerIndex;
              return (
                <View key={player.id} style={[styles.historyRow, player.isEliminated && styles.eliminatedRow]}>
                  <View style={styles.playerNameContainer}>
                    <Text style={[styles.historyPlayerCell, player.isEliminated && styles.eliminatedText]} numberOfLines={1}>
                      {player.name}
                    </Text>
                    {isNextDealer && <View style={styles.dealerBadge}><Text style={styles.dealerBadgeText}>D</Text></View>}
                    {player.isEliminated && <Text style={styles.eliminatedIcon}>❌</Text>}
                  </View>
                  {player.scores.map((score, i) => (
                    <Text key={i} style={[styles.historyCell, score === 0 && styles.winnerScore]}>
                      {score}
                    </Text>
                  ))}
                  <Text style={[styles.historyCell, styles.totalCell, player.isEliminated && styles.eliminatedText]}>
                    {player.totalScore}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="+ Add Round Score"
          onPress={() => handleOpenScoreModal()}
        />
      </View>

      <Modal
        visible={showScoreModal}
        animationType="fade"
        transparent={false}
        onRequestClose={handleCloseScoreModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={handleCloseScoreModal}
              style={styles.headerButton}
            />
            <Text style={styles.modalTitle}>
              {editingRoundIndex !== null 
                ? `Edit Round ${editingRoundIndex + 1}` 
                : `Round ${currentGame.rounds.length + 1}`}
            </Text>
            <Button
              title="Save"
              onPress={handleSubmitRound}
              style={styles.headerButton}
            />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Enter scores for each player (Winner gets 0)
            </Text>
            
            {(() => {
              // When editing, use all players from the round; for new rounds, use active players
              const playersToShow = editingRoundIndex !== null 
                ? currentGame.players.filter(p => currentGame.rounds[editingRoundIndex]?.scores[p.id] !== undefined)
                : activePlayers;
              
              // Check if any player has 0 points
              const winnerPlayerId = Object.keys(roundScores).find(
                id => roundScores[id] === '0' || roundScores[id] === 0
              );
              const hasWinner = !!winnerPlayerId;
              
              return playersToShow.map((player) => (
                <ScoreInput
                  key={player.id}
                  player={player}
                  value={roundScores[player.id]}
                  onChange={(value) =>
                    setRoundScores((prev) => ({ ...prev, [player.id]: value }))
                  }
                  dropPoints={currentGame.dropPoints}
                  hasWinner={hasWinner}
                  isWinner={winnerPlayerId === player.id}
                />
              ));
            })()}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showEndModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowEndModal(false)}
      >
        <View style={styles.endModalOverlay}>
          <View style={styles.endModalContent}>
            <Text style={styles.endModalTitle}>End Game</Text>
            <Text style={styles.endModalText}>
              Are you sure you want to end this game?
            </Text>
            <View style={styles.endModalButtons}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowEndModal(false)}
                style={styles.endModalButton}
              />
              <Button
                title="End & Save"
                onPress={handleEndAndSave}
                style={styles.endModalButton}
              />
            </View>
            <Button
              title="Cancel Game (Don't Save)"
              variant="danger"
              onPress={handleCancelGame}
              style={styles.endModalCancelButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  gameInfo: {},
  modeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  roundInfo: {
    fontSize: 14,
    color: colors.textLight,
  },
  endButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 36,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  historyTable: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  historyHeaderCell: {
    width: 60,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
    textAlign: 'center',
  },
  editableRound: {
    color: colors.primary,
  },
  historyRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  eliminatedRow: {
    opacity: 0.5,
  },
  playerNameContainer: {
    width: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyPlayerCell: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flexShrink: 1,
  },
  dealerBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  dealerBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eliminatedIcon: {
    marginLeft: 4,
    fontSize: 12,
  },
  historyCell: {
    width: 50,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  winnerScore: {
    color: colors.success,
    fontWeight: 'bold',
  },
  eliminatedText: {
    color: colors.textLight,
  },
  totalCell: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  noGame: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  noGameIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  noGameText: {
    fontSize: 18,
    color: colors.textLight,
    marginBottom: spacing.lg,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerButton: {
    minWidth: 80,
    paddingHorizontal: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: spacing.lg,
  },
  endModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  endModalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
  },
  endModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  endModalText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  endModalButtons: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  endModalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  endModalCancelButton: {
    marginTop: spacing.sm,
  },
});
