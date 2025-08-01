import { describe, it, expect, beforeEach } from "vitest";
import { usePlayerStore } from "./player.store";
import { createCoin } from "../coin/coin.utils";

describe("player.store", () => {
  beforeEach(() => {
    // Reset store before each test
    usePlayerStore.getState().reset();
  });

  describe("initial state", () => {
    it("should have default player with initial coin value", () => {
      const state = usePlayerStore.getState();
      expect(state.player.name).toBe("Player");
      expect(state.player.coin.value).toBe(100);
    });
  });

  describe("updateCoin", () => {
    it("should update player's coin", () => {
      const store = usePlayerStore.getState();
      const newCoin = createCoin(500);
      
      store.updateCoin(newCoin);
      
      const updatedState = usePlayerStore.getState();
      expect(updatedState.player.coin.value).toBe(500);
    });
  });

  describe("updateName", () => {
    it("should update player's name", () => {
      const store = usePlayerStore.getState();
      
      store.updateName("Alice");
      
      const updatedState = usePlayerStore.getState();
      expect(updatedState.player.name).toBe("Alice");
    });
  });

  describe("reset", () => {
    it("should reset player to initial state", () => {
      const store = usePlayerStore.getState();
      const newCoin = createCoin(1000);
      
      store.updateCoin(newCoin);
      store.updateName("Bob");
      
      store.reset();
      
      const resetState = usePlayerStore.getState();
      expect(resetState.player.name).toBe("Player");
      expect(resetState.player.coin.value).toBe(100);
    });
  });
});