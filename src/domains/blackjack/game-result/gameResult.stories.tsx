import type { Meta, StoryObj } from "@storybook/react";
import { GameResult } from "./gameResult.view";
import type { Hand } from "../hand/hand.types";
import type { Card, Rank, Suit } from "../../core/card/card.types";

const meta: Meta<typeof GameResult> = {
  title: "Blackjack/GameResult",
  component: GameResult,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    onNextRound: { action: "next round clicked" },
    onEndGame: { action: "end game clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const createCard = (rank: Rank, suit: Suit): Card => ({
  rank,
  suit,
  faceUp: true,
});

const createHand = (cards: Card[], value: number, isBlackjack = false): Hand => ({
  cards,
  value,
  isBust: value > 21,
  isBlackjack,
});

const dealerHand17: Hand = createHand(
  [createCard("10", "hearts"), createCard("7", "diamonds")],
  17
);

const dealerHand21: Hand = createHand(
  [createCard("K", "spades"), createCard("A", "clubs")],
  21,
  true
);

const dealerBust: Hand = createHand(
  [
    createCard("10", "hearts"),
    createCard("8", "diamonds"),
    createCard("5", "clubs"),
  ],
  23
);

export const SingleWin: Story = {
  args: {
    dealerHand: dealerHand17,
    results: [
      {
        participantId: "player1",
        name: "Player 1",
        finalHand: createHand(
          [createCard("K", "hearts"), createCard("Q", "spades")],
          20
        ),
        bet: { value: 100 },
        winAmount: { value: 100 },
        result: "win",
      },
    ],
  },
};

export const SingleLose: Story = {
  args: {
    dealerHand: dealerHand17,
    results: [
      {
        participantId: "player1",
        name: "Player 1",
        finalHand: createHand(
          [createCard("10", "hearts"), createCard("6", "diamonds")],
          16
        ),
        bet: { value: 50 },
        winAmount: { value: -50 },
        result: "lose",
      },
    ],
  },
};

export const Push: Story = {
  args: {
    dealerHand: dealerHand17,
    results: [
      {
        participantId: "player1",
        name: "Player 1",
        finalHand: createHand(
          [createCard("9", "clubs"), createCard("8", "hearts")],
          17
        ),
        bet: { value: 75 },
        winAmount: { value: 0 },
        result: "push",
      },
    ],
  },
};

export const PlayerBlackjack: Story = {
  args: {
    dealerHand: dealerHand17,
    results: [
      {
        participantId: "player1",
        name: "Lucky Player",
        finalHand: createHand(
          [createCard("A", "spades"), createCard("K", "hearts")],
          21,
          true
        ),
        bet: { value: 100 },
        winAmount: { value: 150 },
        result: "blackjack",
      },
    ],
  },
};

export const DealerBlackjack: Story = {
  args: {
    dealerHand: dealerHand21,
    results: [
      {
        participantId: "player1",
        name: "Player 1",
        finalHand: createHand(
          [createCard("K", "hearts"), createCard("Q", "spades")],
          20
        ),
        bet: { value: 100 },
        winAmount: { value: -100 },
        result: "lose",
      },
      {
        participantId: "player2",
        name: "Player 2",
        finalHand: createHand(
          [createCard("A", "diamonds"), createCard("K", "clubs")],
          21,
          true
        ),
        bet: { value: 50 },
        winAmount: { value: 0 },
        result: "push",
      },
    ],
  },
};

export const PlayerBust: Story = {
  args: {
    dealerHand: dealerHand17,
    results: [
      {
        participantId: "player1",
        name: "Busted Player",
        finalHand: createHand(
          [
            createCard("10", "hearts"),
            createCard("8", "diamonds"),
            createCard("5", "clubs"),
          ],
          23
        ),
        bet: { value: 100 },
        winAmount: { value: -100 },
        result: "lose",
      },
    ],
  },
};

export const DealerBustAllWin: Story = {
  args: {
    dealerHand: dealerBust,
    results: [
      {
        participantId: "player1",
        name: "Player 1",
        finalHand: createHand(
          [createCard("K", "hearts"), createCard("Q", "spades")],
          20
        ),
        bet: { value: 100 },
        winAmount: { value: 100 },
        result: "win",
      },
      {
        participantId: "player2",
        name: "Player 2",
        finalHand: createHand(
          [createCard("10", "diamonds"), createCard("8", "clubs")],
          18
        ),
        bet: { value: 50 },
        winAmount: { value: 50 },
        result: "win",
      },
    ],
  },
};

export const MultipleResults: Story = {
  args: {
    dealerHand: dealerHand17,
    results: [
      {
        participantId: "player1",
        name: "Winner",
        finalHand: createHand(
          [createCard("K", "hearts"), createCard("Q", "spades")],
          20
        ),
        bet: { value: 100 },
        winAmount: { value: 100 },
        result: "win",
      },
      {
        participantId: "player2",
        name: "Loser",
        finalHand: createHand(
          [createCard("10", "hearts"), createCard("5", "diamonds")],
          15
        ),
        bet: { value: 50 },
        winAmount: { value: -50 },
        result: "lose",
      },
      {
        participantId: "player3",
        name: "Tied",
        finalHand: createHand(
          [createCard("9", "clubs"), createCard("8", "hearts")],
          17
        ),
        bet: { value: 75 },
        winAmount: { value: 0 },
        result: "push",
      },
      {
        participantId: "player4",
        name: "Blackjack Winner",
        finalHand: createHand(
          [createCard("A", "spades"), createCard("J", "diamonds")],
          21,
          true
        ),
        bet: { value: 200 },
        winAmount: { value: 300 },
        result: "blackjack",
      },
    ],
  },
};

export const FoldedPlayers: Story = {
  args: {
    dealerHand: dealerHand17,
    results: [
      {
        participantId: "player1",
        name: "Active Player",
        finalHand: createHand(
          [createCard("K", "hearts"), createCard("Q", "spades")],
          20
        ),
        bet: { value: 100 },
        winAmount: { value: 100 },
        result: "win",
      },
      {
        participantId: "player2",
        name: "Folded Player",
        finalHand: null,
        bet: null,
        winAmount: null,
        result: "lose",
      },
    ],
  },
};

export const EmptyResults: Story = {
  args: {
    dealerHand: dealerHand17,
    results: [],
  },
};

export const AllBusted: Story = {
  args: {
    dealerHand: dealerHand17,
    results: [
      {
        participantId: "player1",
        name: "Busted 1",
        finalHand: createHand(
          [
            createCard("10", "hearts"),
            createCard("8", "diamonds"),
            createCard("6", "clubs"),
          ],
          24
        ),
        bet: { value: 100 },
        winAmount: { value: -100 },
        result: "lose",
      },
      {
        participantId: "player2",
        name: "Busted 2",
        finalHand: createHand(
          [
            createCard("K", "spades"),
            createCard("Q", "hearts"),
            createCard("5", "diamonds"),
          ],
          25
        ),
        bet: { value: 50 },
        winAmount: { value: -50 },
        result: "lose",
      },
    ],
  },
};