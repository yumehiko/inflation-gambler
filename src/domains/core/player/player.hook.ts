import { usePlayerStore } from "./player.store";

export const usePlayer = () => {
  const { player, updateCoin, updateName, reset } = usePlayerStore();
  
  return {
    player,
    updateCoin,
    updateName,
    reset,
  };
};