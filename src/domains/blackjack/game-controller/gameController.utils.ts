import { GameState, GamePhase, GameAction, ParticipantResult, GameHistory } from "./gameController.types";
import { Participant, ParticipantStatus } from "../participant/participant.types";
import { Dealer } from "../dealer/dealer.types";
import { Hand } from "../hand/hand.types";
import { createDeck, drawCard } from "../../core/deck/deck.utils";
import { createDealer } from "../dealer/dealer.utils";
import { createHand, addCardToHand } from "../hand/hand.utils";
import { createCoin } from "../../core/coin/coin.utils";

export function initializeGame(participants: Participant[]): GameState {
  return {
    phase: "waiting",
    participants,
    dealer: createDealer(),
    deck: createDeck(),
    currentTurnIndex: -1,
    roundNumber: 0,
    history: [],
  };
}

export function startNewRound(gameState: GameState): GameState {
  const resetParticipants = gameState.participants.map(participant => ({
    ...participant,
    hand: null,
    bet: null,
    status: "active" as ParticipantStatus,
  }));

  const resetDealer: Dealer = {
    ...gameState.dealer,
    hand: createHand([]),
    isShowingHoleCard: false,
  };

  return {
    ...gameState,
    phase: "betting",
    participants: resetParticipants,
    dealer: resetDealer,
    deck: createDeck(),
    currentTurnIndex: -1,
    roundNumber: gameState.roundNumber + 1,
  };
}

export function processBets(gameState: GameState, bets: Map<string, number>): GameState {
  const updatedParticipants = gameState.participants.map(participant => {
    const betAmount = bets.get(participant.id);
    if (!betAmount || betAmount > participant.balance.value) {
      return participant;
    }

    return {
      ...participant,
      bet: createCoin(betAmount),
      balance: createCoin(participant.balance.value - betAmount),
    };
  });

  return {
    ...gameState,
    phase: "dealing",
    participants: updatedParticipants,
  };
}

export function dealInitialCards(gameState: GameState): GameState {
  let deck = [...gameState.deck];
  const updatedParticipants: Participant[] = [];
  let dealer = { ...gameState.dealer };

  // Deal first card to each participant
  for (const participant of gameState.participants) {
    if (participant.bet) {
      const { card, remainingDeck } = drawCard(deck);
      deck = remainingDeck;
      const hand = createHand([card]);
      updatedParticipants.push({
        ...participant,
        hand,
      });
    } else {
      updatedParticipants.push(participant);
    }
  }

  // Deal first card to dealer
  const { card: dealerCard1, remainingDeck: deck1 } = drawCard(deck);
  deck = deck1;
  dealer = {
    ...dealer,
    hand: createHand([dealerCard1]),
  };

  // Deal second card to each participant
  const finalParticipants = updatedParticipants.map((participant) => {
    if (participant.hand) {
      const { card, remainingDeck } = drawCard(deck);
      deck = remainingDeck;
      const newHand = addCardToHand(participant.hand, card);
      
      // Check for blackjack
      const status: ParticipantStatus = newHand.isBlackjack ? "blackjack" : "active";
      
      return {
        ...participant,
        hand: newHand,
        status,
      };
    }
    return participant;
  });

  // Deal second card to dealer (hole card)
  const { card: dealerCard2, remainingDeck: finalDeck } = drawCard(deck);
  dealer = {
    ...dealer,
    hand: addCardToHand(dealer.hand, dealerCard2),
    isShowingHoleCard: false,
  };

  // Find first active participant
  const firstActiveIndex = finalParticipants.findIndex(
    p => p.status === "active" && p.bet !== null
  );

  return {
    ...gameState,
    phase: "playing",
    participants: finalParticipants,
    dealer,
    deck: finalDeck,
    currentTurnIndex: firstActiveIndex,
  };
}

export function processPlayerAction(
  gameState: GameState,
  participantId: string,
  action: GameAction
): GameState {
  const participantIndex = gameState.participants.findIndex(p => p.id === participantId);
  if (participantIndex === -1) {
    return gameState;
  }

  const participant = gameState.participants[participantIndex];
  if (!participant.hand) {
    return gameState;
  }

  let updatedParticipant = participant;
  let deck = gameState.deck;

  switch (action.type) {
    case "hit": {
      const { card, remainingDeck } = drawCard(deck);
      deck = remainingDeck;
      const newHand = addCardToHand(participant.hand, card);
      updatedParticipant = {
        ...participant,
        hand: newHand,
        status: newHand.isBust ? "bust" : participant.status,
      };
      break;
    }
    case "stand": {
      updatedParticipant = {
        ...participant,
        status: "stand",
      };
      break;
    }
    case "double":
    case "split":
    case "surrender":
      // These actions are not implemented yet
      return gameState;
  }

  const updatedParticipants = [...gameState.participants];
  updatedParticipants[participantIndex] = updatedParticipant;

  // Check if we need to move to next player
  let nextTurnIndex = gameState.currentTurnIndex;
  if (updatedParticipant.status !== "active") {
    // Find next active participant
    nextTurnIndex = -1;
    for (let i = participantIndex + 1; i < updatedParticipants.length; i++) {
      if (updatedParticipants[i].status === "active" && updatedParticipants[i].bet !== null) {
        nextTurnIndex = i;
        break;
      }
    }
  }

  // Check if all players are done
  const allPlayersDone = updatedParticipants.every(
    p => !p.bet || p.status !== "active"
  );

  return {
    ...gameState,
    participants: updatedParticipants,
    deck,
    currentTurnIndex: nextTurnIndex,
    phase: allPlayersDone ? "dealer-turn" : gameState.phase,
  };
}

