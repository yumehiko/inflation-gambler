import { Hand } from '../hand/hand.types';

export type Dealer = {
  readonly id: string;
  readonly hand: Hand;
  readonly isShowingHoleCard: boolean;
};