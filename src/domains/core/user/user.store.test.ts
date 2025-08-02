import { describe, it, expect, beforeEach } from "vitest";
import { useUserStore } from "./user.store";
import { createCoin } from "../coin/coin.utils";

describe("user.store", () => {
  beforeEach(() => {
    // Reset store before each test
    useUserStore.getState().reset();
  });

  describe("initial state", () => {
    it("should have default user with initial coin value", () => {
      const state = useUserStore.getState();
      expect(state.user.name).toBe("User");
      expect(state.user.coin.value).toBe(100);
    });
  });

  describe("updateCoin", () => {
    it("should update user's coin", () => {
      const store = useUserStore.getState();
      const newCoin = createCoin(500);
      
      store.updateCoin(newCoin);
      
      const updatedState = useUserStore.getState();
      expect(updatedState.user.coin.value).toBe(500);
    });
  });

  describe("updateName", () => {
    it("should update user's name", () => {
      const store = useUserStore.getState();
      
      store.updateName("Alice");
      
      const updatedState = useUserStore.getState();
      expect(updatedState.user.name).toBe("Alice");
    });
  });

  describe("reset", () => {
    it("should reset user to initial state", () => {
      const store = useUserStore.getState();
      const newCoin = createCoin(1000);
      
      store.updateCoin(newCoin);
      store.updateName("Bob");
      
      store.reset();
      
      const resetState = useUserStore.getState();
      expect(resetState.user.name).toBe("User");
      expect(resetState.user.coin.value).toBe(100);
    });
  });
});