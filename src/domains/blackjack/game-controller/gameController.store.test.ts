import { describe, it, expect, beforeEach } from "vitest";
import { useGameControllerStore } from "./gameController.store";

import { createParticipant } from "../participant/participant.utils";
import { createCoin } from "../../core/coin/coin.utils";
import { createHumanBrain } from "../brain/brain.utils";

describe("gameController.store", () => {
  beforeEach(() => {
    useGameControllerStore.setState({
      gameState: {
        phase: "waiting",
        participants: [],
        dealer: useGameControllerStore.getState().gameState.dealer,
        deck: useGameControllerStore.getState().gameState.deck,
        currentTurnIndex: -1,
        roundNumber: 0,
        history: [],
      },
    });
  });

  describe("initializeGame", () => {
    it("should initialize game with participants", () => {
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
        createParticipant({ id: "player2", name: "Player 2", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      
      useGameControllerStore.getState().initializeGame(participants);
      const gameState = useGameControllerStore.getState().gameState;
      
      expect(gameState.phase).toBe("waiting");
      expect(gameState.participants).toHaveLength(2);
      expect(gameState.participants[0].name).toBe("Player 1");
      expect(gameState.participants[1].name).toBe("Player 2");
    });
  });

  describe("startNewRound", () => {
    it("should start a new round and transition to betting", () => {
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      useGameControllerStore.getState().initializeGame(participants);
      
      useGameControllerStore.getState().startNewRound();
      const gameState = useGameControllerStore.getState().gameState;
      
      expect(gameState.phase).toBe("betting");
      expect(gameState.roundNumber).toBe(1);
    });
  });

  describe("placeBets", () => {
    it("should place bets and transition to dealing", () => {
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
        createParticipant({ id: "player2", name: "Player 2", balance: createCoin(500), brain: createHumanBrain() }),
      ];
      useGameControllerStore.getState().initializeGame(participants);
      useGameControllerStore.getState().startNewRound();
      
      const bets = new Map([
        ["player1", 100],
        ["player2", 50],
      ]);
      
      useGameControllerStore.getState().placeBets(bets);
      const gameState = useGameControllerStore.getState().gameState;
      
      expect(gameState.phase).toBe("dealing");
      expect(gameState.participants[0].bet?.value).toBe(100);
      expect(gameState.participants[1].bet?.value).toBe(50);
    });
  });

  describe("dealCards", () => {
    it("should deal initial cards and transition to playing", () => {
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      useGameControllerStore.getState().initializeGame(participants);
      useGameControllerStore.getState().startNewRound();
      useGameControllerStore.getState().placeBets(new Map([["player1", 100]]));
      
      useGameControllerStore.getState().dealCards();
      const gameState = useGameControllerStore.getState().gameState;
      
      expect(gameState.phase).toBe("playing");
      expect(gameState.participants[0].hand).not.toBeNull();
      expect(gameState.participants[0].hand?.cards).toHaveLength(2);
      expect(gameState.dealer.hand.cards).toHaveLength(2);
    });
  });

  describe("handlePlayerAction", () => {
    it("should handle player hit action", () => {
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      useGameControllerStore.getState().initializeGame(participants);
      useGameControllerStore.getState().startNewRound();
      useGameControllerStore.getState().placeBets(new Map([["player1", 100]]));
      useGameControllerStore.getState().dealCards();
      
      const initialCardCount = useGameControllerStore.getState().gameState.participants[0].hand?.cards.length || 0;
      
      useGameControllerStore.getState().handlePlayerAction("player1", { type: "hit" });
      const gameState = useGameControllerStore.getState().gameState;
      
      expect(gameState.participants[0].hand?.cards.length).toBe(initialCardCount + 1);
    });

    it("should handle player stand action", () => {
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      useGameControllerStore.getState().initializeGame(participants);
      useGameControllerStore.getState().startNewRound();
      useGameControllerStore.getState().placeBets(new Map([["player1", 100]]));
      useGameControllerStore.getState().dealCards();
      
      useGameControllerStore.getState().handlePlayerAction("player1", { type: "stand" });
      const gameState = useGameControllerStore.getState().gameState;
      
      expect(gameState.participants[0].status).toBe("stand");
      expect(gameState.phase).toBe("dealer-turn");
    });
  });

  describe("handleDealerTurn", () => {
    it("should complete dealer turn and transition to settlement", () => {
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      useGameControllerStore.getState().initializeGame(participants);
      useGameControllerStore.getState().startNewRound();
      useGameControllerStore.getState().placeBets(new Map([["player1", 100]]));
      useGameControllerStore.getState().dealCards();
      useGameControllerStore.getState().handlePlayerAction("player1", { type: "stand" });
      
      useGameControllerStore.getState().handleDealerTurn();
      const gameState = useGameControllerStore.getState().gameState;
      
      expect(gameState.phase).toBe("settlement");
      expect(gameState.dealer.isShowingHoleCard).toBe(true);
    });
  });

  describe("settleRound", () => {
    it("should settle round and update history", () => {
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      useGameControllerStore.getState().initializeGame(participants);
      useGameControllerStore.getState().startNewRound();
      useGameControllerStore.getState().placeBets(new Map([["player1", 100]]));
      useGameControllerStore.getState().dealCards();
      useGameControllerStore.getState().handlePlayerAction("player1", { type: "stand" });
      useGameControllerStore.getState().handleDealerTurn();
      
      const initialHistoryLength = useGameControllerStore.getState().gameState.history.length;
      
      useGameControllerStore.getState().settleRound();
      const gameState = useGameControllerStore.getState().gameState;
      
      expect(gameState.phase).toBe("waiting");
      expect(gameState.history.length).toBe(initialHistoryLength + 1);
    });
  });

  describe("getCurrentParticipant", () => {
    it("should return current participant during playing phase", () => {
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
        createParticipant({ id: "player2", name: "Player 2", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      useGameControllerStore.getState().initializeGame(participants);
      useGameControllerStore.getState().startNewRound();
      useGameControllerStore.getState().placeBets(new Map([["player1", 100], ["player2", 50]]));
      useGameControllerStore.getState().dealCards();
      
      const currentParticipant = useGameControllerStore.getState().getCurrentParticipant();
      
      expect(currentParticipant).not.toBeNull();
      expect(currentParticipant?.name).toBe("Player 1");
    });

    it("should return null when not in playing phase", () => {
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      useGameControllerStore.getState().initializeGame(participants);
      
      const currentParticipant = useGameControllerStore.getState().getCurrentParticipant();
      
      expect(currentParticipant).toBeNull();
    });
  });

  describe("canPerformAction", () => {
    it("should return true for valid action", () => {
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      useGameControllerStore.getState().initializeGame(participants);
      useGameControllerStore.getState().startNewRound();
      useGameControllerStore.getState().placeBets(new Map([["player1", 100]]));
      useGameControllerStore.getState().dealCards();
      
      const canPerform = useGameControllerStore.getState().canPerformAction("player1", { type: "hit" });
      
      expect(canPerform).toBe(true);
    });

    it("should return false for invalid action", () => {
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      useGameControllerStore.getState().initializeGame(participants);
      
      const canPerform = useGameControllerStore.getState().canPerformAction("player1", { type: "hit" });
      
      expect(canPerform).toBe(false);
    });
  });

  describe("reset", () => {
    it("should reset game state", () => {
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      useGameControllerStore.getState().initializeGame(participants);
      useGameControllerStore.getState().startNewRound();
      
      useGameControllerStore.getState().reset();
      const gameState = useGameControllerStore.getState().gameState;
      
      expect(gameState.phase).toBe("waiting");
      expect(gameState.participants).toHaveLength(0);
      expect(gameState.roundNumber).toBe(0);
      expect(gameState.history).toHaveLength(0);
    });
  });
});