import { describe, it, expect } from "vitest";
import { createUser, updateUserCoin, updateUserName } from "./user.utils";
import { createCoin } from "../coin/coin.utils";

describe("user.utils", () => {
  describe("createUser", () => {
    it("should create a user with given properties", () => {
      const coin = createCoin(1000);
      const user = createUser("Alice", coin);
      
      expect(user.name).toBe("Alice");
      expect(user.coin.value).toBe(1000);
    });

    it("should create a user with zero coins", () => {
      const coin = createCoin(0);
      const user = createUser("Bob", coin);
      
      expect(user.name).toBe("Bob");
      expect(user.coin.value).toBe(0);
    });
  });

  describe("updateUserCoin", () => {
    it("should update user's coin", () => {
      const initialCoin = createCoin(1000);
      const user = createUser("Alice", initialCoin);
      
      const newCoin = createCoin(2000);
      const updatedUser = updateUserCoin(user, newCoin);
      
      expect(updatedUser.name).toBe("Alice");
      expect(updatedUser.coin.value).toBe(2000);
    });

    it("should return a new user object", () => {
      const coin = createCoin(1000);
      const user = createUser("Alice", coin);
      
      const newCoin = createCoin(2000);
      const updatedUser = updateUserCoin(user, newCoin);
      
      expect(updatedUser).not.toBe(user);
    });
  });

  describe("updateUserName", () => {
    it("should update user's name", () => {
      const coin = createCoin(1000);
      const user = createUser("Alice", coin);
      
      const updatedUser = updateUserName(user, "Bob");
      
      expect(updatedUser.name).toBe("Bob");
      expect(updatedUser.coin.value).toBe(1000);
    });

    it("should return a new user object", () => {
      const coin = createCoin(1000);
      const user = createUser("Alice", coin);
      
      const updatedUser = updateUserName(user, "Bob");
      
      expect(updatedUser).not.toBe(user);
    });
  });
});