import { GameFlowEvent, GameFlowEventEmitter, GameFlowEventListener } from './gameFlowEvents.types';

export const createEventEmitter = (): GameFlowEventEmitter => {
  const listeners: Set<GameFlowEventListener> = new Set();

  return {
    on: (listener: GameFlowEventListener) => {
      listeners.add(listener);
    },
    
    off: (listener: GameFlowEventListener) => {
      listeners.delete(listener);
    },
    
    emit: (event: GameFlowEvent) => {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  };
};