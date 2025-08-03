import type { Meta, StoryObj } from '@storybook/react';
import { DealerView } from './dealer.view';
import { useDealerStore } from './dealer.store';
import { Card } from '../../core/card/card.types';
import { Hand } from '../hand/hand.types';
import { useEffect } from 'react';

const meta = {
  title: 'Blackjack/Dealer',
  component: DealerView,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DealerView>;

export default meta;
type Story = StoryObj<typeof meta>;

type SetupStoryProps = {
  hand: Hand;
  isShowingHoleCard: boolean;
};

const SetupStory = ({ hand, isShowingHoleCard }: SetupStoryProps) => {
  useEffect(() => {
    const store = useDealerStore.getState();
    store.initializeDealer();
    // Manually set the dealer state for storybook using setState
    useDealerStore.setState({
      dealer: {
        id: 'dealer',
        hand,
        isShowingHoleCard,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <DealerView />;
};

export const DealerWithHiddenCard: Story = {
  render: () => (
    <SetupStory
      hand={{
        cards: [
          { suit: 'hearts', rank: 'K', faceUp: true } as Card,
          { suit: 'spades', rank: '9', faceUp: false } as Card, // Hidden card
        ],
        value: 19, // Actual total value (will be shown as 10? in the UI)
        isBust: false,
        isBlackjack: false,
      }}
      isShowingHoleCard={false}
    />
  ),
};

export const DealerWithRevealedCard: Story = {
  render: () => (
    <SetupStory
      hand={{
        cards: [
          { suit: 'hearts', rank: 'K', faceUp: true } as Card,
          { suit: 'spades', rank: '7', faceUp: true } as Card,
        ],
        value: 17,
        isBust: false,
        isBlackjack: false,
      }}
      isShowingHoleCard={true}
    />
  ),
};

export const DealerWithSoft17: Story = {
  render: () => (
    <SetupStory
      hand={{
        cards: [
          { suit: 'hearts', rank: 'A', faceUp: true } as Card,
          { suit: 'spades', rank: '6', faceUp: true } as Card,
        ],
        value: 17,
        softValue: 7,
        isBust: false,
        isBlackjack: false,
      }}
      isShowingHoleCard={true}
    />
  ),
};

export const DealerBusted: Story = {
  render: () => (
    <SetupStory
      hand={{
        cards: [
          { suit: 'hearts', rank: 'K', faceUp: true } as Card,
          { suit: 'spades', rank: 'Q', faceUp: true } as Card,
          { suit: 'diamonds', rank: '5', faceUp: true } as Card,
        ],
        value: 25,
        isBust: true,
        isBlackjack: false,
      }}
      isShowingHoleCard={true}
    />
  ),
};

export const DealerBlackjack: Story = {
  render: () => (
    <SetupStory
      hand={{
        cards: [
          { suit: 'hearts', rank: 'A', faceUp: true } as Card,
          { suit: 'spades', rank: 'K', faceUp: true } as Card,
        ],
        value: 21,
        isBust: false,
        isBlackjack: true,
      }}
      isShowingHoleCard={true}
    />
  ),
};

export const Dealer20: Story = {
  render: () => (
    <SetupStory
      hand={{
        cards: [
          { suit: 'hearts', rank: '10', faceUp: true } as Card,
          { suit: 'spades', rank: '10', faceUp: true } as Card,
        ],
        value: 20,
        isBust: false,
        isBlackjack: false,
      }}
      isShowingHoleCard={true}
    />
  ),
};

export const DealerMultipleCards: Story = {
  render: () => (
    <SetupStory
      hand={{
        cards: [
          { suit: 'hearts', rank: '5', faceUp: true } as Card,
          { suit: 'spades', rank: '4', faceUp: true } as Card,
          { suit: 'diamonds', rank: '3', faceUp: true } as Card,
          { suit: 'clubs', rank: '6', faceUp: true } as Card,
        ],
        value: 18,
        isBust: false,
        isBlackjack: false,
      }}
      isShowingHoleCard={true}
    />
  ),
};