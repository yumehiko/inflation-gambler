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