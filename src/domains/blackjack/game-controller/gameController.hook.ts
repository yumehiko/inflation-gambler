import { useGameControllerStore } from "./gameController.store";


export function useGameController() {
  const {
    gameState,
    initializeGame,
    startNewRound,
    placeBets,
    dealCards,
    handlePlayerAction,
    handleDealerTurn,
    settleRound,
    getCurrentParticipant,
    canPerformAction,
    reset,
  } = useGameControllerStore();

  const activeParticipants = gameState.participants.filter(
    (p) => p.balance.value > 0
  );

  const isGameInProgress = gameState.phase !== "waiting";

  return {
    // State
    phase: gameState.phase,
    participants: gameState.participants,
    dealer: gameState.dealer,
    deck: gameState.deck,
    currentParticipant: getCurrentParticipant(),
    currentTurnIndex: gameState.currentTurnIndex,
    roundNumber: gameState.roundNumber,
    history: gameState.history,
    activeParticipants,
    isGameInProgress,

    // Actions
    initializeGame,
    startNewRound,
    placeBets,
    dealCards,
    handlePlayerAction,
    handleDealerTurn,
    settleRound,
    canPerformAction,
    reset,
  };
}