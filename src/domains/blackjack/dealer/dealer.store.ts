import { create } from 'zustand';
import { Card } from '../../core/card/card.types';
import { Dealer } from './dealer.types';
import { createDealer, dealCard, revealHoleCard, shouldHit } from './dealer.utils';

type DealerState = {
  dealer: Dealer | null;
};

type DealerActions = {
  initializeDealer: () => void;
  dealCardToDealer: (card: Card, isHoleCard: boolean) => void;
  revealDealerHoleCard: () => void;
  shouldDealerHit: () => boolean;
  resetDealer: () => void;
};

type DealerStore = DealerState & DealerActions;

export const useDealerStore = create<DealerStore>((set, get) => ({
  dealer: null,

  initializeDealer: () => {
    set({ dealer: createDealer() });
  },

  dealCardToDealer: (card: Card, isHoleCard: boolean) => {
    const { dealer } = get();
    if (!dealer) return;

    const updatedDealer = dealCard(dealer, card, isHoleCard);
    set({ dealer: updatedDealer });
  },

  revealDealerHoleCard: () => {
    const { dealer } = get();
    if (!dealer) return;

    const updatedDealer = revealHoleCard(dealer);
    set({ dealer: updatedDealer });
  },

  shouldDealerHit: () => {
    const { dealer } = get();
    if (!dealer) return false;

    return shouldHit(dealer.hand);
  },

  resetDealer: () => {
    set({ dealer: null });
  },
}));