import { Hand } from '../hand/hand.types';

export type HandHolderType = 'dealer' | 'participant';

export type HandHolderStatus = 'waiting' | 'active' | 'stand' | 'bust' | 'blackjack';

export type HandHolderAction = 'hit' | 'stand' | 'double' | 'split';

export type HandHolder = {
  readonly id: string;
  readonly type: HandHolderType;
  readonly hand: Hand;
  readonly status: HandHolderStatus;
};

export type ActionAvailability = {
  readonly canHit: boolean;
  readonly canStand: boolean;
  readonly canDouble: boolean;
  readonly canSplit: boolean;
};