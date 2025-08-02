import { Participant } from "../participant/participant.types";
import { Dealer } from "../dealer/dealer.types";
import { Deck } from "../../core/deck/deck.types";
import { Hand } from "../hand/hand.types";
import { Coin } from "../../core/coin/coin.types";

export type GamePhase = "waiting" | "betting" | "dealing" | "playing" | "dealer-turn" | "settlement";

export type ParticipantResult = {
  readonly participantId: string;
  readonly name: string;
  readonly finalHand: Hand | null;
  readonly bet: Coin | null;
  readonly winAmount: Coin | null;
  readonly result: "win" | "lose" | "push" | "blackjack";
};

export type GameHistory = {
  readonly roundNumber: number;
  readonly participants: ParticipantResult[];
  readonly dealerHand: Hand;
  readonly timestamp: Date;
};

export type GameState = {
  readonly phase: GamePhase;
  readonly participants: Participant[];
  readonly dealer: Dealer;
  readonly deck: Deck;
  readonly currentTurnIndex: number;
  readonly roundNumber: number;
  readonly history: GameHistory[];
};

export type GameAction = 
  | { type: "hit" }
  | { type: "stand" }
  | { type: "double" }
  | { type: "split" }
  | { type: "surrender" };