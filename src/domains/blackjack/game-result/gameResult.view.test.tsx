import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GameResult } from "./gameResult.view";
import type { GameResultProps } from "./gameResult.types";
import type { ParticipantResult } from "../game-controller/gameController.types";
import type { Hand } from "../hand/hand.types";
import type { Card, Rank, Suit } from "../../core/card/card.types";

describe("GameResult", () => {
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

  const mockDealerHand: Hand = createHand(
    [createCard("10", "hearts"), createCard("7", "diamonds")],
    17
  );

  const defaultProps: GameResultProps = {
    results: [],
    dealerHand: mockDealerHand,
    onNextRound: vi.fn(),
    onEndGame: vi.fn(),
  };

  it("displays win result with winning amount", () => {
    const winResult: ParticipantResult = {
      participantId: "player1",
      name: "Player 1",
      finalHand: createHand(
        [createCard("Q", "spades"), createCard("K", "clubs")],
        20
      ),
      bet: { value: 100 },
      winAmount: { value: 100 },
      result: "win",
    };

    render(<GameResult {...defaultProps} results={[winResult]} />);

    expect(screen.getByText("Player 1")).toBeInTheDocument();
    expect(screen.getByText("WIN")).toBeInTheDocument();
    expect(screen.getByText("Bet: 100")).toBeInTheDocument();
    expect(screen.getByText("Won: +100")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument(); // Player hand value
  });

  it("displays lose result with lost amount", () => {
    const loseResult: ParticipantResult = {
      participantId: "player1",
      name: "Player 1",
      finalHand: createHand(
        [createCard("10", "hearts"), createCard("6", "diamonds")],
        16
      ),
      bet: { value: 50 },
      winAmount: { value: -50 },
      result: "lose",
    };

    render(<GameResult {...defaultProps} results={[loseResult]} />);

    expect(screen.getByText("Player 1")).toBeInTheDocument();
    expect(screen.getByText("LOSE")).toBeInTheDocument();
    expect(screen.getByText("Bet: 50")).toBeInTheDocument();
    expect(screen.getByText("Lost: -50")).toBeInTheDocument();
    expect(screen.getByText("16")).toBeInTheDocument();
  });

  it("displays push result with no win/loss", () => {
    const pushResult: ParticipantResult = {
      participantId: "player1",
      name: "Player 1",
      finalHand: createHand(
        [createCard("10", "hearts"), createCard("7", "diamonds")],
        17
      ),
      bet: { value: 75 },
      winAmount: { value: 0 },
      result: "push",
    };

    render(<GameResult {...defaultProps} results={[pushResult]} />);

    expect(screen.getByText("Player 1")).toBeInTheDocument();
    expect(screen.getByText("PUSH")).toBeInTheDocument();
    expect(screen.getByText("Bet: 75")).toBeInTheDocument();
    expect(screen.getByText("Push: 0")).toBeInTheDocument();
    expect(screen.getAllByText("17")).toHaveLength(2); // Dealer and player both have 17
  });

  it("displays blackjack result with 3:2 payout", () => {
    const blackjackResult: ParticipantResult = {
      participantId: "player1",
      name: "Player 1",
      finalHand: createHand(
        [createCard("A", "spades"), createCard("K", "hearts")],
        21,
        true
      ),
      bet: { value: 100 },
      winAmount: { value: 150 },
      result: "blackjack",
    };

    render(<GameResult {...defaultProps} results={[blackjackResult]} />);

    expect(screen.getByText("Player 1")).toBeInTheDocument();
    expect(screen.getByText("BLACKJACK!")).toBeInTheDocument();
    expect(screen.getByText("Bet: 100")).toBeInTheDocument();
    expect(screen.getByText("Won: +150")).toBeInTheDocument();
    expect(screen.getByText("Blackjack")).toBeInTheDocument(); // Hand value display
  });

  it("displays dealer hand information", () => {
    render(<GameResult {...defaultProps} />);

    expect(screen.getByText("Dealer")).toBeInTheDocument();
    expect(screen.getByText("17")).toBeInTheDocument(); // Dealer hand value
  });

  it("handles bust hands correctly", () => {
    const bustResult: ParticipantResult = {
      participantId: "player1",
      name: "Player 1",
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
    };

    render(<GameResult {...defaultProps} results={[bustResult]} />);

    expect(screen.getByText("BUST")).toBeInTheDocument();
    expect(screen.getByText("Lost: -100")).toBeInTheDocument();
  });

  it("displays multiple player results", () => {
    const results: ParticipantResult[] = [
      {
        participantId: "player1",
        name: "Player 1",
        finalHand: createHand(
          [createCard("Q", "spades"), createCard("K", "clubs")],
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
          [createCard("10", "hearts"), createCard("6", "diamonds")],
          16
        ),
        bet: { value: 50 },
        winAmount: { value: -50 },
        result: "lose",
      },
    ];

    render(<GameResult {...defaultProps} results={results} />);

    expect(screen.getByText("Player 1")).toBeInTheDocument();
    expect(screen.getByText("Player 2")).toBeInTheDocument();
    expect(screen.getAllByText(/WIN|LOSE/)).toHaveLength(2);
  });

  it("calls onNextRound when Next Round button is clicked", async () => {
    const onNextRound = vi.fn();
    render(<GameResult {...defaultProps} onNextRound={onNextRound} />);

    const nextRoundButton = screen.getByRole("button", { name: /next round/i });
    await userEvent.click(nextRoundButton);

    expect(onNextRound).toHaveBeenCalledTimes(1);
  });

  it("calls onEndGame when End Game button is clicked", async () => {
    const onEndGame = vi.fn();
    render(<GameResult {...defaultProps} onEndGame={onEndGame} />);

    const endGameButton = screen.getByRole("button", { name: /end game/i });
    await userEvent.click(endGameButton);

    expect(onEndGame).toHaveBeenCalledTimes(1);
  });

  it("handles participants with null hands (folded)", () => {
    const foldedResult: ParticipantResult = {
      participantId: "player1",
      name: "Player 1",
      finalHand: null,
      bet: null,
      winAmount: null,
      result: "lose",
    };

    render(<GameResult {...defaultProps} results={[foldedResult]} />);

    expect(screen.getByText("Player 1")).toBeInTheDocument();
    expect(screen.getByText("FOLDED")).toBeInTheDocument();
    expect(screen.queryByText("Bet:")).not.toBeInTheDocument();
  });

  it("displays total summary for all results", () => {
    const results: ParticipantResult[] = [
      {
        participantId: "player1",
        name: "Player 1",
        finalHand: createHand(
          [createCard("Q", "spades"), createCard("K", "clubs")],
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
          [createCard("10", "hearts"), createCard("6", "diamonds")],
          16
        ),
        bet: { value: 50 },
        winAmount: { value: -50 },
        result: "lose",
      },
      {
        participantId: "player3",
        name: "Player 3",
        finalHand: createHand(
          [createCard("10", "clubs"), createCard("7", "spades")],
          17
        ),
        bet: { value: 75 },
        winAmount: { value: 0 },
        result: "push",
      },
    ];

    render(<GameResult {...defaultProps} results={results} />);

    expect(screen.getByText("Total: +50")).toBeInTheDocument();
  });
});