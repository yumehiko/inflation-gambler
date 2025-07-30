import type { Player } from "./player.types";
import type { Coin } from "../coin/coin.types";

export const createPlayer = (id: string, name: string, coin: Coin): Player => ({
  id,
  name,
  coin,
});

export const updatePlayerCoin = (player: Player, coin: Coin): Player => ({
  ...player,
  coin,
});