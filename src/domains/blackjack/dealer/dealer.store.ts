import { create } from 'zustand';
import { Card } from '../../core/card/card.types';
import { Dealer } from './dealer.types';
import { createDealer, dealCard, revealHoleCard, shouldHit } from './dealer.utils';
import { getGameFlowAPI } from '../game-flow/gameFlow.hook';
import { GameFlowEvent, GameFlowEventListener } from '../game-flow/gameFlowEvents.types';

type DealerState = {
  dealer: Dealer | null;
  eventListener: GameFlowEventListener | null;
};

type DealerActions = {
  initializeDealer: () => void;
  dealCardToDealer: (card: Card, isHoleCard: boolean) => void;
  revealDealerHoleCard: () => void;
  shouldDealerHit: () => boolean;
  resetDealer: () => void;
  startListeningToEvents: () => void;
  stopListeningToEvents: () => void;
};

type DealerStore = DealerState & DealerActions;

export const useDealerStore = create<DealerStore>((set, get) => ({
  dealer: null,
  eventListener: null,

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

  startListeningToEvents: () => {
    const { eventListener } = get();
    
    // 既にリスナーが登録されている場合は何もしない
    if (eventListener) return;
    
    const listener: GameFlowEventListener = (event: GameFlowEvent) => {
      const store = get();
      
      switch (event.type) {
        case 'card_dealt':
          // ディーラーにカードが配られた
          if (event.receiverId === 'dealer' && store.dealer) {
            // 既に同じカードが手札にない場合のみ追加
            const hasCard = store.dealer.hand.cards.some(c => 
              c.suit === event.card.suit && c.rank === event.card.rank
            );
            if (!hasCard) {
              store.dealCardToDealer(event.card, !event.card.faceUp);
            }
          }
          break;
          
        case 'dealer_revealed':
          // ディーラーのホールカードが公開された
          store.revealDealerHoleCard();
          break;
      }
    };
    
    // イベントエミッターに登録
    const gameFlowAPI = getGameFlowAPI();
    const emitter = gameFlowAPI.getEventEmitter();
    emitter.on(listener);
    
    set({ eventListener: listener });
  },

  stopListeningToEvents: () => {
    const { eventListener } = get();
    
    if (eventListener) {
      const gameFlowAPI = getGameFlowAPI();
      const emitter = gameFlowAPI.getEventEmitter();
      emitter.off(eventListener);
      
      set({ eventListener: null });
    }
  },
}));