import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { savePlayers, loadPlayers, saveGames, loadGames, saveActiveGames, loadActiveGames } from '../utils/storage';

const GameContext = createContext();

const GAME_MODES = {
  POINTS_RUMMY: { 
    id: 'points', 
    name: 'Points Rummy', 
    description: 'Play until target score',
    dropPoints: { drop: 20, middleDrop: 40, fullPoints: 80 },
  },
  POOL_101: { 
    id: 'pool101', 
    name: 'Pool 101', 
    description: 'Elimination at 101 points',
    dropPoints: { drop: 20, middleDrop: 40, fullPoints: 80 },
  },
  POOL_201: { 
    id: 'pool201', 
    name: 'Pool 201', 
    description: 'Elimination at 201 points',
    dropPoints: { drop: 20, middleDrop: 40, fullPoints: 80 },
  },
  DEALS: { 
    id: 'deals', 
    name: 'Deals Rummy', 
    description: 'Fixed number of deals',
    dropPoints: { drop: 20, middleDrop: 40, fullPoints: 80 },
  },
};

const initialState = {
  players: [],
  games: [],
  activeGames: [],
  selectedGameId: null,
  gameModes: Object.values(GAME_MODES),
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        players: action.payload.players,
        games: action.payload.games,
        activeGames: action.payload.activeGames,
      };
    
    case 'ADD_PLAYER':
      const newPlayer = {
        id: Date.now().toString(),
        name: action.payload.name,
        avatar: action.payload.avatar || getRandomAvatar(),
        createdAt: new Date().toISOString(),
      };
      return { ...state, players: [...state.players, newPlayer] };
    
    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter(p => p.id !== action.payload),
      };
    
    case 'START_GAME':
      const newGame = {
        id: Date.now().toString(),
        name: action.payload.name || `Game ${state.activeGames.length + state.games.length + 1}`,
        mode: action.payload.mode,
        targetScore: action.payload.targetScore,
        dropPoints: action.payload.dropPoints || action.payload.mode.dropPoints,
        players: action.payload.players.map(p => ({
          ...p,
          scores: [],
          totalScore: 0,
          isEliminated: false,
        })),
        rounds: [],
        startedAt: new Date().toISOString(),
        status: 'active',
      };
      return { 
        ...state, 
        activeGames: [...state.activeGames, newGame],
        selectedGameId: newGame.id,
      };
    
    case 'SELECT_GAME':
      return { ...state, selectedGameId: action.payload };
    
    case 'ADD_ROUND':
      const gameToUpdate = state.activeGames.find(g => g.id === state.selectedGameId);
      if (!gameToUpdate) return state;
      
      const roundNumber = gameToUpdate.rounds.length + 1;
      const newRound = {
        id: Date.now().toString(),
        roundNumber,
        scores: action.payload.scores,
        timestamp: new Date().toISOString(),
      };
      
      const updatedPlayers = gameToUpdate.players.map(player => {
        const roundScore = action.payload.scores[player.id] || 0;
        const newTotal = player.totalScore + roundScore;
        const poolLimit = gameToUpdate.mode.id === 'pool101' ? 101 : 
                         gameToUpdate.mode.id === 'pool201' ? 201 : Infinity;
        
        return {
          ...player,
          scores: [...player.scores, roundScore],
          totalScore: newTotal,
          isEliminated: newTotal >= poolLimit,
        };
      });
      
      const updatedGame = {
        ...gameToUpdate,
        rounds: [...gameToUpdate.rounds, newRound],
        players: updatedPlayers,
      };
      
      return {
        ...state,
        activeGames: state.activeGames.map(g => 
          g.id === state.selectedGameId ? updatedGame : g
        ),
      };
    
    case 'END_GAME':
      const gameToEnd = state.activeGames.find(g => g.id === state.selectedGameId);
      if (!gameToEnd) return state;
      
      const finishedGame = {
        ...gameToEnd,
        status: 'completed',
        endedAt: new Date().toISOString(),
        winner: action.payload?.winner,
      };
      
      return {
        ...state,
        games: [finishedGame, ...state.games],
        activeGames: state.activeGames.filter(g => g.id !== state.selectedGameId),
        selectedGameId: null,
      };
    
    case 'CANCEL_GAME':
      return { 
        ...state, 
        activeGames: state.activeGames.filter(g => g.id !== state.selectedGameId),
        selectedGameId: null,
      };
    
    case 'EDIT_ROUND':
      const gameToEdit = state.activeGames.find(g => g.id === state.selectedGameId);
      if (!gameToEdit) return state;
      
      const roundIndex = action.payload.roundIndex;
      const newScores = action.payload.scores;
      
      // Update the round scores
      const updatedRounds = gameToEdit.rounds.map((round, idx) => {
        if (idx === roundIndex) {
          return { ...round, scores: newScores };
        }
        return round;
      });
      
      // Recalculate all player totals from scratch
      const recalculatedPlayers = gameToEdit.players.map(player => {
        const allScores = updatedRounds.map(round => round.scores[player.id] || 0);
        const newTotal = allScores.reduce((sum, s) => sum + s, 0);
        const poolLimit = gameToEdit.mode.id === 'pool101' ? 101 : 
                         gameToEdit.mode.id === 'pool201' ? 201 : Infinity;
        
        return {
          ...player,
          scores: allScores,
          totalScore: newTotal,
          isEliminated: newTotal >= poolLimit,
        };
      });
      
      const editedGame = {
        ...gameToEdit,
        rounds: updatedRounds,
        players: recalculatedPlayers,
      };
      
      return {
        ...state,
        activeGames: state.activeGames.map(g => 
          g.id === state.selectedGameId ? editedGame : g
        ),
      };
    
    default:
      return state;
  }
}

function getRandomAvatar() {
  const avatars = ['🎴', '🃏', '👤', '🎯', '⭐', '🎲', '🏆', '💎'];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      const [players, games, activeGames] = await Promise.all([
        loadPlayers(),
        loadGames(),
        loadActiveGames(),
      ]);
      dispatch({ type: 'LOAD_DATA', payload: { players, games, activeGames } });
    }
    loadData();
  }, []);

  // Save data when it changes
  useEffect(() => {
    savePlayers(state.players);
  }, [state.players]);

  useEffect(() => {
    saveGames(state.games);
  }, [state.games]);

  useEffect(() => {
    saveActiveGames(state.activeGames);
  }, [state.activeGames]);

  // Get current selected game
  const currentGame = state.activeGames.find(g => g.id === state.selectedGameId) || null;

  const actions = {
    addPlayer: (name, avatar) => dispatch({ type: 'ADD_PLAYER', payload: { name, avatar } }),
    removePlayer: (id) => dispatch({ type: 'REMOVE_PLAYER', payload: id }),
    startGame: (mode, players, targetScore, name, dropPoints) => 
      dispatch({ type: 'START_GAME', payload: { mode, players, targetScore, name, dropPoints } }),
    selectGame: (gameId) => dispatch({ type: 'SELECT_GAME', payload: gameId }),
    addRound: (scores) => dispatch({ type: 'ADD_ROUND', payload: { scores } }),
    editRound: (roundIndex, scores) => dispatch({ type: 'EDIT_ROUND', payload: { roundIndex, scores } }),
    endGame: (winner) => dispatch({ type: 'END_GAME', payload: { winner } }),
    cancelGame: () => dispatch({ type: 'CANCEL_GAME' }),
  };

  return (
    <GameContext.Provider value={{ ...state, currentGame, ...actions }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
