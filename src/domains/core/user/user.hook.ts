import { useUserStore } from "./user.store";

export const useUser = () => {
  const { user, updateCoin, updateName, reset } = useUserStore();
  
  return {
    user,
    updateCoin,
    updateName,
    reset,
  };
};