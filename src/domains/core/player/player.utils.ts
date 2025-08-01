import type { Player } from "./player.types";
import type { Coin } from "../coin/coin.types";

export const createPlayer = (name: string, coin: Coin): Player => ({
  name,
  coin,
});

export const updatePlayerCoin = (player: Player, coin: Coin): Player => ({
  ...player,
  coin,
});

export const updatePlayerName = (player: Player, name: string): Player => ({
  ...player,
  name,
});