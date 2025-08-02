import type { Meta, StoryObj } from '@storybook/react';
import { PlayerView } from './player.view';
import { usePlayerStore } from './player.store';
import { Brain } from '../brain/brain.types';
import { Card } from '../../core/card/card.types';
import { Hand } from '../hand/hand.types';
import { useEffect } from 'react';

const meta = {
  title: 'Blackjack/Player',
  component: PlayerView,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PlayerView>;

export default meta;
type Story = StoryObj<typeof meta>;

const humanBrain: Brain = {
  type: 'human',
  makeDecision: async () => 'stand',
};

const cpuBrain: Brain = {
  type: 'cpu-easy',
  makeDecision: async () => 'hit',
};

type SetupStoryProps = {
  playerId: string;
  name: string;
  brain: Brain;
  chips: number;
  currentBet: number;
  hand: Hand;
  isActive: boolean;
  hasStood: boolean;
  hasBusted: boolean;
};

const SetupStory = ({ 
  playerId, 
  name, 
  brain, 
  chips, 
  currentBet, 
  hand, 
  isActive, 
  hasStood, 
  hasBusted 
}: SetupStoryProps) => {
  useEffect(() => {
    const store = usePlayerStore.getState();
    store.addPlayer(playerId, name, brain, chips);
    store.updatePlayer(playerId, { 
      currentBet, 
      hand, 
      hasStood, 
      hasBusted 
    });
    if (isActive) {
      store.setActivePlayer(playerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <PlayerView playerId={playerId} />;
};

export const HumanPlayer: Story = {
  args: {
    playerId: 'human-player',
  },
  render: () => (
    <SetupStory
      playerId="human-player"
      name="John"
      brain={humanBrain}
      chips={1000}
      currentBet={100}
      hand={{
        cards: [
          { suit: 'hearts', rank: 'K' } as Card,
          { suit: 'spades', rank: '8' } as Card,
        ],
        value: 18,
        isBust: false,
        isBlackjack: false,
      }}
      isActive={false}
      hasStood={false}
      hasBusted={false}
    />
  ),
};

export const CPUPlayer: Story = {
  args: {
    playerId: 'cpu-player',
  },
  render: () => (
    <SetupStory
      playerId="cpu-player"
      name="CPU Easy"
      brain={cpuBrain}
      chips={1500}
      currentBet={50}
      hand={{
        cards: [
          { suit: 'diamonds', rank: 'Q' } as Card,
          { suit: 'clubs', rank: '7' } as Card,
        ],
        value: 17,
        isBust: false,
        isBlackjack: false,
      }}
      isActive={false}
      hasStood={false}
      hasBusted={false}
    />
  ),
};

export const ActivePlayer: Story = {
  args: {
    playerId: 'active-player',
  },
  render: () => (
    <SetupStory
      playerId="active-player"
      name="Active Player"
      brain={humanBrain}
      chips={800}
      currentBet={200}
      hand={{
        cards: [
          { suit: 'hearts', rank: 'A' } as Card,
          { suit: 'spades', rank: '5' } as Card,
        ],
        value: 16,
        softValue: 6,
        isBust: false,
        isBlackjack: false,
      }}
      isActive={true}
      hasStood={false}
      hasBusted={false}
    />
  ),
};

export const BustedPlayer: Story = {
  args: {
    playerId: 'busted-player',
  },
  render: () => (
    <SetupStory
      playerId="busted-player"
      name="Busted Player"
      brain={humanBrain}
      chips={500}
      currentBet={150}
      hand={{
        cards: [
          { suit: 'hearts', rank: 'K' } as Card,
          { suit: 'spades', rank: 'Q' } as Card,
          { suit: 'diamonds', rank: '5' } as Card,
        ],
        value: 25,
        isBust: true,
        isBlackjack: false,
      }}
      isActive={false}
      hasStood={false}
      hasBusted={true}
    />
  ),
};

export const StandingPlayer: Story = {
  args: {
    playerId: 'standing-player',
  },
  render: () => (
    <SetupStory
      playerId="standing-player"
      name="Standing Player"
      brain={humanBrain}
      chips={1200}
      currentBet={100}
      hand={{
        cards: [
          { suit: 'hearts', rank: '10' } as Card,
          { suit: 'spades', rank: '10' } as Card,
        ],
        value: 20,
        isBust: false,
        isBlackjack: false,
      }}
      isActive={false}
      hasStood={true}
      hasBusted={false}
    />
  ),
};

export const BlackjackPlayer: Story = {
  args: {
    playerId: 'blackjack-player',
  },
  render: () => (
    <SetupStory
      playerId="blackjack-player"
      name="Lucky Player"
      brain={humanBrain}
      chips={2000}
      currentBet={500}
      hand={{
        cards: [
          { suit: 'hearts', rank: 'A' } as Card,
          { suit: 'spades', rank: 'K' } as Card,
        ],
        value: 21,
        isBust: false,
        isBlackjack: true,
      }}
      isActive={false}
      hasStood={false}
      hasBusted={false}
    />
  ),
};