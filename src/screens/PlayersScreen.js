import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../styles/theme';
import { useGame } from '../context/GameContext';
import { useAds } from '../context/AdContext';
import Button from '../components/Button';
import PlayerCard from '../components/PlayerCard';
import BannerAd from '../components/BannerAd';

const AVATARS = ['🎴', '🃏', '👤', '🎯', '⭐', '🎲', '🏆', '💎', '🎪', '🦊'];

export default function PlayersScreen({ navigation }) {
  const { players, addPlayer, removePlayer } = useGame();
  const { adsRemoved } = useAds();
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const handleAddPlayer = () => {
    const name = playerName.trim();
    if (!name) {
      Alert.alert('Error', 'Please enter a player name');
      return;
    }
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      Alert.alert('Error', 'A player with this name already exists');
      return;
    }
    addPlayer(name, selectedAvatar);
    setPlayerName('');
    setSelectedAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  };

  const handleRemovePlayer = (playerId) => {
    Alert.alert(
      'Remove Player',
      'Are you sure you want to remove this player?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removePlayer(playerId) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>Add New Player</Text>
          
          <View style={styles.avatarSelector}>
            {AVATARS.map((avatar) => (
              <Button
                key={avatar}
                title={avatar}
                variant={selectedAvatar === avatar ? 'primary' : 'ghost'}
                onPress={() => setSelectedAvatar(avatar)}
                style={styles.avatarButton}
                textStyle={styles.avatarButtonText}
              />
            ))}
          </View>
          
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter player name"
              placeholderTextColor={colors.textMuted}
              value={playerName}
              onChangeText={setPlayerName}
              onSubmitEditing={handleAddPlayer}
              returnKeyType="done"
            />
            <Button
              title="Add"
              onPress={handleAddPlayer}
              style={styles.addButton}
            />
          </View>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>
            Players ({players.length})
          </Text>
          
          {players.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>No players yet</Text>
              <Text style={styles.emptySubtext}>Add players to start a game</Text>
            </View>
          ) : (
            <FlatList
              data={players}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PlayerCard
                  player={item}
                  onRemove={handleRemovePlayer}
                />
              )}
              contentContainerStyle={adsRemoved ? styles.list : styles.listWithAd}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </KeyboardAvoidingView>
      <BannerAd style={styles.bannerAd} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  addSection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  avatarSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  avatarButton: {
    width: 44,
    height: 44,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    borderRadius: 22,
  },
  avatarButtonText: {
    fontSize: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginRight: spacing.sm,
  },
  addButton: {
    paddingHorizontal: spacing.lg,
  },
  listSection: {
    flex: 1,
    padding: spacing.lg,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  listWithAd: {
    paddingBottom: spacing.lg + 60,
  },
  bannerAd: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
  },
});
