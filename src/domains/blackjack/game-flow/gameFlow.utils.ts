import { GameFlow, GameConfig, GameEvent, SettlementResult } from './gameFlow.types';
import { Player } from '../player/player.types';
import { Dealer } from '../dealer/dealer.types';
import { Card } from '../../core/card/card.types';
import { createDeck, shuffleDeck } from '../../core/deck/deck.utils';
import { requestBet } from '../player/player.utils';
import { Hand } from '../hand/hand.types';

// ゲーム初期化
export const createGameFlow = (config: GameConfig): GameFlow => {
  // デッキを作成
  let deck: Card[] = [];
  for (let i = 0; i < config.deckCount; i++) {
    deck = deck.concat(createDeck());
  }
  deck = shuffleDeck(deck);

  return {
    id: `game-${Date.now()}`,
    phase: 'waiting',
    playerIds: config.playerConfigs.map(p => p.id),
    dealerId: 'dealer',
    currentPlayerId: null,
    deck,
    history: [],
  };
};

// フェーズ進行管理
export const canStartGame = (game: GameFlow): boolean => {
  return game.phase === 'waiting';
};

export const canStartBetting = (game: GameFlow): boolean => {
  return game.phase === 'waiting';
};

export const canDealCards = (game: GameFlow): boolean => {
  return game.phase === 'betting';
};

export const canStartPlayerTurn = (game: GameFlow): boolean => {
  return game.phase === 'dealing';
};

export const canStartDealerTurn = (game: GameFlow): boolean => {
  return game.phase === 'playing';
};

export const canSettle = (game: GameFlow): boolean => {
  return game.phase === 'dealerTurn';
};

// ゲーム進行ロジック
export const startBettingPhase = (game: GameFlow): GameFlow => {
  const event: GameEvent = {
    type: 'game_started',
    timestamp: Date.now(),
  };

  return {
    ...game,
    phase: 'betting',
    history: [...game.history, event],
  };
};

export const collectBets = async (game: GameFlow, players: Player[]): Promise<GameFlow> => {
  const history = [...game.history];
  console.log('collectBets called for players:', players.map(p => ({ id: p.id, name: p.name, brain: p.brain.type })));

  for (const player of players) {
    console.log(`Requesting bet from player ${player.id} (${player.brain.type})`);
    try {
      const betAmount = await requestBet(player, 10, 500); // TODO: use game config for min/max
      console.log(`Player ${player.id} bet amount: ${betAmount}`);
      const event: GameEvent = {
        type: 'bet_placed',
        playerId: player.id,
        amount: betAmount,
        timestamp: Date.now(),
      };
      history.push(event);
    } catch (error) {
      console.error(`Error collecting bet from player ${player.id}:`, error);
      throw error;
    }
  }

  return {
    ...game,
    history,
  };
};

export const dealInitialCards = (game: GameFlow, dealer: Dealer, players: Player[]): GameFlow => {
  const deck = [...game.deck];
  const history = [...game.history];

  // First card to each player
  for (const player of players) {
    const card = deck.pop();
    if (card) {
      const event: GameEvent = {
        type: 'card_dealt',
        receiverId: player.id,
        card,
        timestamp: Date.now(),
      };
      history.push(event);
    }
  }

  // First card to dealer
  const dealerCard1 = deck.pop();
  if (dealerCard1) {
    const event: GameEvent = {
      type: 'card_dealt',
      receiverId: dealer.id,
      card: dealerCard1,
      timestamp: Date.now(),
    };
    history.push(event);
  }

  // Second card to each player
  for (const player of players) {
    const card = deck.pop();
    if (card) {
      const event: GameEvent = {
        type: 'card_dealt',
        receiverId: player.id,
        card,
        timestamp: Date.now(),
      };
      history.push(event);
    }
  }

  // Second card to dealer (hole card)
  const dealerCard2 = deck.pop();
  if (dealerCard2) {
    const event: GameEvent = {
      type: 'card_dealt',
      receiverId: dealer.id,
      card: { ...dealerCard2, faceUp: false },
      timestamp: Date.now(),
    };
    history.push(event);
  }

  return {
    ...game,
    deck,
    history,
  };
};

