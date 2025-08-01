import type { Coin } from "../coin/coin.types";

export type Player = {
  readonly name: string;
  readonly coin: Coin;
};