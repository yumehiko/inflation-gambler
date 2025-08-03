import { create } from 'zustand';
import type { BetContext } from '../brain/brain.types';

type BettingInputStore = {
  pendingBet: number | null;
  resolveBet: ((amount: number) => void) | null;
  rejectBet: ((error: Error) => void) | null;
  
  requestBet: (context: BetContext) => Promise<number>;
  submitBet: (amount: number) => void;
  cancelBet: () => void;
  reset: () => void;
};

export const useBettingInputStore = create<BettingInputStore>((set, get) => ({
  pendingBet: null,
  resolveBet: null,
  rejectBet: null,
  
  requestBet: (context: BetContext) => {
    return new Promise<number>((resolve, reject) => {
      set({
        pendingBet: context.minBet,
        resolveBet: resolve,
        rejectBet: reject,
      });
    });
  },
  
  submitBet: (amount: number) => {
    const { resolveBet } = get();
    if (resolveBet) {
      resolveBet(amount);
      set({
        pendingBet: null,
        resolveBet: null,
        rejectBet: null,
      });
    }
  },
  
  cancelBet: () => {
    const { rejectBet } = get();
    if (rejectBet) {
      rejectBet(new Error('Bet cancelled'));
      set({
        pendingBet: null,
        resolveBet: null,
        rejectBet: null,
      });
    }
  },
  
  reset: () => {
    set({
      pendingBet: null,
      resolveBet: null,
      rejectBet: null,
    });
  },
}));