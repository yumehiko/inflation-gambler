import type { Participant, ParticipantStatus, ParticipantAction } from "./participant.types";
import type { Coin } from "../../core/coin/coin.types";
import type { Brain } from "../brain/brain.types";
import { createCoin } from "../../core/coin/coin.utils";

export type CreateParticipantOptions = {
  id: string;
  name: string;
  balance: Coin;
  brain: Brain;
};

export const createParticipant = (options: CreateParticipantOptions): Participant => ({
  id: options.id,
  name: options.name,
  status: "waiting",
  hand: null,
  bet: null,
  balance: options.balance,
  brain: options.brain,
});

export const canPlaceBet = (participant: Participant, amount: number): boolean => {
  if (participant.status !== "waiting") {
    return false;
  }
  
  return participant.balance.value >= amount;
};

export const canPerformAction = (participant: Participant, action: ParticipantAction): boolean => {
  if (participant.hand === null) {
    return false;
  }
  
  if (participant.status !== "active") {
    return false;
  }
  
  switch (action) {
    case "hit":
    case "stand":
      return true;
    case "double":
      return participant.bet !== null && participant.balance.value >= participant.bet.value;
    case "split":
    case "insurance":
      return false; // Not implemented yet
    default:
      return false;
  }
};

export const placeBet = (participant: Participant, amount: number): Participant => {
  if (!canPlaceBet(participant, amount)) {
    throw new Error(`Cannot place bet of ${amount} for participant ${participant.id}`);
  }
  
  return {
    ...participant,
    bet: createCoin(amount),
    balance: createCoin(participant.balance.value - amount),
    status: "active",
  };
};

export const updateParticipantStatus = (participant: Participant, status: ParticipantStatus): Participant => ({
  ...participant,
  status,
});

export const clearParticipantHand = (participant: Participant): Participant => ({
  ...participant,
  hand: null,
  bet: null,
  status: "waiting",
});

export const isParticipantActive = (participant: Participant): boolean => {
  return participant.status === "active";
};