import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameTableView } from "./gameController.view";
import { useGameController } from "./gameController.hook";
import type { Participant } from "../participant/participant.types";
import type { Dealer } from "../dealer/dealer.types";
import type { GamePhase } from "./gameController.types";
import type { Hand } from "../hand/hand.types";

vi.mock("./gameController.hook");

const mockUseGameController = vi.mocked(useGameController);

describe("GameTableView", () => {
  const mockHand: Hand = {
    cards: [],
    value: 0,
    isBust: false,
    isBlackjack: false
  };

  const mockParticipant: Participant = {
    id: "player1",
    name: "Player 1",
    status: "active",
    hand: null,
    bet: null,
    balance: { value: 1000 },
    brain: {
      type: "human",
      makeDecision: vi.fn()
    }
  };

  const mockDealer: Dealer = {
    id: "dealer",
    hand: mockHand,
    isShowingHoleCard: false
  };

  const defaultMockReturn = {
    phase: "waiting" as GamePhase,
    participants: [mockParticipant],
    dealer: mockDealer,
    deck: [],
    currentParticipant: null,
    currentTurnIndex: -1,
    roundNumber: 0,
    history: [],
    activeParticipants: [mockParticipant],
    isGameInProgress: false,
    initializeGame: vi.fn(),
    startNewRound: vi.fn(),
    placeBets: vi.fn(),
    dealCards: vi.fn(),
    handlePlayerAction: vi.fn(),
    handleDealerTurn: vi.fn(),
    settleRound: vi.fn(),
    canPerformAction: vi.fn(),
    reset: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGameController.mockReturnValue(defaultMockReturn);
  });

  describe("Layout", () => {
    it("should render dealer area", () => {
      render(<GameTableView />);
      expect(screen.getByLabelText("Dealer area")).toBeInTheDocument();
    });

    it("should render players area", () => {
      render(<GameTableView />);
      expect(screen.getByLabelText("Players area")).toBeInTheDocument();
    });

    it("should render game info area", () => {
      render(<GameTableView />);
      expect(screen.getByLabelText("Game information")).toBeInTheDocument();
    });

    it("should render action buttons area when game is in progress", () => {
      mockUseGameController.mockReturnValue({
        ...defaultMockReturn,
        phase: "playing",
        isGameInProgress: true,
        currentParticipant: mockParticipant
      });
      
      render(<GameTableView />);
      expect(screen.getByLabelText("Action buttons")).toBeInTheDocument();
    });
  });

  describe("Game Phases", () => {
    it("should display waiting phase correctly", () => {
      render(<GameTableView />);
      expect(screen.getByText("Waiting to start")).toBeInTheDocument();
      expect(screen.getByText("Start New Game")).toBeInTheDocument();
    });

    it("should display betting phase correctly", () => {
      mockUseGameController.mockReturnValue({
        ...defaultMockReturn,
        phase: "betting",
        isGameInProgress: true
      });
      
      render(<GameTableView />);
      expect(screen.getByText("Place your bets")).toBeInTheDocument();
    });

    it("should display playing phase correctly", () => {
      mockUseGameController.mockReturnValue({
        ...defaultMockReturn,
        phase: "playing",
        isGameInProgress: true,
        currentParticipant: mockParticipant
      });
      
      render(<GameTableView />);
      expect(screen.getByText("Player 1's turn")).toBeInTheDocument();
    });

    it("should display dealer turn phase correctly", () => {
      mockUseGameController.mockReturnValue({
        ...defaultMockReturn,
        phase: "dealer-turn",
        isGameInProgress: true
      });
      
      render(<GameTableView />);
      expect(screen.getByText("Dealer's turn")).toBeInTheDocument();
    });

    it("should display settlement phase correctly", () => {
      mockUseGameController.mockReturnValue({
        ...defaultMockReturn,
        phase: "settlement",
        isGameInProgress: true
      });
      
      render(<GameTableView />);
      expect(screen.getByText("Round complete")).toBeInTheDocument();
    });
  });

  describe("Player Display", () => {
    it("should highlight current player", () => {
      mockUseGameController.mockReturnValue({
        ...defaultMockReturn,
        phase: "playing",
        isGameInProgress: true,
        currentParticipant: mockParticipant,
        currentTurnIndex: 0
      });
      
      render(<GameTableView />);
      const playerArea = screen.getByTestId("player-0");
      expect(playerArea.className).toContain("currentTurn");
    });

    it("should display player information correctly", () => {
      render(<GameTableView />);
      expect(screen.getByText("Player 1")).toBeInTheDocument();
      expect(screen.getByText("Balance: $1,000")).toBeInTheDocument();
    });

    it("should display bet amount during active game", () => {
      const participantWithBet = {
        ...mockParticipant,
        bet: { value: 100 }
      };
      
      mockUseGameController.mockReturnValue({
        ...defaultMockReturn,
        participants: [participantWithBet],
        phase: "playing",
        isGameInProgress: true
      });
      
      render(<GameTableView />);
      expect(screen.getByText("Bet: $100")).toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    it("should show enabled Hit button when action is available", () => {
      const participantWithActions = {
        ...mockParticipant,
        hand: mockHand
      };
      
      mockUseGameController.mockReturnValue({
        ...defaultMockReturn,
        phase: "playing",
        isGameInProgress: true,
        currentParticipant: participantWithActions,
        participants: [participantWithActions],
        canPerformAction: vi.fn().mockImplementation((_id, action) => action.type === "hit")
      });
      
      render(<GameTableView />);
      const hitButton = screen.getByText("Hit");
      expect(hitButton).not.toBeDisabled();
    });

    it("should show disabled Hit button when action is not available", () => {
      mockUseGameController.mockReturnValue({
        ...defaultMockReturn,
        phase: "playing",
        isGameInProgress: true,
        currentParticipant: mockParticipant,
        canPerformAction: vi.fn().mockReturnValue(false)
      });
      
      render(<GameTableView />);
      const hitButton = screen.getByText("Hit");
      expect(hitButton).toBeDisabled();
    });
  });

  describe("Round Information", () => {
    it("should display round number", () => {
      mockUseGameController.mockReturnValue({
        ...defaultMockReturn,
        roundNumber: 5
      });
      
      render(<GameTableView />);
      expect(screen.getByText("Round 5")).toBeInTheDocument();
    });

    it("should display deck remaining cards", () => {
      mockUseGameController.mockReturnValue({
        ...defaultMockReturn,
        deck: Array(42).fill({ rank: "A", suit: "spades", faceUp: false })
      });
      
      render(<GameTableView />);
      expect(screen.getByText("Cards remaining: 42")).toBeInTheDocument();
    });
  });
});