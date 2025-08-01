import { useParticipantStore } from "./participant.store";
import type { ParticipantAction, ParticipantStatus } from "./participant.types";
import { 
  canPlaceBet as canPlaceBetUtil,
  canPerformAction as canPerformActionUtil,
} from "./participant.utils";

export const useParticipant = () => {
  const {
    participants,
    addParticipant,
    removeParticipant,
    updateParticipant,
    placeBet,
    updateParticipantHand,
    updateParticipantStatus,
    clearParticipantHand,
    getParticipantById,
    getActiveParticipants,
    reset,
  } = useParticipantStore();

  const canPlaceBet = (participantId: string, amount: number): boolean => {
    const participant = getParticipantById(participantId);
    if (!participant) {
      return false;
    }
    return canPlaceBetUtil(participant, amount);
  };

  const canPerformAction = (participantId: string, action: ParticipantAction): boolean => {
    const participant = getParticipantById(participantId);
    if (!participant) {
      return false;
    }
    return canPerformActionUtil(participant, action);
  };

  const safeUpdateParticipantStatus = (participantId: string, status: ParticipantStatus) => {
    try {
      updateParticipantStatus(participantId, status);
    } catch (error) {
      // Silent fail for hook layer to maintain backward compatibility
      console.warn(error);
    }
  };

  return {
    participants,
    activeParticipants: getActiveParticipants(),
    addParticipant,
    removeParticipant,
    updateParticipant,
    placeBet,
    updateParticipantHand,
    updateParticipantStatus: safeUpdateParticipantStatus,
    clearParticipantHand,
    getParticipantById,
    canPlaceBet,
    canPerformAction,
    reset,
  };
};