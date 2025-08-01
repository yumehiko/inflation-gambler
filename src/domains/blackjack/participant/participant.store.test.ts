import { describe, it, expect, beforeEach } from "vitest";
import { useParticipantStore } from "./participant.store";
import { createCoin } from "../../core/coin/coin.utils";
import { createHand } from "../hand/hand.utils";
import type { Card } from "../../core/card/card.types";

describe("participant.store", () => {
  beforeEach(() => {
    useParticipantStore.getState().reset();
  });

  describe("addParticipant", () => {
    it("should add a new participant", () => {
      const store = useParticipantStore.getState();
      
      store.addParticipant({
        id: "player1",
        name: "Alice",
        role: "player",
        balance: createCoin(1000),
      });

      const participants = useParticipantStore.getState().participants;
      expect(participants).toHaveLength(1);
      expect(participants[0].id).toBe("player1");
      expect(participants[0].name).toBe("Alice");
      expect(participants[0].balance.value).toBe(1000);
    });

    it("should add multiple participants", () => {
      const store = useParticipantStore.getState();
      
      store.addParticipant({
        id: "player1",
        name: "Alice",
        role: "player",
        balance: createCoin(1000),
      });
      
      store.addParticipant({
        id: "dealer1",
        name: "Dealer",
        role: "dealer",
        balance: createCoin(0),
      });

      expect(useParticipantStore.getState().participants).toHaveLength(2);
    });
  });

  describe("removeParticipant", () => {
    it("should remove a participant by id", () => {
      const store = useParticipantStore.getState();
      
      store.addParticipant({
        id: "player1",
        name: "Alice",
        role: "player",
        balance: createCoin(1000),
      });
      
      store.addParticipant({
        id: "player2",
        name: "Bob",
        role: "player",
        balance: createCoin(500),
      });

      store.removeParticipant("player1");

      const participants = useParticipantStore.getState().participants;
      expect(participants).toHaveLength(1);
      expect(participants[0].id).toBe("player2");
    });
  });

  describe("updateParticipant", () => {
    it("should update a participant", () => {
      const store = useParticipantStore.getState();
      
      store.addParticipant({
        id: "player1",
        name: "Alice",
        role: "player",
        balance: createCoin(1000),
      });

      const updatedParticipant = {
        ...useParticipantStore.getState().participants[0],
        status: "active" as const,
        bet: createCoin(100),
        balance: createCoin(900),
      };

      store.updateParticipant("player1", updatedParticipant);

      const participant = useParticipantStore.getState().participants[0];
      expect(participant.status).toBe("active");
      expect(participant.bet?.value).toBe(100);
      expect(participant.balance.value).toBe(900);
    });
  });

  describe("placeBet", () => {
    it("should place a bet for a participant", () => {
      const store = useParticipantStore.getState();
      
      store.addParticipant({
        id: "player1",
        name: "Alice",
        role: "player",
        balance: createCoin(1000),
      });

      store.placeBet("player1", 200);

      const participant = useParticipantStore.getState().participants[0];
      expect(participant.bet?.value).toBe(200);
      expect(participant.balance.value).toBe(800);
      expect(participant.status).toBe("active");
    });

    it("should throw error if participant not found", () => {
      const store = useParticipantStore.getState();
      
      expect(() => store.placeBet("nonexistent", 100)).toThrow();
    });
  });

  describe("updateParticipantHand", () => {
    it("should update participant hand", () => {
      const store = useParticipantStore.getState();
      
      store.addParticipant({
        id: "player1",
        name: "Alice",
        role: "player",
        balance: createCoin(1000),
      });

      const hand = createHand([
        { suit: "hearts", rank: "10", faceUp: true } as Card,
        { suit: "diamonds", rank: "5", faceUp: true } as Card,
      ]);

      store.updateParticipantHand("player1", hand);

      const participant = useParticipantStore.getState().participants[0];
      expect(participant.hand).toEqual(hand);
    });
  });

  describe("updateParticipantStatus", () => {
    it("should update participant status", () => {
      const store = useParticipantStore.getState();
      
      store.addParticipant({
        id: "player1",
        name: "Alice",
        role: "player",
        balance: createCoin(1000),
      });

      store.updateParticipantStatus("player1", "bust");

      const participant = useParticipantStore.getState().participants[0];
      expect(participant.status).toBe("bust");
    });
  });

  describe("clearParticipantHand", () => {
    it("should clear participant hand and reset status", () => {
      const store = useParticipantStore.getState();
      
      store.addParticipant({
        id: "player1",
        name: "Alice",
        role: "player",
        balance: createCoin(1000),
      });

      // Set up participant with hand and bet
      const hand = createHand([
        { suit: "hearts", rank: "10", faceUp: true } as Card,
      ]);
      store.updateParticipantHand("player1", hand);
      store.placeBet("player1", 100);

      // Clear hand
      store.clearParticipantHand("player1");

      const participant = useParticipantStore.getState().participants[0];
      expect(participant.hand).toBeNull();
      expect(participant.bet).toBeNull();
      expect(participant.status).toBe("waiting");
    });
  });

  describe("getParticipantById", () => {
    it("should return participant by id", () => {
      const store = useParticipantStore.getState();
      
      store.addParticipant({
        id: "player1",
        name: "Alice",
        role: "player",
        balance: createCoin(1000),
      });

      const participant = store.getParticipantById("player1");
      expect(participant?.id).toBe("player1");
    });

    it("should return undefined for non-existent id", () => {
      const store = useParticipantStore.getState();
      
      const participant = store.getParticipantById("nonexistent");
      expect(participant).toBeUndefined();
    });
  });

  describe("getActiveParticipants", () => {
    it("should return only active participants", () => {
      const store = useParticipantStore.getState();
      
      store.addParticipant({
        id: "player1",
        name: "Alice",
        role: "player",
        balance: createCoin(1000),
      });
      
      store.addParticipant({
        id: "player2",
        name: "Bob",
        role: "player",
        balance: createCoin(500),
      });

      store.placeBet("player1", 100);

      const activeParticipants = store.getActiveParticipants();
      expect(activeParticipants).toHaveLength(1);
      expect(activeParticipants[0].id).toBe("player1");
    });
  });

  describe("reset", () => {
    it("should clear all participants", () => {
      const store = useParticipantStore.getState();
      
      store.addParticipant({
        id: "player1",
        name: "Alice",
        role: "player",
        balance: createCoin(1000),
      });
      
      store.addParticipant({
        id: "player2",
        name: "Bob",
        role: "player",
        balance: createCoin(500),
      });

      store.reset();

      expect(store.participants).toHaveLength(0);
    });
  });
});