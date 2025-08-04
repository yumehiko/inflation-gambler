import type { Coin } from "../coin/coin.types";

export type User = {
  readonly id: string;
  readonly name: string;
  readonly coin: Coin;
};