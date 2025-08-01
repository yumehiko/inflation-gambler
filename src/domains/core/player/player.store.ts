import { create } from "zustand";
import type { Player } from "./player.types";
import type { Coin } from "../coin/coin.types";
import { createPlayer, updatePlayerCoin, updatePlayerName } from "./player.utils";
import { createCoin } from "../coin/coin.utils";

type PlayerStore = {
  player: Player;
  updateCoin: (coin: Coin) => void;
  updateName: (name: string) => void;
  reset: () => void;
};

const initialPlayer = createPlayer("Player", createCoin(100));

export const usePlayerStore = create<PlayerStore>((set) => ({
  player: initialPlayer,
  
  updateCoin: (coin) =>
    set((state) => ({
      player: updatePlayerCoin(state.player, coin),
    })),
    
  updateName: (name) =>
    set((state) => ({
      player: updatePlayerName(state.player, name),
    })),
    
  reset: () =>
    set(() => ({
      player: initialPlayer,
    })),
}));