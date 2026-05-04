import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GameProvider } from './src/context/GameContext';
import { AdProvider } from './src/context/AdContext';
import { colors } from './src/styles/theme';

import HomeScreen from './src/screens/HomeScreen';
import PlayersScreen from './src/screens/PlayersScreen';
import GameSetupScreen from './src/screens/GameSetupScreen';
import GameScreen from './src/screens/GameScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import GameDetailScreen from './src/screens/GameDetailScreen';
import ActiveGamesScreen from './src/screens/ActiveGamesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: colors.surface,
  },
  headerTintColor: colors.text,
  headerTitleStyle: {
    fontWeight: '600',
  },
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: colors.background,
  },
  animation: 'fade',
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <AdProvider>
        <GameProvider>
          <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={screenOptions}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Players"
              component={PlayersScreen}
              options={{ title: 'Manage Players' }}
            />
            <Stack.Screen
              name="GameSetup"
              component={GameSetupScreen}
              options={{ title: 'New Game' }}
            />
            <Stack.Screen
              name="ActiveGames"
              component={ActiveGamesScreen}
              options={{ title: 'Active Games' }}
            />
            <Stack.Screen
              name="Game"
              component={GameScreen}
              options={{ 
                title: 'Game',
                headerBackVisible: false,
              }}
            />
            <Stack.Screen
              name="History"
              component={HistoryScreen}
              options={{ title: 'Game History' }}
            />
            <Stack.Screen
              name="GameDetail"
              component={GameDetailScreen}
              options={{ title: 'Game Details' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="dark" />
        </GameProvider>
      </AdProvider>
    </SafeAreaProvider>
  );
}
