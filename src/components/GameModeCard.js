import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing } from '../styles/theme';

export default function GameModeCard({ mode, selected, onSelect }) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={() => onSelect(mode)}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>
          {mode.id === 'points' ? '🎯' : 
           mode.id === 'pool101' ? '💯' : 
           mode.id === 'pool201' ? '🔢' : '🎴'}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, selected && styles.selectedText]}>
          {mode.name}
        </Text>
        <Text style={styles.description}>{mode.description}</Text>
      </View>
      {selected && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: '#E8F4F8',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  selectedText: {
    color: colors.primary,
  },
  description: {
    fontSize: 13,
    color: colors.textLight,
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
});
