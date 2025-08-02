import type { Coin } from "../../core/coin/coin.types";
import type { Hand } from "../hand/hand.types";
import type { Brain } from "../brain/brain.types";

export type ParticipantStatus = "active" | "waiting" | "bust" | "stand" | "blackjack";

export type Participant = {
  readonly id: string;
  readonly name: string;
  readonly status: ParticipantStatus;
  readonly hand: Hand | null;
  readonly bet: Coin | null;
  readonly balance: Coin;
  readonly brain: Brain;
};

export type ParticipantAction = "hit" | "stand" | "double" | "split" | "insurance";

export type BetRequest = {
  readonly participantId: string;
  readonly amount: number;
};

export type ActionRequest = {
  readonly participantId: string;
  readonly action: ParticipantAction;
};