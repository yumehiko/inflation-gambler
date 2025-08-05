import { Card } from '../../core/card/card.types';
import { Decision } from '../brain/brain.types';
import { SettlementResult } from './gameFlow.types';

// Base event type
export type GameFlowEventBase = {
  timestamp: number;
};

// Event types
export type CardDealtEvent = GameFlowEventBase & {
  type: 'card_dealt';
  receiverId: string;
  card: Card;
};

export type BetPlacedEvent = GameFlowEventBase & {
  type: 'bet_placed';
  playerId: string;
  amount: number;
};

export type PlayerActionEvent = GameFlowEventBase & {
  type: 'player_action';
  playerId: string;
  action: Decision;
};

export type PlayerBustedEvent = GameFlowEventBase & {
  type: 'player_busted';
  playerId: string;
};

export type PlayerStoodEvent = GameFlowEventBase & {
  type: 'player_stood';
  playerId: string;
};

export type TurnCompletedEvent = GameFlowEventBase & {
  type: 'turn_completed';
  playerId: string;
};

export type DealerRevealedEvent = GameFlowEventBase & {
  type: 'dealer_revealed';
  dealerId: string;
};

export type GameSettledEvent = GameFlowEventBase & {
  type: 'game_settled';
  results: Array<{
    playerId: string;
    result: SettlementResult;
    payout: number;
  }>;
};

export type PhaseChangedEvent = GameFlowEventBase & {
  type: 'phase_changed';
  fromPhase: string;
  toPhase: string;
};

// Union of all event types
export type GameFlowEvent = 
  | CardDealtEvent
  | BetPlacedEvent
  | PlayerActionEvent
  | PlayerBustedEvent
  | PlayerStoodEvent
  | TurnCompletedEvent
  | DealerRevealedEvent
  | GameSettledEvent
  | PhaseChangedEvent;

// Event emitter interface
export type GameFlowEventListener = (event: GameFlowEvent) => void;

export type GameFlowEventEmitter = {
  on: (listener: GameFlowEventListener) => void;
  off: (listener: GameFlowEventListener) => void;
  emit: (event: GameFlowEvent) => void;
};