import type { HumanResolver } from './brain.types';
import { useBettingInputStore } from '../betting-input/bettingInput.store';
import { useActionButtonsStore } from '../action-buttons/actionButtons.store';

export const createHumanResolver = (): HumanResolver => {
  const bettingInputStore = useBettingInputStore.getState();
  const actionButtonsStore = useActionButtonsStore.getState();

  return {
    waitForDecision: (context) => {
      return actionButtonsStore.requestAction(context);
    },
    waitForBet: (context) => {
      return bettingInputStore.requestBet(context);
    },
  };
};