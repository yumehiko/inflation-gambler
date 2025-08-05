import { GameEvent } from './gameFlow.types';
import { GameFlowEvent } from './gameFlowEvents.types';

export const mapGameEventToFlowEvent = (event: GameEvent): GameFlowEvent | null => {
  switch (event.type) {
    case 'card_dealt':
      return {
        type: 'card_dealt',
        receiverId: event.receiverId,
        card: event.card,
        timestamp: event.timestamp,
      };
      
    case 'bet_placed':
      return {
        type: 'bet_placed',
        playerId: event.playerId,
        amount: event.amount,
        timestamp: event.timestamp,
      };
      
    case 'player_action':
      return {
        type: 'player_action',
        playerId: event.playerId,
        action: event.action,
        timestamp: event.timestamp,
      };
      
    case 'player_busted':
      return {
        type: 'player_busted',
        playerId: event.playerId,
        timestamp: event.timestamp,
      };
      
    default:
      // その他のイベントタイプは現在のところマッピングしない
      return null;
  }
};