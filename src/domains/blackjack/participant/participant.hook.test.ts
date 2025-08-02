import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useParticipant } from "./participant.hook";
import { useParticipantStore } from "./participant.store";
import { createCoin } from "../../core/coin/coin.utils";
import { createHumanBrain } from "../brain/brain.utils";

describe("participant.hook", () => {
  beforeEach(() => {
    act(() => {
      useParticipantStore.getState().reset();
    });
  });

  describe("useParticipant", () => {
    it("should add a participant", () => {
      const { result } = renderHook(() => useParticipant());

      act(() => {
        result.current.addParticipant({
          id: "player1",
          name: "Alice",
          balance: createCoin(1000),
          brain: createHumanBrain(),
        });
      });

      expect(result.current.participants).toHaveLength(1);
      expect(result.current.participants[0].name).toBe("Alice");
    });

    it("should place a bet", () => {
      const { result } = renderHook(() => useParticipant());

      act(() => {
        result.current.addParticipant({
          id: "player1",
          name: "Alice",
          balance: createCoin(1000),
          brain: createHumanBrain(),
        });
      });

      act(() => {
        result.current.placeBet("player1", 200);
      });

      const participant = result.current.getParticipantById("player1");
      expect(participant?.bet?.value).toBe(200);
      expect(participant?.balance.value).toBe(800);
    });

    it("should get active participants", () => {
      const { result } = renderHook(() => useParticipant());

      act(() => {
        result.current.addParticipant({
          id: "player1",
          name: "Alice",
          balance: createCoin(1000),
          brain: createHumanBrain(),
        });
        
        result.current.addParticipant({
          id: "player2",
          name: "Bob",
          balance: createCoin(500),
          brain: createHumanBrain(),
        });
      });

      act(() => {
        result.current.placeBet("player1", 100);
      });

      expect(result.current.activeParticipants).toHaveLength(1);
      expect(result.current.activeParticipants[0].id).toBe("player1");
    });

    it("should check if can place bet", () => {
      const { result } = renderHook(() => useParticipant());

      act(() => {
        result.current.addParticipant({
          id: "player1",
          name: "Alice",
          balance: createCoin(1000),
          brain: createHumanBrain(),
        });
      });

      expect(result.current.canPlaceBet("player1", 500)).toBe(true);
      expect(result.current.canPlaceBet("player1", 1500)).toBe(false);
    });

    it("should check if can perform action", () => {
      const { result } = renderHook(() => useParticipant());

      act(() => {
        result.current.addParticipant({
          id: "player1",
          name: "Alice",
          balance: createCoin(1000),
          brain: createHumanBrain(),
        });
      });

      act(() => {
        result.current.placeBet("player1", 100);
      });

      expect(result.current.canPerformAction("player1", "hit")).toBe(false); // No hand yet
      
      // Update participant status to bust
      act(() => {
        result.current.updateParticipantStatus("player1", "bust");
      });

      expect(result.current.canPerformAction("player1", "hit")).toBe(false);
    });

    it("should handle participant not found gracefully", () => {
      const { result } = renderHook(() => useParticipant());

      expect(result.current.canPlaceBet("nonexistent", 100)).toBe(false);
      expect(result.current.canPerformAction("nonexistent", "hit")).toBe(false);
      
      act(() => {
        const updateResult = result.current.updateParticipantStatus("nonexistent", "bust");
        expect(updateResult).toBe(false);
      });
      
      expect(result.current.participants).toHaveLength(0);
    });
  });
});