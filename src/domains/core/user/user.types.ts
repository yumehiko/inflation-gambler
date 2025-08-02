import type { Coin } from "../coin/coin.types";

export type User = {
  readonly name: string;
  readonly coin: Coin;
};