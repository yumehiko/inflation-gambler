import { useCallback } from 'react';
import { useActionButtonsStore } from './actionButtons.store';
import type { ActionButtonsProps, ActionType } from './actionButtons.types';

export const useActionButtons = (
  participantId: string,
  onAction?: (action: { type: ActionType }) => void
): ActionButtonsProps & { isWaitingForAction: boolean } => {
  const { pendingAction, submitAction } = useActionButtonsStore();
  
  const isWaitingForAction = pendingAction !== null;
  
  const handleAction = useCallback((action: { type: ActionType }) => {
    if (pendingAction) {
      // Submit to store for humanBrain
      submitAction(action.type);
    }
    
    // Also call the optional callback for external handling
    if (onAction) {
      onAction(action);
    }
  }, [pendingAction, submitAction, onAction]);

  return {
    participantId,
    canHit: pendingAction?.canDouble || pendingAction?.canSplit || pendingAction?.canSurrender || true,
    canStand: true,
    canDouble: pendingAction?.canDouble || false,
    canSplit: pendingAction?.canSplit || false,
    canSurrender: pendingAction?.canSurrender || false,
    onAction: handleAction,
    disabled: !isWaitingForAction,
    isWaitingForAction,
  };
};