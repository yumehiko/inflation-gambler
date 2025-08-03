import { useCallback, useEffect, useState } from 'react';
import { useBettingInputStore } from './bettingInput.store';
import type { BettingInputProps } from './bettingInput.types';
import type { BetContext } from '../brain/brain.types';

export const useBettingInput = (
  balance: number,
  minBet: number,
  maxBet: number,
  onBetConfirm?: (amount: number) => void
): BettingInputProps => {
  const { pendingBet, submitBet } = useBettingInputStore();
  const [currentBet, setCurrentBet] = useState(minBet);
  const [isDisabled, setIsDisabled] = useState(false);

  // Update currentBet when pendingBet changes
  useEffect(() => {
    if (pendingBet !== null) {
      setCurrentBet(pendingBet);
      setIsDisabled(false);
    }
  }, [pendingBet]);

  const handleBetChange = useCallback((amount: number) => {
    setCurrentBet(amount);
  }, []);

  const handleBetConfirm = useCallback(() => {
    if (pendingBet !== null) {
      // Submit to store for humanBrain
      submitBet(currentBet);
    }
    
    // Also call the optional callback for external handling
    if (onBetConfirm) {
      onBetConfirm(currentBet);
    }
    
    setIsDisabled(true);
  }, [currentBet, pendingBet, submitBet, onBetConfirm]);

  return {
    balance,
    minBet,
    maxBet,
    currentBet,
    onBetChange: handleBetChange,
    onBetConfirm: handleBetConfirm,
    disabled: isDisabled || pendingBet === null,
  };
};
// API for non-React contexts (e.g., humanBrain.utils.ts)
export const getBettingInputAPI = () => {
  const store = useBettingInputStore.getState();
  
  return {
    requestBet: (context: BetContext) => store.requestBet(context),
    submitBet: (amount: number) => store.submitBet(amount),
    cancelBet: () => store.cancelBet(),
    reset: () => store.reset(),
  };
};
