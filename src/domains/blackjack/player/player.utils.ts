import { Player } from './player.types';
import { Hand } from '../hand/hand.types';
import { Brain, BetContext } from '../brain/brain.types';
import { Card } from '../../core/card/card.types';
import { addCardToHand } from '../hand/hand.utils';

export const createPlayer = (
  id: string,
  name: string,
  brain: Brain,
  chips: number
): Player => {
  return {
    id,
    name,
    hand: {
      cards: [],
      value: 0,
      isBust: false,
      isBlackjack: false,
    },
    brain,
    chips,
    currentBet: 0,
    isActive: false,
    hasStood: false,
    hasBusted: false,
  };
};

export const isHuman = (player: Player): boolean => {
  return player.brain.type === 'human';
};

export const canAct = (player: Player): boolean => {
  return player.isActive && !player.hasStood && !player.hasBusted;
};

export const updatePlayerHand = (player: Player, hand: Hand): Player => {
  return {
    ...player,
    hand,
    hasBusted: hand.isBust,
  };
};

export const placeBet = (player: Player, amount: number): Player => {
  if (amount < 0) {
    throw new Error('Invalid bet amount');
  }
  if (amount > player.chips) {
    throw new Error('Insufficient chips');
  }

  return {
    ...player,
    currentBet: amount,
    chips: player.chips - amount,
  };
};
export const requestBet = async (
  player: Player,
  minBet: number,
  maxBet: number
): Promise<number> => {
  const context: BetContext = {
    chips: player.chips,
    minBet,
    maxBet,
  };
  console.log(`requestBet: Player ${player.id} brain type: ${player.brain.type}`);
  const betAmount = await player.brain.decideBet(context);
  console.log(`requestBet: Player ${player.id} decided bet: ${betAmount}`);
  return betAmount;
};

export const winBet = (player: Player, payoutMultiplier: number): Player => {
  const winnings = player.currentBet * payoutMultiplier;
  
  return {
    ...player,
    chips: player.chips + player.currentBet + winnings,
    currentBet: 0,
  };
};

export const loseBet = (player: Player): Player => {
  return {
    ...player,
    currentBet: 0,
  };
};

/**
 * Deal a card to the player
 */
export const dealCard = (player: Player, card: Card): Player => {
  const newHand = addCardToHand(player.hand, card);
  
  return {
    ...player,
    hand: newHand,
    hasBusted: newHand.isBust,
  };
};