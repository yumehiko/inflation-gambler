import type { HumanResolver } from './brain.types';
import { getBettingInputAPI } from '../betting-input/bettingInput.hook';
import { getActionButtonsAPI } from '../action-buttons/actionButtons.hook';

export const createHumanResolver = (): HumanResolver => {
  const bettingInputAPI = getBettingInputAPI();
  const actionButtonsAPI = getActionButtonsAPI();

  return {
    waitForDecision: (context) => {
      return actionButtonsAPI.requestAction(context);
    },
    waitForBet: (context) => {
      console.log('humanBrain.waitForBet called with context:', context);
      const result = bettingInputAPI.requestBet(context);
      console.log('bettingInputAPI.requestBet returned promise');
      return result;
    },
  };
};