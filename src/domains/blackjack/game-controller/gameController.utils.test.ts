import { describe, it, expect } from "vitest";
import {
  initializeGame,
  startNewRound,
  processBets,
  dealInitialCards,
  processPlayerAction,
  processDealerTurn,
  settleRound,
  validateAction,
  transitionToNextPhase,
  determineWinner,
} from "./gameController.utils";
import { GameState, GamePhase } from "./gameController.types";
import { Dealer } from "../dealer/dealer.types";
import { createDeck } from "../../core/deck/deck.utils";
import { createCoin } from "../../core/coin/coin.utils";
import { createHand } from "../hand/hand.utils";
import { createDealer } from "../dealer/dealer.utils";
import { createParticipant } from "../participant/participant.utils";
import { createHumanBrain } from "../brain/brain.utils";

describe("gameController.utils", () => {
  describe("initializeGame", () => {
    it("should initialize game with participants and dealer", () => {
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
        createParticipant({ id: "player2", name: "Player 2", balance: createCoin(1000), brain: createHumanBrain() }),
      ];
      
      const gameState = initializeGame(participants);
      
      expect(gameState.phase).toBe("waiting");
      expect(gameState.participants).toHaveLength(2);
      expect(gameState.dealer).toBeDefined();
      expect(gameState.deck).toBeDefined();
      expect(gameState.currentTurnIndex).toBe(-1);
      expect(gameState.roundNumber).toBe(0);
      expect(gameState.history).toHaveLength(0);
    });
  });

  describe("startNewRound", () => {
    it("should transition to betting phase and increment round number", () => {
      const initialState = initializeGame([
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
      ]);
      
      const newState = startNewRound(initialState);
      
      expect(newState.phase).toBe("betting");
      expect(newState.roundNumber).toBe(1);
      expect(newState.currentTurnIndex).toBe(-1);
    });

    it("should reset participant and dealer hands", () => {
      const participant = createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() });
      const initialState: GameState = {
        phase: "settlement",
        participants: [{
          ...participant,
          hand: createHand([]),
          bet: createCoin(100),
          status: "stand",
        }],
        dealer: {
          ...createDealer(),
          hand: createHand([]),
        },
        deck: createDeck(),
        currentTurnIndex: -1,
        roundNumber: 1,
        history: [],
      };
      
      const newState = startNewRound(initialState);
      
      expect(newState.participants[0].hand).toBeNull();
      expect(newState.participants[0].bet).toBeNull();
      expect(newState.participants[0].status).toBe("active");
      expect(newState.dealer.hand.cards).toHaveLength(0);
    });
  });

  describe("processBets", () => {
    it("should process bets for all participants and transition to dealing phase", () => {
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
        createParticipant({ id: "player2", name: "Player 2", balance: createCoin(500), brain: createHumanBrain() }),
      ];
      const initialState = {
        ...initializeGame(participants),
        phase: "betting" as GamePhase,
      };
      
      const bets = new Map([
        [participants[0].id, 100],
        [participants[1].id, 50],
      ]);
      
      const newState = processBets(initialState, bets);
      
      expect(newState.phase).toBe("dealing");
      expect(newState.participants[0].bet?.value).toBe(100);
      expect(newState.participants[0].balance.value).toBe(900);
      expect(newState.participants[1].bet?.value).toBe(50);
      expect(newState.participants[1].balance.value).toBe(450);
    });

    it("should skip participants with invalid bets", () => {
      const participants = [
        createParticipant({ id: "player1", name: "Player 1", balance: createCoin(100), brain: createHumanBrain() }),
      ];
      const initialState = {
        ...initializeGame(participants),
        phase: "betting" as GamePhase,
      };
      
      const bets = new Map([[participants[0].id, 200]]); // Bet more than balance
      
      const newState = processBets(initialState, bets);
      
      expect(newState.participants[0].bet).toBeNull();
      expect(newState.participants[0].balance.value).toBe(100);
    });
  });

  describe("dealInitialCards", () => {
    it("should deal 2 cards to each participant and dealer", () => {
      const participants = [
        { ...createParticipant({ id: "player1", name: "Player 1", balance: createCoin(900), brain: createHumanBrain() }), bet: createCoin(100) },
        { ...createParticipant({ id: "player2", name: "Player 2", balance: createCoin(950), brain: createHumanBrain() }), bet: createCoin(50) },
      ];
      const initialState: GameState = {
        phase: "dealing",
        participants,
        dealer: createDealer(),
        deck: createDeck(),
        currentTurnIndex: -1,
        roundNumber: 1,
        history: [],
      };
      
      const newState = dealInitialCards(initialState);
      
      expect(newState.phase).toBe("playing");
      expect(newState.currentTurnIndex).toBe(0);
      expect(newState.participants[0].hand?.cards).toHaveLength(2);
      expect(newState.participants[1].hand?.cards).toHaveLength(2);
      expect(newState.dealer.hand.cards).toHaveLength(2);
      expect(newState.dealer.isShowingHoleCard).toBe(false);
      expect(newState.deck.length).toBe(52 - 6); // 2 cards per participant + 2 for dealer
    });

    it("should check for blackjack and update status", () => {
      const participants = [
        { ...createParticipant({ id: "player1", name: "Player 1", balance: createCoin(900), brain: createHumanBrain() }), bet: createCoin(100) },
      ];
      const blackjackDeck = [
        { suit: "spades" as const, rank: "A" as const },  // Player's first card
        { suit: "clubs" as const, rank: "2" as const },   // Dealer's first card
        { suit: "hearts" as const, rank: "10" as const }, // Player's second card (Blackjack!)
        { suit: "diamonds" as const, rank: "3" as const }, // Dealer's second card
        ...createDeck().slice(4),
      ];
      const initialState: GameState = {
        phase: "dealing",
        participants,
        dealer: createDealer(),
        deck: blackjackDeck,
        currentTurnIndex: -1,
        roundNumber: 1,
        history: [],
      };
      
      const newState = dealInitialCards(initialState);
      
      expect(newState.participants[0].status).toBe("blackjack");
      expect(newState.participants[0].hand?.isBlackjack).toBe(true);
    });
  });

  describe("processPlayerAction", () => {
    it("should process hit action", () => {
      const hand = createHand([
        { suit: "hearts", rank: "10" },
        { suit: "spades", rank: "6" },
      ]);
      const participant = {
        ...createParticipant({ id: "player1", name: "Player 1", balance: createCoin(900), brain: createHumanBrain() }),
        hand,
        bet: createCoin(100),
        status: "active" as const,
      };
      const deck = createDeck();
      const initialState: GameState = {
        phase: "playing",
        participants: [participant],
        dealer: createDealer(),
        deck,
        currentTurnIndex: 0,
        roundNumber: 1,
        history: [],
      };
      
      const newState = processPlayerAction(initialState, participant.id, { type: "hit" });
      
      expect(newState.participants[0].hand?.cards).toHaveLength(3);
      expect(newState.deck.length).toBe(deck.length - 1);
    });

    it("should process stand action and move to next player", () => {
      const participants = [
        {
          ...createParticipant({ id: "player1", name: "Player 1", balance: createCoin(900), brain: createHumanBrain() }),
          hand: createHand([
            { suit: "hearts", rank: "10" },
            { suit: "spades", rank: "8" },
          ]),
          bet: createCoin(100),
          status: "active" as const,
        },
        {
          ...createParticipant({ id: "player2", name: "Player 2", balance: createCoin(950), brain: createHumanBrain() }),
          hand: createHand([
            { suit: "clubs", rank: "9" },
            { suit: "diamonds", rank: "7" },
          ]),
          bet: createCoin(50),
          status: "active" as const,
        },
      ];
      const initialState: GameState = {
        phase: "playing",
        participants,
        dealer: createDealer(),
        deck: createDeck(),
        currentTurnIndex: 0,
        roundNumber: 1,
        history: [],
      };
      
      const newState = processPlayerAction(initialState, participants[0].id, { type: "stand" });
      
      expect(newState.participants[0].status).toBe("stand");
      expect(newState.currentTurnIndex).toBe(1);
    });

    it("should transition to dealer turn when all players are done", () => {
      const participant = {
        ...createParticipant({ id: "player1", name: "Player 1", balance: createCoin(900), brain: createHumanBrain() }),
        hand: createHand([
          { suit: "hearts", rank: "10" },
          { suit: "spades", rank: "8" },
        ]),
        bet: createCoin(100),
        status: "active" as const,
      };
      const initialState: GameState = {
        phase: "playing",
        participants: [participant],
        dealer: createDealer(),
        deck: createDeck(),
        currentTurnIndex: 0,
        roundNumber: 1,
        history: [],
      };
      
      const newState = processPlayerAction(initialState, participant.id, { type: "stand" });
      
      expect(newState.phase).toBe("dealer-turn");
    });
  });

  describe("processDealerTurn", () => {
    it("should make dealer hit when below 17", () => {
      const dealer: Dealer = {
        ...createDealer(),
        hand: createHand([
          { suit: "hearts", rank: "10" },
          { suit: "spades", rank: "6" },
        ]),
      };
      const initialState: GameState = {
        phase: "dealer-turn",
        participants: [],
        dealer,
        deck: createDeck(),
        currentTurnIndex: -1,
        roundNumber: 1,
        history: [],
      };
      
      const newState = processDealerTurn(initialState);
      
      expect(newState.dealer.hand.cards.length).toBeGreaterThan(2);
      expect(newState.dealer.isShowingHoleCard).toBe(true);
    });

    it("should transition to settlement when dealer is done", () => {
      const dealer: Dealer = {
        ...createDealer(),
        hand: createHand([
          { suit: "hearts", rank: "10" },
          { suit: "spades", rank: "8" },
        ]),
      };
      const initialState: GameState = {
        phase: "dealer-turn",
        participants: [],
        dealer,
        deck: createDeck(),
        currentTurnIndex: -1,
        roundNumber: 1,
        history: [],
      };
      
      const newState = processDealerTurn(initialState);
      
      expect(newState.phase).toBe("settlement");
      expect(newState.dealer.hand.value).toBe(18);
    });
  });

  describe("settleRound", () => {
    it("should settle winnings and update history", () => {
      const participants = [
        {
          ...createParticipant({ id: "player1", name: "Player 1", balance: createCoin(900), brain: createHumanBrain() }),
          hand: createHand([
            { suit: "hearts", rank: "10" },
            { suit: "spades", rank: "10" },
          ]),
          bet: createCoin(100),
          status: "stand" as const,
        },
        {
          ...createParticipant({ id: "player2", name: "Player 2", balance: createCoin(950), brain: createHumanBrain() }),
          hand: createHand([
            { suit: "clubs", rank: "10" },
            { suit: "diamonds", rank: "6" },
          ]),
          bet: createCoin(50),
          status: "stand" as const,
        },
      ];
      const dealer: Dealer = {
        ...createDealer(),
        hand: createHand([
          { suit: "hearts", rank: "10" },
          { suit: "spades", rank: "8" },
        ]),
        isShowingHoleCard: true,
      };
      const initialState: GameState = {
        phase: "settlement",
        participants,
        dealer,
        deck: createDeck(),
        currentTurnIndex: -1,
        roundNumber: 1,
        history: [],
      };
      
      const newState = settleRound(initialState);
      
      expect(newState.phase).toBe("waiting");
      expect(newState.history).toHaveLength(1);
      expect(newState.history[0].roundNumber).toBe(1);
      expect(newState.history[0].participants).toHaveLength(2);
      
      // Player 1 wins (20 vs 18)
      expect(newState.participants[0].balance.value).toBe(1100); // 900 + 200 (bet + win)
      expect(newState.history[0].participants[0].result).toBe("win");
      
      // Player 2 loses (16 vs 18)
      expect(newState.participants[1].balance.value).toBe(950); // No change
      expect(newState.history[0].participants[1].result).toBe("lose");
    });

    it("should handle blackjack payouts", () => {
      const participant = {
        ...createParticipant({ id: "player1", name: "Player 1", balance: createCoin(900), brain: createHumanBrain() }),
        hand: createHand([
          { suit: "hearts", rank: "A" },
          { suit: "spades", rank: "K" },
        ]),
        bet: createCoin(100),
        status: "blackjack" as const,
      };
      const dealer: Dealer = {
        ...createDealer(),
        hand: createHand([
          { suit: "hearts", rank: "10" },
          { suit: "spades", rank: "8" },
        ]),
        isShowingHoleCard: true,
      };
      const initialState: GameState = {
        phase: "settlement",
        participants: [participant],
        dealer,
        deck: createDeck(),
        currentTurnIndex: -1,
        roundNumber: 1,
        history: [],
      };
      
      const newState = settleRound(initialState);
      
      // Blackjack pays 3:2
      expect(newState.participants[0].balance.value).toBe(1150); // 900 + 100 (bet) + 150 (3:2 payout)
      expect(newState.history[0].participants[0].result).toBe("blackjack");
    });
  });

  describe("validateAction", () => {
    it("should validate hit action", () => {
      const gameState: GameState = {
        phase: "playing",
        participants: [{
          ...createParticipant({ id: "player1", name: "Player 1", balance: createCoin(900), brain: createHumanBrain() }),
          hand: createHand([
            { suit: "hearts", rank: "10" },
            { suit: "spades", rank: "6" },
          ]),
          bet: createCoin(100),
          status: "active",
        }],
        dealer: createDealer(),
        deck: createDeck(),
        currentTurnIndex: 0,
        roundNumber: 1,
        history: [],
      };
      
      const isValid = validateAction(gameState, gameState.participants[0].id, { type: "hit" });
      
      expect(isValid).toBe(true);
    });

    it("should reject action in wrong phase", () => {
      const gameState: GameState = {
        phase: "betting",
        participants: [{
          ...createParticipant({ id: "player1", name: "Player 1", balance: createCoin(1000), brain: createHumanBrain() }),
        }],
        dealer: createDealer(),
        deck: createDeck(),
        currentTurnIndex: -1,
        roundNumber: 1,
        history: [],
      };
      
      const isValid = validateAction(gameState, gameState.participants[0].id, { type: "hit" });
      
      expect(isValid).toBe(false);
    });

    it("should reject action for wrong player", () => {
      const participants = [
        {
          ...createParticipant({ id: "player1", name: "Player 1", balance: createCoin(900), brain: createHumanBrain() }),
          hand: createHand([]),
          bet: createCoin(100),
          status: "active" as const,
        },
        {
          ...createParticipant({ id: "player2", name: "Player 2", balance: createCoin(950), brain: createHumanBrain() }),
          hand: createHand([]),
          bet: createCoin(50),
          status: "active" as const,
        },
      ];
      const gameState: GameState = {
        phase: "playing",
        participants,
        dealer: createDealer(),
        deck: createDeck(),
        currentTurnIndex: 0,
        roundNumber: 1,
        history: [],
      };
      
      const isValid = validateAction(gameState, participants[1].id, { type: "hit" });
      
      expect(isValid).toBe(false);
    });
  });

  describe("transitionToNextPhase", () => {
    it("should transition from waiting to betting", () => {
      const phase = transitionToNextPhase("waiting");
      expect(phase).toBe("betting");
    });

    it("should transition from betting to dealing", () => {
      const phase = transitionToNextPhase("betting");
      expect(phase).toBe("dealing");
    });

    it("should transition from dealing to playing", () => {
      const phase = transitionToNextPhase("dealing");
      expect(phase).toBe("playing");
    });

    it("should transition from playing to dealer-turn", () => {
      const phase = transitionToNextPhase("playing");
      expect(phase).toBe("dealer-turn");
    });

    it("should transition from dealer-turn to settlement", () => {
      const phase = transitionToNextPhase("dealer-turn");
      expect(phase).toBe("settlement");
    });

    it("should transition from settlement to waiting", () => {
      const phase = transitionToNextPhase("settlement");
      expect(phase).toBe("waiting");
    });
  });

  describe("determineWinner", () => {
    it("should determine player wins with higher value", () => {
      const participantHand = createHand([
        { suit: "hearts", rank: "10" },
        { suit: "spades", rank: "10" },
      ]);
      const dealerHand = createHand([
        { suit: "hearts", rank: "10" },
        { suit: "spades", rank: "8" },
      ]);
      
      const result = determineWinner(participantHand, dealerHand);
      
      expect(result).toBe("win");
    });

    it("should determine dealer wins with higher value", () => {
      const participantHand = createHand([
        { suit: "hearts", rank: "10" },
        { suit: "spades", rank: "6" },
      ]);
      const dealerHand = createHand([
        { suit: "hearts", rank: "10" },
        { suit: "spades", rank: "8" },
      ]);
      
      const result = determineWinner(participantHand, dealerHand);
      
      expect(result).toBe("lose");
    });

    it("should determine push with equal values", () => {
      const participantHand = createHand([
        { suit: "hearts", rank: "10" },
        { suit: "spades", rank: "8" },
      ]);
      const dealerHand = createHand([
        { suit: "clubs", rank: "10" },
        { suit: "diamonds", rank: "8" },
      ]);
      
      const result = determineWinner(participantHand, dealerHand);
      
      expect(result).toBe("push");
    });

    it("should determine player loses when bust", () => {
      const participantHand = createHand([
        { suit: "hearts", rank: "10" },
        { suit: "spades", rank: "10" },
        { suit: "clubs", rank: "5" },
      ]);
      const dealerHand = createHand([
        { suit: "hearts", rank: "10" },
        { suit: "spades", rank: "8" },
      ]);
      
      const result = determineWinner(participantHand, dealerHand);
      
      expect(result).toBe("lose");
    });

    it("should determine player wins when dealer busts", () => {
      const participantHand = createHand([
        { suit: "hearts", rank: "10" },
        { suit: "spades", rank: "8" },
      ]);
      const dealerHand = createHand([
        { suit: "hearts", rank: "10" },
        { suit: "spades", rank: "10" },
        { suit: "clubs", rank: "5" },
      ]);
      
      const result = determineWinner(participantHand, dealerHand);
      
      expect(result).toBe("win");
    });

    it("should handle blackjack correctly", () => {
      const participantHand = createHand([
        { suit: "hearts", rank: "A" },
        { suit: "spades", rank: "K" },
      ]);
      const dealerHand = createHand([
        { suit: "hearts", rank: "10" },
        { suit: "spades", rank: "10" },
      ]);
      
      const result = determineWinner(participantHand, dealerHand);
      
      expect(result).toBe("blackjack");
    });
  });
});