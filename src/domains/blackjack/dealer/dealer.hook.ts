import { Card } from '../../core/card/card.types';
import { useDealerStore } from './dealer.store';

export const useDealer = () => {
  const {
    dealer,
    initializeDealer,
    dealCardToDealer,
    revealDealerHoleCard,
    shouldDealerHit,
    resetDealer,
  } = useDealerStore();

  return {
    dealer,
    initializeDealer,
    dealCard: (card: Card, isHoleCard: boolean) => dealCardToDealer(card, isHoleCard),
    revealHoleCard: revealDealerHoleCard,
    shouldHit: shouldDealerHit,
    reset: resetDealer,
  };
};

// External API for non-React code  
export const getDealerAPI = () => {
  const store = useDealerStore.getState();
  return {
    dealCardToDealer: store.dealCardToDealer,
    revealDealerHoleCard: store.revealDealerHoleCard,
    resetDealer: store.resetDealer,
  };
};

export { useDealerStore };