import type { Coin } from "./coin.types";

export const createCoin = (value: number): Coin => ({
  value,
});

export const addCoins = (coin1: Coin, coin2: Coin): Coin => ({
  value: coin1.value + coin2.value,
});

export const multiplyCoins = (coin: Coin, multiplier: number): Coin => ({
  value: coin.value * multiplier,
});