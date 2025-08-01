import { create } from "zustand";
import type { Participant, ParticipantRole, ParticipantStatus } from "./participant.types";
import type { Coin } from "../../core/coin/coin.types";
import type { Hand } from "../hand/hand.types";
import { 
  createParticipant, 
  placeBet as placeBetUtil,
  updateParticipantStatus as updateStatusUtil,
  clearParticipantHand as clearHandUtil,
  isParticipantActive,
} from "./participant.utils";

type CreateParticipantOptions = {
  id: string;
  name: string;
  role: ParticipantRole;
  balance: Coin;
};

type ParticipantState = {
  participants: Participant[];
  addParticipant: (options: CreateParticipantOptions) => void;
  removeParticipant: (id: string) => void;
  updateParticipant: (id: string, participant: Participant) => void;
  placeBet: (id: string, amount: number) => void;
  updateParticipantHand: (id: string, hand: Hand) => void;
  updateParticipantStatus: (id: string, status: ParticipantStatus) => void;
  clearParticipantHand: (id: string) => void;
  getParticipantById: (id: string) => Participant | undefined;
  getActiveParticipants: () => Participant[];
  reset: () => void;
};

export const useParticipantStore = create<ParticipantState>((set, get) => ({
  participants: [],

  addParticipant: (options) => {
    const participant = createParticipant(options);
    set((state) => ({
      participants: [...state.participants, participant],
    }));
  },

  removeParticipant: (id) => {
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== id),
    }));
  },

  updateParticipant: (id, participant) => {
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? participant : p
      ),
    }));
  },

  placeBet: (id, amount) => {
    const participant = get().getParticipantById(id);
    if (!participant) {
      throw new Error(`Participant with id ${id} not found`);
    }

    const updated = placeBetUtil(participant, amount);
    get().updateParticipant(id, updated);
  },

  updateParticipantHand: (id, hand) => {
    const participant = get().getParticipantById(id);
    if (!participant) {
      throw new Error(`Participant with id ${id} not found`);
    }

    const updated = { ...participant, hand };
    get().updateParticipant(id, updated);
  },

  updateParticipantStatus: (id, status) => {
    const participant = get().getParticipantById(id);
    if (!participant) {
      throw new Error(`Participant with id ${id} not found`);
    }

    const updated = updateStatusUtil(participant, status);
    get().updateParticipant(id, updated);
  },

  clearParticipantHand: (id) => {
    const participant = get().getParticipantById(id);
    if (!participant) {
      throw new Error(`Participant with id ${id} not found`);
    }

    const updated = clearHandUtil(participant);
    get().updateParticipant(id, updated);
  },

  getParticipantById: (id) => {
    return get().participants.find((p) => p.id === id);
  },

  getActiveParticipants: () => {
    return get().participants.filter(isParticipantActive);
  },

  reset: () => {
    set({ participants: [] });
  },
}));