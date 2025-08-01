import { Card } from '../../core/card/card.types';
import { Hand } from '../hand/hand.types';
import { createHand, addCardToHand } from '../hand/hand.utils';
import { Dealer } from './dealer.types';

const DEALER_STAND_VALUE = 17;
const DEALER_ID = 'dealer';

export const createDealer = (): Dealer => {
  return {
    id: DEALER_ID,
    hand: createHand([]),
    isShowingHoleCard: false,
  };
};

export const shouldHit = (hand: Hand): boolean => {
  if (hand.value < DEALER_STAND_VALUE) {
    return true;
  }
  
  // ソフト17の判定: 値が17で、softValueが存在し、softValueがvalueより小さい場合
  // これはエースを11として数えて17になっていることを示す
  if (hand.value === DEALER_STAND_VALUE && hand.softValue !== undefined && hand.softValue < hand.value) {
    return true;
  }
  
  return false;
};

export const dealCard = (dealer: Dealer, card: Card, isHoleCard: boolean): Dealer => {
  const cardWithFaceStatus: Card = {
    ...card,
    faceUp: !isHoleCard,
  };
  
  const newHand = addCardToHand(dealer.hand, cardWithFaceStatus);
  
  return {
    ...dealer,
    hand: newHand,
  };
};

export const revealHoleCard = (dealer: Dealer): Dealer => {
  const revealedCards = dealer.hand.cards.map(card => ({
    ...card,
    faceUp: true,
  }));
  
  const newHand = createHand(revealedCards);
  
  return {
    ...dealer,
    hand: newHand,
    isShowingHoleCard: true,
  };
};