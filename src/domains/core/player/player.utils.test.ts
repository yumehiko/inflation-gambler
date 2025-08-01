import { describe, it, expect } from "vitest";
import { createPlayer, updatePlayerCoin, updatePlayerName } from "./player.utils";
import { createCoin } from "../coin/coin.utils";

describe("player.utils", () => {
  describe("createPlayer", () => {
    it("should create a player with given properties", () => {
      const coin = createCoin(1000);
      const player = createPlayer("Alice", coin);
      
      expect(player.name).toBe("Alice");
      expect(player.coin.value).toBe(1000);
    });

    it("should create a player with zero coins", () => {
      const coin = createCoin(0);
      const player = createPlayer("Bob", coin);
      
      expect(player.name).toBe("Bob");
      expect(player.coin.value).toBe(0);
    });
  });

  describe("updatePlayerCoin", () => {
    it("should update player's coin", () => {
      const initialCoin = createCoin(1000);
      const player = createPlayer("Alice", initialCoin);
      
      const newCoin = createCoin(2000);
      const updatedPlayer = updatePlayerCoin(player, newCoin);
      
      expect(updatedPlayer.name).toBe("Alice");
      expect(updatedPlayer.coin.value).toBe(2000);
    });

    it("should return a new player object", () => {
      const coin = createCoin(1000);
      const player = createPlayer("Alice", coin);
      
      const newCoin = createCoin(2000);
      const updatedPlayer = updatePlayerCoin(player, newCoin);
      
      expect(updatedPlayer).not.toBe(player);
    });
  });

  describe("updatePlayerName", () => {
    it("should update player's name", () => {
      const coin = createCoin(1000);
      const player = createPlayer("Alice", coin);
      
      const updatedPlayer = updatePlayerName(player, "Bob");
      
      expect(updatedPlayer.name).toBe("Bob");
      expect(updatedPlayer.coin.value).toBe(1000);
    });

    it("should return a new player object", () => {
      const coin = createCoin(1000);
      const player = createPlayer("Alice", coin);
      
      const updatedPlayer = updatePlayerName(player, "Bob");
      
      expect(updatedPlayer).not.toBe(player);
    });
  });
});