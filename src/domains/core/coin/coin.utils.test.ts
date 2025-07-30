import { describe, it, expect } from "vitest";
import { createCoin, addCoins, multiplyCoins } from "./coin.utils";

describe("coin.utils", () => {
  describe("createCoin", () => {
    it("should create a coin with the given value", () => {
      const coin = createCoin(100);
      expect(coin.value).toBe(100);
    });

    it("should create a coin with zero value", () => {
      const coin = createCoin(0);
      expect(coin.value).toBe(0);
    });

    it("should create a coin with negative value", () => {
      const coin = createCoin(-50);
      expect(coin.value).toBe(-50);
    });
  });

  describe("addCoins", () => {
    it("should add two coins", () => {
      const coin1 = createCoin(100);
      const coin2 = createCoin(50);
      const result = addCoins(coin1, coin2);
      expect(result.value).toBe(150);
    });

    it("should handle negative values", () => {
      const coin1 = createCoin(100);
      const coin2 = createCoin(-30);
      const result = addCoins(coin1, coin2);
      expect(result.value).toBe(70);
    });
  });

  describe("multiplyCoins", () => {
    it("should multiply coin value by multiplier", () => {
      const coin = createCoin(100);
      const result = multiplyCoins(coin, 2);
      expect(result.value).toBe(200);
    });

    it("should handle decimal multipliers", () => {
      const coin = createCoin(100);
      const result = multiplyCoins(coin, 0.5);
      expect(result.value).toBe(50);
    });

    it("should handle negative multipliers", () => {
      const coin = createCoin(100);
      const result = multiplyCoins(coin, -1);
      expect(result.value).toBe(-100);
    });
  });
});