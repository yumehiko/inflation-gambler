import { create } from "zustand";
import { GameState, GameAction } from "./gameController.types";
import { Participant } from "../participant/participant.types";
import {
  initializeGame as initGame,
  startNewRound as startRound,
  processBets,
  dealInitialCards,
  processPlayerAction,
  processDealerTurn as dealerTurn,
  settleRound as settle,
  validateAction,
} from "./gameController.utils";
import { createDealer } from "../dealer/dealer.utils";
import { createDeck } from "../../core/deck/deck.utils";

type GameControllerState = {
  gameState: GameState;
};

type GameControllerActions = {
  initializeGame: (participants: Participant[]) => void;
  startNewRound: () => void;
  placeBets: (bets: Map<string, number>) => void;
  dealCards: () => void;
  handlePlayerAction: (participantId: string, action: GameAction) => void;
  handleDealerTurn: () => void;
  settleRound: () => void;
  getCurrentParticipant: () => Participant | null;
  canPerformAction: (participantId: string, action: GameAction) => boolean;
  reset: () => void;
};

type GameControllerStore = GameControllerState & GameControllerActions;

const initialState: GameState = {
  phase: "waiting",
  participants: [],
  dealer: createDealer(),
  deck: createDeck(),
  currentTurnIndex: -1,
  roundNumber: 0,
  history: [],
};

export const useGameControllerStore = create<GameControllerStore>((set, get) => ({
  gameState: initialState,

  initializeGame: (participants) => {
    set({ gameState: initGame(participants) });
  },

  startNewRound: () => {
    const { gameState } = get();
    set({ gameState: startRound(gameState) });
  },

  placeBets: (bets) => {
    const { gameState } = get();
    set({ gameState: processBets(gameState, bets) });
  },

  dealCards: () => {
    const { gameState } = get();
    set({ gameState: dealInitialCards(gameState) });
  },

  handlePlayerAction: (participantId, action) => {
    const { gameState } = get();
    set({ gameState: processPlayerAction(gameState, participantId, action) });
  },

  handleDealerTurn: () => {
    const { gameState } = get();
    set({ gameState: dealerTurn(gameState) });
  },

  settleRound: () => {
    const { gameState } = get();
    set({ gameState: settle(gameState) });
  },

  getCurrentParticipant: () => {
    const { gameState } = get();
    if (gameState.phase !== "playing" || gameState.currentTurnIndex < 0) {
      return null;
    }
    return gameState.participants[gameState.currentTurnIndex] || null;
  },

  canPerformAction: (participantId, action) => {
    const { gameState } = get();
    return validateAction(gameState, participantId, action);
  },

  reset: () => {
    set({ gameState: initialState });
  },
}));