export const checkBlackjacks = (game: GameFlow, _dealer: Dealer, players: Player[]): GameFlow => {
  const history = [...game.history];

  for (const player of players) {
    const hasBlackjack = isBlackjack(player.hand);
    const event: GameEvent = {
      type: 'blackjack_checked',
      playerId: player.id,
      hasBlackjack,
      timestamp: Date.now(),
    };
    history.push(event);
  }

  return {
    ...game,
    history,
  };
};

export const processPlayerTurn = async (game: GameFlow, player: Player): Promise<GameFlow> => {
  const history = [...game.history];

  // Get player decision
  const context = {
    hand: player.hand,
    dealerUpCard: { suit: 'spades', rank: 'A' } as Card, // TODO: get actual dealer up card
    canDouble: true, // TODO: implement proper logic
    canSplit: false, // TODO: implement proper logic
    canSurrender: true, // TODO: implement proper logic
    canInsurance: false, // TODO: implement proper logic
    history: [],
  };

  const decision = await player.brain.makeDecision(context);

  const actionEvent: GameEvent = {
    type: 'player_action',
    playerId: player.id,
    action: decision,
    timestamp: Date.now(),
  };
  history.push(actionEvent);

  // Check if player busted
  if (player.hasBusted) {
    const bustEvent: GameEvent = {
      type: 'player_busted',
      playerId: player.id,
      timestamp: Date.now(),
    };
    history.push(bustEvent);
  }

  return {
    ...game,
    history,
  };
};

export const processDealerTurn = async (game: GameFlow): Promise<GameFlow> => {
  const event: GameEvent = {
    type: 'dealer_turn_started',
    timestamp: Date.now(),
  };

  return {
    ...game,
    history: [...game.history, event],
  };
};

export const settleGame = (game: GameFlow, dealer: Dealer, players: Player[]): GameFlow => {
  const results: SettlementResult[] = players.map(player => calculatePayout(player, dealer));

  const event: GameEvent = {
    type: 'settlement_completed',
    results,
    timestamp: Date.now(),
  };

  return {
    ...game,
    phase: 'finished',
    history: [...game.history, event],
  };
};

// ヘルパー関数
export const getNextPlayer = (game: GameFlow): string | null => {
  if (!game.currentPlayerId) {
    return game.playerIds[0] || null;
  }

  const currentIndex = game.playerIds.indexOf(game.currentPlayerId);
  if (currentIndex === -1 || currentIndex === game.playerIds.length - 1) {
    return null;
  }

  return game.playerIds[currentIndex + 1];
};

export const isGameComplete = (game: GameFlow): boolean => {
  return game.phase === 'finished';
};

export const calculatePayout = (player: Player, dealer: Dealer): SettlementResult => {
  const playerValue = player.hand.value;
  const dealerValue = dealer.hand.value;
  const playerBusted = player.hasBusted;
  const dealerBusted = dealerValue > 21;

  // Player busted
  if (playerBusted) {
    return {
      playerId: player.id,
      outcome: 'lose',
      payout: 0,
    };
  }

  // Dealer busted
  if (dealerBusted) {
    return {
      playerId: player.id,
      outcome: 'win',
      payout: player.currentBet * 2,
    };
  }

  // Check for blackjack
  if (isBlackjack(player.hand) && player.hand.cards.length === 2) {
    if (isBlackjack(dealer.hand) && dealer.hand.cards.length === 2) {
      return {
        playerId: player.id,
        outcome: 'push',
        payout: player.currentBet,
      };
    }
    return {
      playerId: player.id,
      outcome: 'blackjack',
      payout: player.currentBet * 2.5,
    };
  }

  // Compare values
  if (playerValue > dealerValue) {
    return {
      playerId: player.id,
      outcome: 'win',
      payout: player.currentBet * 2,
    };
  } else if (playerValue === dealerValue) {
    return {
      playerId: player.id,
      outcome: 'push',
      payout: player.currentBet,
    };
  } else {
    return {
      playerId: player.id,
      outcome: 'lose',
      payout: 0,
    };
  }
};

// Helper to check if hand is blackjack
const isBlackjack = (hand: Hand): boolean => {
  return hand.isBlackjack;
};