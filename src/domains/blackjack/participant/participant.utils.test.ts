import { describe, it, expect } from "vitest";
import {
  createParticipant,
  canPlaceBet,
  canPerformAction,
  placeBet,
  updateParticipantStatus,
  clearParticipantHand,
  isParticipantActive,
} from "./participant.utils";
import type { Participant } from "./participant.types";
import { createCoin } from "../../core/coin/coin.utils";
import { createHand } from "../hand/hand.utils";
import type { Card } from "../../core/card/card.types";
import { createHumanBrain } from "../brain/brain.utils";

describe("participant.utils", () => {
  describe("createParticipant", () => {
    it("should create a player participant with default values", () => {
      const participant = createParticipant({
        id: "player1",
        name: "Alice",
        balance: createCoin(1000),
        brain: createHumanBrain(),
      });

      expect(participant.id).toBe("player1");
      expect(participant.name).toBe("Alice");
      expect(participant.status).toBe("waiting");
      expect(participant.hand).toBeNull();
      expect(participant.bet).toBeNull();
      expect(participant.balance.value).toBe(1000);
    });


  });

  describe("canPlaceBet", () => {
    it("should return true when participant has enough balance and is waiting", () => {
      const participant = createParticipant({
        id: "player1",
        name: "Alice",
        balance: createCoin(1000),
        brain: createHumanBrain(),
      });

      expect(canPlaceBet(participant, 500)).toBe(true);
    });

    it("should return false when participant doesn't have enough balance", () => {
      const participant = createParticipant({
        id: "player1",
        name: "Alice",
        balance: createCoin(100),
        brain: createHumanBrain(),
      });

      expect(canPlaceBet(participant, 500)).toBe(false);
    });

    it("should return false when participant is not in waiting status", () => {
      const participant: Participant = {
        ...createParticipant({
          id: "player1",
          name: "Alice",
          balance: createCoin(1000),
          brain: createHumanBrain(),
        }),
        status: "active",
      };

      expect(canPlaceBet(participant, 500)).toBe(false);
    });
  });

  describe("canPerformAction", () => {
    const activeParticipant: Participant = {
      ...createParticipant({
          id: "player1",
          name: "Alice",
          balance: createCoin(1000),
          brain: createHumanBrain(),
        }),
      status: "active",
      hand: createHand([
        { suit: "hearts", rank: "10", faceUp: true } as Card,
        { suit: "diamonds", rank: "5", faceUp: true } as Card,
      ]),
      bet: createCoin(100),
    };

    it("should return true for hit when participant is active", () => {
      expect(canPerformAction(activeParticipant, "hit")).toBe(true);
    });

    it("should return true for stand when participant is active", () => {
      expect(canPerformAction(activeParticipant, "stand")).toBe(true);
    });

    it("should return false when participant is bust", () => {
      const bustParticipant: Participant = {
        ...activeParticipant,
        status: "bust",
      };

      expect(canPerformAction(bustParticipant, "hit")).toBe(false);
      expect(canPerformAction(bustParticipant, "stand")).toBe(false);
    });

    it("should return false when participant has no hand", () => {
      const noHandParticipant: Participant = {
        ...activeParticipant,
        hand: null,
      };

      expect(canPerformAction(noHandParticipant, "hit")).toBe(false);
    });

    it("should return true for double when participant can afford it", () => {
      const participant: Participant = {
        ...activeParticipant,
        balance: createCoin(200),
        bet: createCoin(100),
      };

      expect(canPerformAction(participant, "double")).toBe(true);
    });

    it("should return false for double when participant cannot afford it", () => {
      const participant: Participant = {
        ...activeParticipant,
        balance: createCoin(50),
        bet: createCoin(100),
      };

      expect(canPerformAction(participant, "double")).toBe(false);
    });
  });

  describe("placeBet", () => {
    it("should place bet and update participant", () => {
      const participant = createParticipant({
        id: "player1",
        name: "Alice",
        balance: createCoin(1000),
        brain: createHumanBrain(),
      });

      const updatedParticipant = placeBet(participant, 200);

      expect(updatedParticipant.bet?.value).toBe(200);
      expect(updatedParticipant.balance.value).toBe(800);
      expect(updatedParticipant.status).toBe("active");
    });

    it("should throw error when bet amount exceeds balance", () => {
      const participant = createParticipant({
        id: "player1",
        name: "Alice",
        balance: createCoin(100),
        brain: createHumanBrain(),
      });

      expect(() => placeBet(participant, 200)).toThrow();
    });
  });

  describe("updateParticipantStatus", () => {
    it("should update participant status", () => {
      const participant = createParticipant({
        id: "player1",
        name: "Alice",
        balance: createCoin(1000),
        brain: createHumanBrain(),
      });

      const updated = updateParticipantStatus(participant, "bust");
      expect(updated.status).toBe("bust");
    });
  });

  describe("clearParticipantHand", () => {
    it("should clear hand and reset to waiting status", () => {
      const participant: Participant = {
        ...createParticipant({
          id: "player1",
          name: "Alice",
          balance: createCoin(1000),
          brain: createHumanBrain(),
        }),
        status: "bust",
        hand: createHand([{ suit: "hearts", rank: "10", faceUp: true } as Card]),
        bet: createCoin(100),
      };

      const cleared = clearParticipantHand(participant);

      expect(cleared.hand).toBeNull();
      expect(cleared.bet).toBeNull();
      expect(cleared.status).toBe("waiting");
    });
  });

  describe("isParticipantActive", () => {
    it("should return true for active status", () => {
      const participant: Participant = {
        ...createParticipant({
          id: "player1",
          name: "Alice",
          balance: createCoin(1000),
          brain: createHumanBrain(),
        }),
        status: "active",
      };

      expect(isParticipantActive(participant)).toBe(true);
    });

    it("should return false for non-active status", () => {
      const waitingParticipant = createParticipant({
        id: "player1",
        name: "Alice",
        balance: createCoin(1000),
        brain: createHumanBrain(),
      });

      expect(isParticipantActive(waitingParticipant)).toBe(false);
    });
  });
});