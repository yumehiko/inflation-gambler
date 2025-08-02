import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUser } from "./user.hook";
import { useUserStore } from "./user.store";
import { createCoin } from "../coin/coin.utils";

describe("user.hook", () => {
  beforeEach(() => {
    // Reset store before each test
    useUserStore.getState().reset();
  });

  describe("useUser", () => {
    it("should return current user state", () => {
      const { result } = renderHook(() => useUser());
      
      expect(result.current.user.name).toBe("User");
      expect(result.current.user.coin.value).toBe(100);
    });

    it("should update coin", () => {
      const { result } = renderHook(() => useUser());
      const newCoin = createCoin(500);
      
      act(() => {
        result.current.updateCoin(newCoin);
      });
      
      expect(result.current.user.coin.value).toBe(500);
    });

    it("should update name", () => {
      const { result } = renderHook(() => useUser());
      
      act(() => {
        result.current.updateName("Alice");
      });
      
      expect(result.current.user.name).toBe("Alice");
    });

    it("should reset user", () => {
      const { result } = renderHook(() => useUser());
      const newCoin = createCoin(1000);
      
      act(() => {
        result.current.updateCoin(newCoin);
        result.current.updateName("Bob");
      });
      
      expect(result.current.user.name).toBe("Bob");
      expect(result.current.user.coin.value).toBe(1000);
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.user.name).toBe("User");
      expect(result.current.user.coin.value).toBe(100);
    });
  });
});