export function processDealerTurn(gameState: GameState): GameState {
  let dealer = {
    ...gameState.dealer,
    isShowingHoleCard: true,
  };
  let deck = [...gameState.deck];

  // Dealer hits on 16 or less, stands on 17 or more
  while (dealer.hand.value < 17) {
    const { card, remainingDeck } = drawCard(deck);
    deck = remainingDeck;
    dealer = {
      ...dealer,
      hand: addCardToHand(dealer.hand, card),
    };
  }

  return {
    ...gameState,
    dealer,
    deck,
    phase: "settlement",
  };
}

export function settleRound(gameState: GameState): GameState {
  const dealerHand = gameState.dealer.hand;
  const participantResults: ParticipantResult[] = [];
  const updatedParticipants: Participant[] = [];

  for (const participant of gameState.participants) {
    if (!participant.hand || !participant.bet) {
      updatedParticipants.push(participant);
      continue;
    }

    const result = determineWinner(participant.hand, dealerHand);
    let winAmount = createCoin(0);
    let newBalance = participant.balance;

    switch (result) {
      case "win":
        winAmount = createCoin(participant.bet.value * 2);
        newBalance = createCoin(participant.balance.value + winAmount.value);
        break;
      case "blackjack":
        // Blackjack pays 3:2
        winAmount = createCoin(participant.bet.value * 2.5);
        newBalance = createCoin(participant.balance.value + winAmount.value);
        break;
      case "push":
        winAmount = participant.bet;
        newBalance = createCoin(participant.balance.value + winAmount.value);
        break;
      case "lose":
        // No change to balance, bet was already deducted
        break;
    }

    participantResults.push({
      participantId: participant.id,
      name: participant.name,
      finalHand: participant.hand,
      bet: participant.bet,
      winAmount: result === "lose" ? null : winAmount,
      result,
    });

    updatedParticipants.push({
      ...participant,
      balance: newBalance,
    });
  }

  const historyEntry: GameHistory = {
    roundNumber: gameState.roundNumber,
    participants: participantResults,
    dealerHand,
    timestamp: new Date(),
  };

  return {
    ...gameState,
    phase: "waiting",
    participants: updatedParticipants,
    history: [...gameState.history, historyEntry],
  };
}

export function validateAction(
  gameState: GameState,
  participantId: string,
  action: GameAction
): boolean {
  // Check if in playing phase
  if (gameState.phase !== "playing") {
    return false;
  }

  // Check if it's the participant's turn
  const currentParticipant = gameState.participants[gameState.currentTurnIndex];
  if (!currentParticipant || currentParticipant.id !== participantId) {
    return false;
  }

  // Check if participant is active
  if (currentParticipant.status !== "active") {
    return false;
  }

  // Check if participant has a hand
  if (!currentParticipant.hand) {
    return false;
  }

  // Validate specific actions
  switch (action.type) {
    case "hit":
      return !currentParticipant.hand.isBust;
    case "stand":
      return true;
    case "double":
    case "split":
    case "surrender":
      // Not implemented yet
      return false;
    default:
      return false;
  }
}

export function transitionToNextPhase(currentPhase: GamePhase): GamePhase {
  switch (currentPhase) {
    case "waiting":
      return "betting";
    case "betting":
      return "dealing";
    case "dealing":
      return "playing";
    case "playing":
      return "dealer-turn";
    case "dealer-turn":
      return "settlement";
    case "settlement":
      return "waiting";
    default:
      return currentPhase;
  }
}

export function determineWinner(participantHand: Hand, dealerHand: Hand): ParticipantResult["result"] {
  // Player bust
  if (participantHand.isBust) {
    return "lose";
  }

  // Dealer bust
  if (dealerHand.isBust) {
    return "win";
  }

  // Player blackjack
  if (participantHand.isBlackjack && !dealerHand.isBlackjack) {
    return "blackjack";
  }

  // Both blackjack or equal values
  if (participantHand.value === dealerHand.value) {
    return "push";
  }

  // Higher value wins
  return participantHand.value > dealerHand.value ? "win" : "lose";
}