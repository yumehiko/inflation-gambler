import { Hand } from '../hand/hand.types';
import { Brain } from '../brain/brain.types';

export type Player = {
  readonly id: string;
  readonly name: string;
  readonly hand: Hand;
  readonly brain: Brain;
  readonly chips: number;
  readonly currentBet: number;
  readonly isActive: boolean;
  readonly hasStood: boolean;
  readonly hasBusted: boolean;
};