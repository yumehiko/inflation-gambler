import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGameController } from "./gameController.hook";
import { useGameControllerStore } from "./gameController.store";
import { createParticipant } from "../participant/participant.utils";
import { createCoin } from "../../core/coin/coin.utils";
import { createHumanBrain } from "../brain/brain.utils";

describe("gameController.hook", () => {
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

  describe("useGameController", () => {
    it("should provide game state and actions", () => {
      const { result } = renderHook(() => useGameController());
      
      expect(result.current.phase).toBe("waiting");
      expect(result.current.participants).toHaveLength(0);
      expect(result.current.dealer).toBeDefined();
      expect(result.current.currentParticipant).toBeNull();
      expect(result.current.roundNumber).toBe(0);
      expect(result.current.history).toHaveLength(0);
      expect(typeof result.current.initializeGame).toBe("function");
      expect(typeof result.current.startNewRound).toBe("function");
      expect(typeof result.current.placeBets).toBe("function");
      expect(typeof result.current.dealCards).toBe("function");
      expect(typeof result.current.handlePlayerAction).toBe("function");
      expect(typeof result.current.handleDealerTurn).toBe("function");
      expect(typeof result.current.settleRound).toBe("function");
      expect(typeof result.current.canPerformAction).toBe("function");
      expect(typeof result.current.reset).toBe("function");
    });

    it("should initialize game with participants", () => {
      const { result } = renderHook(() => useGameController());
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
        createParticipant({ id: "player2", name: "Player 2", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      
      act(() => {
        result.current.initializeGame(participants);
      });
      
      expect(result.current.participants).toHaveLength(2);
      expect(result.current.participants[0].name).toBe("Player 1");
      expect(result.current.participants[1].name).toBe("Player 2");
    });

    it("should handle full game flow", () => {
      const { result } = renderHook(() => useGameController());
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      
      // Initialize game
      act(() => {
        result.current.initializeGame(participants);
      });
      
      expect(result.current.phase).toBe("waiting");
      
      // Start new round
      act(() => {
        result.current.startNewRound();
      });
      
      expect(result.current.phase).toBe("betting");
      expect(result.current.roundNumber).toBe(1);
      
      // Place bets
      act(() => {
        result.current.placeBets(new Map([["player1", 100]]));
      });
      
      expect(result.current.phase).toBe("dealing");
      expect(result.current.participants[0].bet?.value).toBe(100);
      
      // Deal cards
      act(() => {
        result.current.dealCards();
      });
      
      expect(result.current.phase).toBe("playing");
      expect(result.current.currentParticipant).not.toBeNull();
      expect(result.current.participants[0].hand).not.toBeNull();
      
      // Player action
      act(() => {
        result.current.handlePlayerAction("player1", { type: "stand" });
      });
      
      expect(result.current.phase).toBe("dealer-turn");
      expect(result.current.participants[0].status).toBe("stand");
      
      // Dealer turn
      act(() => {
        result.current.handleDealerTurn();
      });
      
      expect(result.current.phase).toBe("settlement");
      expect(result.current.dealer.isShowingHoleCard).toBe(true);
      
      // Settle round
      act(() => {
        result.current.settleRound();
      });
      
      expect(result.current.phase).toBe("waiting");
      expect(result.current.history).toHaveLength(1);
    });

    it("should check if action can be performed", () => {
      const { result } = renderHook(() => useGameController());
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      
      act(() => {
        result.current.initializeGame(participants);
        result.current.startNewRound();
        result.current.placeBets(new Map([["player1", 100]]));
        result.current.dealCards();
      });
      
      expect(result.current.canPerformAction("player1", { type: "hit" })).toBe(true);
      expect(result.current.canPerformAction("player1", { type: "stand" })).toBe(true);
      expect(result.current.canPerformAction("player2", { type: "hit" })).toBe(false);
    });

    it("should reset game state", () => {
      const { result } = renderHook(() => useGameController());
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      
      act(() => {
        result.current.initializeGame(participants);
        result.current.startNewRound();
      });
      
      expect(result.current.phase).toBe("betting");
      expect(result.current.participants).toHaveLength(1);
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.phase).toBe("waiting");
      expect(result.current.participants).toHaveLength(0);
      expect(result.current.roundNumber).toBe(0);
    });

    it("should handle active participants", () => {
      const { result } = renderHook(() => useGameController());
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
        createParticipant({ id: "player2", name: "Player 2", balance: createCoin(0), brain: createHumanBrain() }),
      ];
      
      act(() => {
        result.current.initializeGame(participants);
      });
      
      expect(result.current.activeParticipants).toHaveLength(1);
      expect(result.current.activeParticipants[0].name).toBe("Player 1");
    });

    it("should check if game is in progress", () => {
      const { result } = renderHook(() => useGameController());
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      
      act(() => {
        result.current.initializeGame(participants);
      });
      
      expect(result.current.isGameInProgress).toBe(false);
      
      act(() => {
        result.current.startNewRound();
      });
      
      expect(result.current.isGameInProgress).toBe(true);
      
      act(() => {
        result.current.placeBets(new Map([["player1", 100]]));
        result.current.dealCards();
        result.current.handlePlayerAction("player1", { type: "stand" });
        result.current.handleDealerTurn();
        result.current.settleRound();
      });
      
      expect(result.current.isGameInProgress).toBe(false);
    });
  });
});