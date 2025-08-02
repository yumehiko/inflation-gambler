import { create } from "zustand";
import type { User } from "./user.types";
import type { Coin } from "../coin/coin.types";
import { createUser, updateUserCoin, updateUserName } from "./user.utils";
import { createCoin } from "../coin/coin.utils";

type UserStore = {
  user: User;
  updateCoin: (coin: Coin) => void;
  updateName: (name: string) => void;
  reset: () => void;
};

export const initialUser = createUser("User", createCoin(100));

export const useUserStore = create<UserStore>((set) => ({
  user: initialUser,
  
  updateCoin: (coin) =>
    set((state) => ({
      user: updateUserCoin(state.user, coin),
    })),
    
  updateName: (name) =>
    set((state) => ({
      user: updateUserName(state.user, name),
    })),
    
  reset: () =>
    set(() => ({
      user: createUser("User", createCoin(100)),
    })),
}));