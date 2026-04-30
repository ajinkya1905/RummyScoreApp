import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing } from '../styles/theme';

export default function ScoreInput({ player, value, onChange, error, dropPoints, hasWinner, isWinner }) {
  const handleQuickScore = (score) => {
    onChange(score.toString());
  };

  // Check if Show button should be disabled (another player already has 0)
  const showDisabled = hasWinner && !isWinner;

  return (
    <View style={styles.container}>
      <View style={styles.playerInfo}>
        <Text style={styles.avatar}>{player.avatar}</Text>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.currentScore}>Current: {player.totalScore}</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <View style={styles.quickButtons}>
          <TouchableOpacity 
            style={[styles.quickButton, styles.showButton, isWinner && styles.quickButtonActive, showDisabled && styles.quickButtonDisabled]} 
            onPress={() => handleQuickScore(0)}
            activeOpacity={0.7}
            disabled={showDisabled}
          >
            <Text style={[styles.quickButtonText, styles.showButtonText, isWinner && styles.quickButtonTextActive]}>W</Text>
            <Text style={[styles.quickButtonValue, isWinner && styles.quickButtonValueActive]}>0</Text>
          </TouchableOpacity>
          {dropPoints && (
            <>
              <TouchableOpacity 
                style={styles.quickButton} 
                onPress={() => handleQuickScore(dropPoints.drop)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickButtonText}>D</Text>
                <Text style={styles.quickButtonValue}>{dropPoints.drop}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickButton} 
                onPress={() => handleQuickScore(dropPoints.middleDrop)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickButtonText}>MD</Text>
                <Text style={styles.quickButtonValue}>{dropPoints.middleDrop}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickButton} 
                onPress={() => handleQuickScore(dropPoints.fullPoints)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickButtonText}>FP</Text>
                <Text style={styles.quickButtonValue}>{dropPoints.fullPoints}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, error && styles.inputError, isWinner && styles.inputWinner]}
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  currentScore: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickButtons: {
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  quickButton: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginHorizontal: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primary,
  },
  quickButtonValue: {
    fontSize: 10,
    color: colors.textLight,
  },
  inputContainer: {
    marginLeft: spacing.xs,
  },
  input: {
    width: 70,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.danger,
  },
  inputWinner: {
    borderColor: colors.success,
    backgroundColor: '#E8F5E9',
  },
  showButton: {
    backgroundColor: '#E8F5E9',
    borderColor: colors.success,
  },
  showButtonText: {
    color: colors.success,
  },
  quickButtonActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  quickButtonTextActive: {
    color: colors.surface,
  },
  quickButtonValueActive: {
    color: colors.surface,
  },
  quickButtonDisabled: {
    opacity: 0.4,
  },
});
