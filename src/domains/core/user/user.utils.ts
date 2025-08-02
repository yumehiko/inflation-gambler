import type { User } from "./user.types";
import type { Coin } from "../coin/coin.types";

export const createUser = (name: string, coin: Coin): User => ({
  name,
  coin,
});

export const updateUserCoin = (user: User, coin: Coin): User => ({
  ...user,
  coin,
});

export const updateUserName = (user: User, name: string): User => ({
  ...user,
  name,
});