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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../styles/theme';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';
import ScoreInput from '../components/ScoreInput';

export default function GameScreen({ navigation }) {
  const { currentGame, addRound, editRound, endGame, cancelGame, reentryPlayer } = useGame();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [roundScores, setRoundScores] = useState({});
  const [editingRoundIndex, setEditingRoundIndex] = useState(null);
  const [showReentryModal, setShowReentryModal] = useState(false);
  const [reentryPlayerData, setReentryPlayerData] = useState(null);
  const [reentryScore, setReentryScore] = useState('');

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

  // Get drop warning status for pool games
  const getDropWarningStatus = (player) => {
    const mode = currentGame.mode;
    if (mode.id !== 'pool101' && mode.id !== 'pool201') return null;
    if (player.isEliminated) return null;
    
    const poolLimit = mode.id === 'pool101' ? 101 : 201;
    const dropPoints = currentGame.dropPoints?.drop || 20;
    const middleDropPoints = currentGame.dropPoints?.middleDrop || 40;
    
    // Cannot drop at all (would be eliminated with a drop)
    if (player.totalScore + dropPoints >= poolLimit) {
      return 'cannotDrop';
    }
    // Can only drop once (middle drop would eliminate)
    if (player.totalScore + middleDropPoints >= poolLimit) {
      return 'canOnlyDropOnce';
    }
    return null;
  };

  // Check game end with new scores (before state updates)
  const checkGameEnd = (newScores) => {
    const mode = currentGame.mode;
    
    if (mode.id === 'pool101' || mode.id === 'pool201') {
      const poolLimit = mode.id === 'pool101' ? 101 : 201;
      
      // Calculate who would still be active after this round
      const playersAfterRound = currentGame.players.map(p => {
        const roundScore = newScores[p.id] || 0;
        const newTotal = p.totalScore + roundScore;
        return {
          ...p,
          totalScore: newTotal,
          isEliminated: p.isEliminated || newTotal >= poolLimit,
        };
      });
      
      const stillActive = playersAfterRound.filter(p => !p.isEliminated);
      if (stillActive.length === 1) {
        return stillActive[0];
      }
      // Also end if all remaining players would be eliminated (last one standing from before)
      if (stillActive.length === 0) {
        const wasActive = currentGame.players.filter(p => !p.isEliminated);
        if (wasActive.length > 0) {
          // Return the one with lowest score among those who were active
          return wasActive.sort((a, b) => (a.totalScore + (newScores[a.id] || 0)) - (b.totalScore + (newScores[b.id] || 0)))[0];
        }
      }
    }
    
    if (mode.id === 'points') {
      const playersAfterRound = currentGame.players.map(p => ({
        ...p,
        totalScore: p.totalScore + (newScores[p.id] || 0),
      }));
      
      const reachedTarget = playersAfterRound.find(
        p => p.totalScore >= currentGame.targetScore
      );
      if (reachedTarget) {
        // Lowest score wins
        return playersAfterRound.sort((a, b) => a.totalScore - b.totalScore)[0];
      }
    }
    
    // For deals: check if this will be the last round (current rounds + 1 new round)
    if (mode.id === 'deals' && (currentGame.rounds.length + 1) >= currentGame.targetScore) {
      const playersAfterRound = currentGame.players.map(p => ({
        ...p,
        totalScore: p.totalScore + (newScores[p.id] || 0),
      }));
      // Lowest score wins in deals
      return playersAfterRound.sort((a, b) => a.totalScore - b.totalScore)[0];
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
    
    // Check for game end immediately (only for new rounds)
    if (editingRoundIndex === null) {
      const winner = checkGameEnd(scores);
      if (winner) {
        // Calculate the winner's final score
        const finalScore = winner.totalScore + (scores[winner.id] || 0);
        setTimeout(() => {
          Alert.alert(
            '🏆 Game Over!',
            `${winner.name} wins with ${finalScore} points!`,
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
        }, 100);
      }
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

  // Get players eligible for re-entry (eliminated in the last round, haven't used re-entry yet)
  const getReentryEligiblePlayers = () => {
    const mode = currentGame.mode;
    // Allow re-entry for any pool rummy mode (pool101, pool201, or custom pool games)
    if (!mode.id.startsWith('pool')) return [];
    
    const currentRound = currentGame.rounds.length;
    return currentGame.players.filter(p => 
      p.isEliminated && 
      !p.hasUsedReentry && 
      p.eliminatedAtRound === currentRound
    );
  };

  const handleOpenReentry = (player) => {
    // Default score is max active player score + 1
    const maxActiveScore = Math.max(
      ...currentGame.players.filter(p => !p.isEliminated).map(p => p.totalScore),
      0
    );
    setReentryPlayerData(player);
    setReentryScore(String(maxActiveScore + 1));
    setShowReentryModal(true);
  };

  const handleConfirmReentry = () => {
    const score = parseInt(reentryScore);
    if (isNaN(score) || score < 0) {
      Alert.alert('Error', 'Please enter a valid score');
      return;
    }
    reentryPlayer(reentryPlayerData.id, score);
    setShowReentryModal(false);
    setReentryPlayerData(null);
    setReentryScore('');
  };

  const reentryEligiblePlayers = getReentryEligiblePlayers();

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
        
        {/* Re-entry notification for eligible players */}
        {reentryEligiblePlayers.length > 0 && (
          <View style={styles.reentryNotice}>
            <Text style={styles.reentryNoticeText}>Players eligible for re-entry:</Text>
            {reentryEligiblePlayers.map(player => (
              <TouchableOpacity 
                key={player.id} 
                style={styles.reentryButton}
                onPress={() => handleOpenReentry(player)}
              >
                <Text style={styles.reentryButtonText}>↩️ Re-enter {player.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Vertical table: Players as columns, Rounds as rows */}
        <View style={styles.verticalTable}>
          {/* Header row with player names */}
          <View style={styles.tableHeaderRow}>
            <View style={styles.roundLabelCell}>
              <Text style={styles.roundLabelText}>Round</Text>
            </View>
            {currentGame.players.map((player, index) => {
              const allPlayers = currentGame.players;
              const basePosition = currentGame.rounds.length % allPlayers.length;
              let dealerIndex = basePosition;
              for (let i = 0; i < allPlayers.length; i++) {
                const checkIndex = (basePosition + i) % allPlayers.length;
                if (!allPlayers[checkIndex].isEliminated) {
                  dealerIndex = checkIndex;
                  break;
                }
              }
              const isNextDealer = index === dealerIndex;
              const dropWarning = getDropWarningStatus(player);
              
              return (
                <View 
                  key={player.id} 
                  style={[
                    styles.playerColumnHeader,
                    player.isEliminated && styles.eliminatedColumn,
                    dropWarning === 'cannotDrop' && styles.cannotDropColumn,
                    dropWarning === 'canOnlyDropOnce' && styles.canOnlyDropOnceColumn,
                  ]}
                >
                  <Text style={[styles.playerColumnName, player.isEliminated && styles.eliminatedText]} numberOfLines={1}>
                    {player.name}
                  </Text>
                  <View style={styles.playerBadges}>
                    {isNextDealer && <View style={styles.dealerBadge}><Text style={styles.dealerBadgeText}>D</Text></View>}
                    {player.isEliminated && <Text style={styles.eliminatedIcon}>❌</Text>}
                    {player.hasUsedReentry && <Text style={styles.reentryIcon}>↩️</Text>}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Round rows */}
          {currentGame.rounds.map((round, roundIndex) => (
            <TouchableOpacity 
              key={roundIndex}
              style={styles.tableRow}
              onPress={() => handleOpenScoreModal(roundIndex)}
              activeOpacity={0.7}
            >
              <View style={styles.roundLabelCell}>
                <Text style={styles.roundNumber}>R{roundIndex + 1} ✎</Text>
              </View>
              {currentGame.players.map((player) => {
                const score = player.scores[roundIndex];
                const dropWarning = getDropWarningStatus(player);
                return (
                  <View key={player.id} style={[
                    styles.scoreCell, 
                    player.isEliminated && styles.eliminatedColumn,
                    dropWarning === 'cannotDrop' && styles.cannotDropColumn,
                    dropWarning === 'canOnlyDropOnce' && styles.canOnlyDropOnceColumn,
                  ]}>
                    {score === 0 ? (
                      <View style={styles.winnerBadge}>
                        <Text style={styles.winnerBadgeText}>R</Text>
                      </View>
                    ) : (
                      <Text style={[styles.scoreCellText, player.isEliminated && styles.eliminatedText]}>
                        {score}
                      </Text>
                    )}
                  </View>
                );
              })}
            </TouchableOpacity>
          ))}

          {/* Total row */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <View style={styles.roundLabelCell}>
              <Text style={styles.totalLabel}>Total</Text>
            </View>
            {currentGame.players.map((player) => {
              const dropWarning = getDropWarningStatus(player);
              return (
                <View key={player.id} style={[
                  styles.scoreCell, 
                  player.isEliminated && styles.eliminatedColumn,
                  dropWarning === 'cannotDrop' && styles.cannotDropColumn,
                  dropWarning === 'canOnlyDropOnce' && styles.canOnlyDropOnceColumn,
                ]}>
                  <Text style={[styles.totalScoreText, player.isEliminated && styles.eliminatedText]}>
                    {player.totalScore}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="+ Add Round Score"
          onPress={() => handleOpenScoreModal()}
        />
      </View>

      {/* Re-entry Modal */}
      <Modal
        visible={showReentryModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowReentryModal(false)}
      >
        <View style={styles.endModalOverlay}>
          <View style={styles.endModalContent}>
            <Text style={styles.endModalTitle}>Re-entry</Text>
            <Text style={styles.endModalText}>
              Re-enter {reentryPlayerData?.name} with score:
            </Text>
            <TextInput
              style={styles.reentryInput}
              keyboardType="numeric"
              value={reentryScore}
              onChangeText={setReentryScore}
              placeholder="Enter score"
            />
            <View style={styles.endModalButtons}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowReentryModal(false)}
                style={styles.endModalButton}
              />
              <Button
                title="Confirm"
                onPress={handleConfirmReentry}
                style={styles.endModalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

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
  // Vertical table styles
  verticalTable: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  totalRow: {
    borderBottomWidth: 0,
    backgroundColor: colors.background,
    marginTop: spacing.xs,
    borderRadius: borderRadius.md,
  },
  roundLabelCell: {
    width: 50,
    justifyContent: 'center',
    paddingRight: spacing.xs,
  },
  roundLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
  },
  roundNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
  playerColumnHeader: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
    minWidth: 45,
  },
  playerColumnName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  playerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  scoreCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 45,
  },
  scoreCellText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  totalScoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  eliminatedColumn: {
    opacity: 0.5,
  },
  cannotDropColumn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  canOnlyDropOnceColumn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  dealerBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 1,
  },
  dealerBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  eliminatedIcon: {
    fontSize: 10,
    marginHorizontal: 1,
  },
  reentryIcon: {
    fontSize: 10,
    marginHorizontal: 1,
  },
  winnerBadge: {
    backgroundColor: colors.success,
    borderRadius: 10,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  winnerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eliminatedText: {
    color: colors.textLight,
  },
  // Re-entry styles
  reentryNotice: {
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  reentryNoticeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  reentryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  reentryButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  reentryInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
