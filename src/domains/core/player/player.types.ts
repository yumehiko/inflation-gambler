import type { Coin } from "../coin/coin.types";

export type Player = {
  readonly id: string;
  readonly name: string;
  readonly coin: Coin;
};