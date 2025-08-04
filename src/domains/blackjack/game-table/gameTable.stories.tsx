import type { Meta, StoryObj } from '@storybook/react';
import { GameTableView } from './gameTable.view';
import { useGameFlowStore } from '../game-flow/gameFlow.store';
import { usePlayerStore } from '../player/player.store';
import { useDealerStore } from '../dealer/dealer.store';
import { Brain } from '../brain/brain.types';
import { Card } from '../../core/card/card.types';
import { useEffect } from 'react';

const meta = {
  title: 'Blackjack/GameTable',
  component: GameTableView,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0f4c3a',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GameTableView>;

export default meta;
type Story = StoryObj<typeof meta>;

const humanBrain: Brain = {
  type: 'human',
  makeDecision: async () => 'stand',
  decideBet: async () => 100,
};

type SetupStoryProps = {
  phase: 'waiting' | 'betting' | 'dealing' | 'playing' | 'dealerTurn' | 'settlement' | 'finished';
  playerHand?: Card[];
  dealerHand?: Card[];
  playerChips?: number;
  currentBet?: number;
};

const SetupStory = ({ 
  phase,
  playerHand = [],
  dealerHand = [],
  playerChips = 1000,
  currentBet = 0,
}: SetupStoryProps) => {
  useEffect(() => {
    // Game Flow Store のセットアップ
    const gameFlowStore = useGameFlowStore.getState();
    
    // ゲームを初期化
    gameFlowStore.initializeGame({
      playerConfigs: [{
        id: 'player-1',
        name: 'Player',
        brain: humanBrain,
        initialChips: playerChips,
      }],
      minBet: 10,
      maxBet: 1000,
      deckCount: 6,
    });
    
    // フェーズを設定
    gameFlowStore.setPhase(phase);

    // Player Store のセットアップ
    const playerStore = usePlayerStore.getState();
    playerStore.addPlayer('player-1', 'Player', humanBrain, playerChips);
    if (playerHand.length > 0) {
      playerStore.updatePlayer('player-1', { 
        hand: {
          cards: [playerHand[0]],
          value: 0, // This will be calculated by the game logic
          isBust: false,
          isBlackjack: false,
        }
      });
      if (playerHand[1]) {
        playerStore.updatePlayer('player-1', { 
          hand: {
            cards: playerHand,
            value: 0, // This will be calculated by the game logic
            isBust: false,
            isBlackjack: false,
          }
        });
      }
    }
    if (currentBet > 0) {
      playerStore.updatePlayer('player-1', { currentBet });
    }
    if (phase === 'playing') {
      playerStore.setActivePlayer('player-1');
    }

    // Dealer Store のセットアップ
    const dealerStore = useDealerStore.getState();
    dealerStore.initializeDealer();
    if (dealerHand.length > 0) {
      dealerStore.dealCardToDealer(dealerHand[0], false);
      if (dealerHand[1]) {
        dealerStore.dealCardToDealer(dealerHand[1], true);
      }
    }

    // クリーンアップ
    return () => {
      gameFlowStore.resetGame();
      playerStore.resetAllPlayers();
      dealerStore.resetDealer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <GameTableView />;
};

export const Default: Story = {
  render: () => <SetupStory phase="waiting" />,
};

export const BettingPhase: Story = {
  render: () => (
    <SetupStory 
      phase="betting"
      playerChips={1000}
    />
  ),
};

export const PlayingPhase: Story = {
  render: () => (
    <SetupStory 
      phase="playing"
      playerHand={[
        { suit: 'hearts', rank: 'K' } as Card,
        { suit: 'spades', rank: '7' } as Card,
      ]}
      dealerHand={[
        { suit: 'diamonds', rank: 'A' } as Card,
        { suit: 'clubs', rank: '10' } as Card,
      ]}
      playerChips={900}
      currentBet={100}
    />
  ),
};

export const DealerTurn: Story = {
  render: () => (
    <SetupStory 
      phase="dealerTurn"
      playerHand={[
        { suit: 'hearts', rank: '10' } as Card,
        { suit: 'spades', rank: '9' } as Card,
      ]}
      dealerHand={[
        { suit: 'diamonds', rank: 'K' } as Card,
        { suit: 'clubs', rank: '6' } as Card,
      ]}
      playerChips={800}
      currentBet={200}
    />
  ),
};

export const Settlement: Story = {
  render: () => (
    <SetupStory 
      phase="settlement"
      playerHand={[
        { suit: 'hearts', rank: 'Q' } as Card,
        { suit: 'spades', rank: 'J' } as Card,
      ]}
      dealerHand={[
        { suit: 'diamonds', rank: '10' } as Card,
        { suit: 'clubs', rank: '7' } as Card,
        { suit: 'hearts', rank: '5' } as Card,
      ]}
      playerChips={1100}
      currentBet={100}
    />
  ),
};

export const GameFinished: Story = {
  render: () => (
    <SetupStory 
      phase="finished"
      playerHand={[
        { suit: 'hearts', rank: 'A' } as Card,
        { suit: 'spades', rank: 'K' } as Card,
      ]}
      dealerHand={[
        { suit: 'diamonds', rank: '9' } as Card,
        { suit: 'clubs', rank: '8' } as Card,
      ]}
      playerChips={1250}
      currentBet={0}
    />
  ),
};

export const PlayerBlackjack: Story = {
  render: () => (
    <SetupStory 
      phase="settlement"
      playerHand={[
        { suit: 'hearts', rank: 'A' } as Card,
        { suit: 'spades', rank: 'K' } as Card,
      ]}
      dealerHand={[
        { suit: 'diamonds', rank: '10' } as Card,
        { suit: 'clubs', rank: '8' } as Card,
      ]}
      playerChips={1150}
      currentBet={100}
    />
  ),
};

export const PlayerBusted: Story = {
  render: () => (
    <SetupStory 
      phase="settlement"
      playerHand={[
        { suit: 'hearts', rank: 'K' } as Card,
        { suit: 'spades', rank: 'Q' } as Card,
        { suit: 'diamonds', rank: '5' } as Card,
      ]}
      dealerHand={[
        { suit: 'clubs', rank: '10' } as Card,
        { suit: 'hearts', rank: '7' } as Card,
      ]}
      playerChips={800}
      currentBet={100}
    />
  ),
};