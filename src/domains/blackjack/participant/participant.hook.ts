import { useParticipantStore } from "./participant.store";
import type { ParticipantAction } from "./participant.types";
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

  return {
    participants,
    activeParticipants: getActiveParticipants(),
    addParticipant,
    removeParticipant,
    updateParticipant,
    placeBet,
    updateParticipantHand,
    updateParticipantStatus,
    clearParticipantHand,
    getParticipantById,
    canPlaceBet,
    canPerformAction,
    reset,
  };
};