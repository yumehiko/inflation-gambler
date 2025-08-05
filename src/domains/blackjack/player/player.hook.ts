import { usePlayerStore } from './player.store';
import { Hand } from '../hand/hand.types';
import { isHuman as isHumanUtil, canAct as canActUtil, updatePlayerHand } from './player.utils';

export const usePlayer = (playerId: string) => {
  const { 
    activePlayerId, 
    placeBetForPlayer, 
    updatePlayer,
    getPlayerById 
  } = usePlayerStore();

  const player = getPlayerById(playerId);
  const isActive = activePlayerId === playerId;
  const isHuman = player ? isHumanUtil(player) : false;
  const canAct = player ? canActUtil(player) : false;

  const placeBet = (amount: number) => {
    placeBetForPlayer(playerId, amount);
  };

  const stand = () => {
    updatePlayer(playerId, { hasStood: true });
  };

  const updateHand = (hand: Hand) => {
    if (player) {
      const updatedPlayer = updatePlayerHand(player, hand);
      updatePlayer(playerId, { 
        hand: updatedPlayer.hand, 
        hasBusted: updatedPlayer.hasBusted 
      });
    }
  };

  return {
    player,
    isActive,
    isHuman,
    canAct,
    placeBet,
    stand,
    updateHand,
  };
};
// External API for non-React code
export const getPlayerAPI = () => {
  const store = usePlayerStore.getState();
  return {
    dealCardToPlayer: store.dealCardToPlayer,
    updatePlayer: store.updatePlayer,
    getPlayerById: store.getPlayerById,
  };
};

export { usePlayerStore };
