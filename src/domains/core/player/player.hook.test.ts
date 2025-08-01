import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlayer } from "./player.hook";
import { usePlayerStore } from "./player.store";
import { createCoin } from "../coin/coin.utils";

describe("player.hook", () => {
  beforeEach(() => {
    // Reset store before each test
    usePlayerStore.getState().reset();
  });

  describe("usePlayer", () => {
    it("should return current player state", () => {
      const { result } = renderHook(() => usePlayer());
      
      expect(result.current.player.name).toBe("Player");
      expect(result.current.player.coin.value).toBe(100);
    });

    it("should update coin", () => {
      const { result } = renderHook(() => usePlayer());
      const newCoin = createCoin(500);
      
      act(() => {
        result.current.updateCoin(newCoin);
      });
      
      expect(result.current.player.coin.value).toBe(500);
    });

    it("should update name", () => {
      const { result } = renderHook(() => usePlayer());
      
      act(() => {
        result.current.updateName("Alice");
      });
      
      expect(result.current.player.name).toBe("Alice");
    });

    it("should reset player", () => {
      const { result } = renderHook(() => usePlayer());
      const newCoin = createCoin(1000);
      
      act(() => {
        result.current.updateCoin(newCoin);
        result.current.updateName("Bob");
      });
      
      expect(result.current.player.name).toBe("Bob");
      expect(result.current.player.coin.value).toBe(1000);
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.player.name).toBe("Player");
      expect(result.current.player.coin.value).toBe(100);
    });
  });
});