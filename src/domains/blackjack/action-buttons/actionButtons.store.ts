import { create } from 'zustand';
import type { Decision, DecisionContext } from '../brain/brain.types';
import type { ActionType } from './actionButtons.types';

type ActionButtonsStore = {
  pendingAction: DecisionContext | null;
  resolveAction: ((decision: Decision) => void) | null;
  rejectAction: ((error: Error) => void) | null;
  
  requestAction: (context: DecisionContext) => Promise<Decision>;
  submitAction: (action: ActionType) => void;
  cancelAction: () => void;
  reset: () => void;
};

const mapActionTypeToDecision = (action: ActionType): Decision => {
  switch (action) {
    case 'hit':
    case 'stand':
    case 'double':
    case 'split':
    case 'surrender':
    case 'insurance':
      return action;
    default:
      throw new Error(`Invalid action type: ${action}`);
  }
};

export const useActionButtonsStore = create<ActionButtonsStore>((set, get) => ({
  pendingAction: null,
  resolveAction: null,
  rejectAction: null,
  
  requestAction: (context: DecisionContext) => {
    return new Promise<Decision>((resolve, reject) => {
      set({
        pendingAction: context,
        resolveAction: resolve,
        rejectAction: reject,
      });
    });
  },
  
  submitAction: (action: ActionType) => {
    const { resolveAction } = get();
    if (resolveAction) {
      const decision = mapActionTypeToDecision(action);
      resolveAction(decision);
      set({
        pendingAction: null,
        resolveAction: null,
        rejectAction: null,
      });
    }
  },
  
  cancelAction: () => {
    const { rejectAction } = get();
    if (rejectAction) {
      rejectAction(new Error('Action cancelled'));
      set({
        pendingAction: null,
        resolveAction: null,
        rejectAction: null,
      });
    }
  },
  
  reset: () => {
    set({
      pendingAction: null,
      resolveAction: null,
      rejectAction: null,
    });
  },
}));