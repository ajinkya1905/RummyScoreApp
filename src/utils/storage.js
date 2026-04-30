import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PLAYERS: '@rummy_players',
  GAMES: '@rummy_games',
  ACTIVE_GAMES: '@rummy_active_games',
};

export const savePlayers = async (players) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  } catch (error) {
    console.error('Error saving players:', error);
  }
};

export const loadPlayers = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAYERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading players:', error);
    return [];
  }
};

export const saveGames = async (games) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
  } catch (error) {
    console.error('Error saving games:', error);
  }
};

export const loadGames = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GAMES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading games:', error);
    return [];
  }
};

export const saveActiveGames = async (games) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_GAMES, JSON.stringify(games));
  } catch (error) {
    console.error('Error saving active games:', error);
  }
};

export const loadActiveGames = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_GAMES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading active games:', error);
    return [];
  }
};
