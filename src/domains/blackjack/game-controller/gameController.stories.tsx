import type { Meta, StoryObj } from "@storybook/react";
import { GameTableMockView } from "./gameControllerMock.view";
import type { Participant } from "../participant/participant.types";
import type { Dealer } from "../dealer/dealer.types";
import type { Card } from "../../core/card/card.types";
import type { Decision } from "../brain/brain.types";
import { calculateHandValue, isBlackjack } from "../hand/hand.utils";

const meta = {
  title: "Domains/Blackjack/GameController/GameTableView",
  component: GameTableMockView,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof GameTableMockView>;

export default meta;
type Story = StoryObj<typeof meta>;

const createCard = (rank: Card["rank"], suit: Card["suit"], faceUp = true): Card => ({
  rank,
  suit,
  faceUp,
});

const createParticipant = (
  id: string,
  name: string,
  cards: Card[] = [],
  balance = 1000,
  betAmount = 0,
  status: Participant["status"] = "active"
): Participant => ({
  id,
  name,
  status,
  hand: cards.length > 0 ? {
    cards,
    value: calculateHandValue(cards),
    isBust: calculateHandValue(cards) > 21,
    isBlackjack: isBlackjack(cards),
  } : null,
  bet: betAmount > 0 ? { value: betAmount } : null,
  balance: { value: balance },
  brain: {
    type: "human",
    makeDecision: () => "stand" as Decision
  }
});

const createDealer = (cards: Card[] = []): Dealer => ({
  id: "dealer",
  hand: {
    cards,
    value: calculateHandValue(cards),
    isBust: calculateHandValue(cards) > 21,
    isBlackjack: isBlackjack(cards)
  },
  isShowingHoleCard: cards.length > 1 && cards.every(c => c.faceUp)
});

export const WaitingPhase: Story = {
  args: {
    phase: "waiting",
    participants: [
      createParticipant("player1", "Alice", [], 1000),
      createParticipant("player2", "Bob", [], 1500),
    ],
    dealer: createDealer(),
    roundNumber: 0,
    deckCount: 52,
    isGameInProgress: false,
  },
};

export const BettingPhase: Story = {
  args: {
    phase: "betting",
    participants: [
      createParticipant("player1", "Alice", [], 1000),
      createParticipant("player2", "Bob", [], 1500),
    ],
    dealer: createDealer(),
    roundNumber: 1,
    deckCount: 52,
    isGameInProgress: true,
  },
};

export const InitialDeal: Story = {
  args: {
    phase: "playing",
    participants: [
      createParticipant("player1", "Alice", [
        createCard("K", "hearts"),
        createCard("5", "clubs"),
      ], 900, 100),
      createParticipant("player2", "Bob", [
        createCard("10", "diamonds"),
        createCard("8", "spades"),
      ], 1400, 100),
    ],
    dealer: createDealer([
      createCard("A", "spades"),
      createCard("10", "hearts", false),
    ]),
    currentParticipant: createParticipant("player1", "Alice", [
      createCard("K", "hearts"),
      createCard("5", "clubs"),
    ], 900, 100),
    currentTurnIndex: 0,
    roundNumber: 1,
    deckCount: 46,
    isGameInProgress: true,
  },
};

export const PlayerTurn: Story = {
  args: {
    phase: "playing",
    participants: [
      createParticipant("player1", "Alice", [
        createCard("9", "hearts"),
        createCard("7", "clubs"),
      ], 900, 100),
    ],
    dealer: createDealer([
      createCard("K", "diamonds"),
      createCard("10", "hearts", false),
    ]),
    currentParticipant: createParticipant("player1", "Alice", [
      createCard("9", "hearts"),
      createCard("7", "clubs"),
    ], 900, 100),
    currentTurnIndex: 0,
    roundNumber: 2,
    deckCount: 48,
    isGameInProgress: true,
  },
};

export const PlayerCanDouble: Story = {
  args: {
    phase: "playing",
    participants: [
      createParticipant("player1", "Alice", [
        createCard("5", "hearts"),
        createCard("6", "clubs"),
      ], 900, 100),
    ],
    dealer: createDealer([
      createCard("7", "diamonds"),
      createCard("10", "hearts", false),
    ]),
    currentParticipant: createParticipant("player1", "Alice", [
      createCard("5", "hearts"),
      createCard("6", "clubs"),
    ], 900, 100),
    currentTurnIndex: 0,
    roundNumber: 1,
    deckCount: 48,
    isGameInProgress: true,
    canPerformAction: (_id: string, action: { type: string }) => action.type === "double",
  },
};

export const DealerTurn: Story = {
  args: {
    phase: "dealer-turn",
    participants: [
      createParticipant("player1", "Alice", [
        createCard("10", "hearts"),
        createCard("9", "clubs"),
      ], 900, 100, "stand"),
    ],
    dealer: createDealer([
      createCard("K", "diamonds"),
      createCard("6", "hearts"),
    ]),
    roundNumber: 1,
    deckCount: 46,
    isGameInProgress: true,
  },
};

export const Blackjack: Story = {
  args: {
    phase: "settlement",
    participants: [
      createParticipant("player1", "Alice", [
        createCard("A", "spades"),
        createCard("K", "hearts"),
      ], 1150, 100, "blackjack"),
    ],
    dealer: createDealer([
      createCard("9", "diamonds"),
      createCard("9", "hearts"),
    ]),
    roundNumber: 1,
    deckCount: 46,
    isGameInProgress: true,
  },
};

export const PlayerBust: Story = {
  args: {
    phase: "playing",
    participants: [
      createParticipant("player1", "Alice", [
        createCard("10", "hearts"),
        createCard("8", "clubs"),
        createCard("7", "diamonds"),
      ], 900, 100, "bust"),
      createParticipant("player2", "Bob", [
        createCard("K", "spades"),
        createCard("6", "hearts"),
      ], 1400, 100),
    ],
    dealer: createDealer([
      createCard("7", "diamonds"),
      createCard("10", "hearts", false),
    ]),
    currentParticipant: createParticipant("player2", "Bob", [
      createCard("K", "spades"),
      createCard("6", "hearts"),
    ], 1400, 100),
    currentTurnIndex: 1,
    roundNumber: 3,
    deckCount: 41,
    isGameInProgress: true,
  },
};

export const Settlement: Story = {
  args: {
    phase: "settlement",
    participants: [
      createParticipant("player1", "Alice (Winner)", [
        createCard("10", "hearts"),
        createCard("9", "clubs"),
      ], 1100, 0, "stand"),
      createParticipant("player2", "Bob (Lost)", [
        createCard("10", "diamonds"),
        createCard("6", "spades"),
      ], 1300, 0, "bust"),
    ],
    dealer: createDealer([
      createCard("10", "diamonds"),
      createCard("8", "hearts"),
    ]),
    roundNumber: 2,
    deckCount: 44,
    isGameInProgress: true,
  },
};

export const GameOver: Story = {
  args: {
    phase: "settlement",
    participants: [
      createParticipant("player1", "Alice", [], 0, 0, "bust"),
      createParticipant("player2", "Bob", [], 0, 0, "bust"),
    ],
    dealer: createDealer(),
    roundNumber: 10,
    deckCount: 52,
    isGameInProgress: true,
  },
};

export const MultiplePlayersActive: Story = {
  args: {
    phase: "playing",
    participants: [
      createParticipant("player1", "Alice", [
        createCard("Q", "hearts"),
        createCard("4", "clubs"),
      ], 900, 100),
      createParticipant("player2", "Bob", [
        createCard("J", "diamonds"),
        createCard("7", "spades"),
      ], 1400, 100),
      createParticipant("player3", "Charlie", [
        createCard("9", "hearts"),
        createCard("9", "clubs"),
      ], 700, 100),
    ],
    dealer: createDealer([
      createCard("6", "diamonds"),
      createCard("10", "hearts", false),
    ]),
    currentParticipant: createParticipant("player2", "Bob", [
      createCard("J", "diamonds"),
      createCard("7", "spades"),
    ], 1400, 100),
    currentTurnIndex: 1,
    roundNumber: 5,
    deckCount: 41,
    isGameInProgress: true,
  },
};