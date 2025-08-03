import type { Meta, StoryObj } from '@storybook/react';
import { HandView } from './hand.view';

const meta: Meta<typeof HandView> = {
  title: 'Blackjack/Hand',
  component: HandView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    hand: {
      cards: [],
      value: 0,
      isBust: false,
      isBlackjack: false,
    },
  },
};

export const SingleCard: Story = {
  args: {
    hand: {
      cards: [{ suit: 'hearts', rank: '7' }],
      value: 7,
      isBust: false,
      isBlackjack: false,
    },
  },
};

export const TwoCards: Story = {
  args: {
    hand: {
      cards: [
        { suit: 'hearts', rank: '10' },
        { suit: 'spades', rank: '8' },
      ],
      value: 18,
      isBust: false,
      isBlackjack: false,
    },
  },
};

export const SoftHand: Story = {
  args: {
    hand: {
      cards: [
        { suit: 'hearts', rank: 'A' },
        { suit: 'diamonds', rank: '6' },
      ],
      value: 17,
      softValue: 7,
      isBust: false,
      isBlackjack: false,
    },
  },
};

export const Blackjack: Story = {
  args: {
    hand: {
      cards: [
        { suit: 'spades', rank: 'A' },
        { suit: 'hearts', rank: 'K' },
      ],
      value: 21,
      isBust: false,
      isBlackjack: true,
    },

  },
};

export const Bust: Story = {
  args: {
    hand: {
      cards: [
        { suit: 'clubs', rank: '10' },
        { suit: 'diamonds', rank: '9' },
        { suit: 'hearts', rank: '5' },
      ],
      value: 24,
      isBust: true,
      isBlackjack: false,
    },

  },
};

export const MultipleCards: Story = {
  args: {
    hand: {
      cards: [
        { suit: 'hearts', rank: '3' },
        { suit: 'diamonds', rank: '4' },
        { suit: 'clubs', rank: '5' },
        { suit: 'spades', rank: '6' },
      ],
      value: 18,
      isBust: false,
      isBlackjack: false,
    },
  },
};

export const AllSuits: Story = {
  args: {
    hand: {
      cards: [
        { suit: 'hearts', rank: 'A' },
        { suit: 'diamonds', rank: 'K' },
        { suit: 'clubs', rank: 'Q' },
        { suit: 'spades', rank: 'J' },
      ],
      value: 31,
      isBust: true,
      isBlackjack: false,
    },
  },
};

export const TwoAces: Story = {
  args: {
    hand: {
      cards: [
        { suit: 'hearts', rank: 'A' },
        { suit: 'spades', rank: 'A' },
      ],
      value: 12,
      softValue: 2,
      isBust: false,
      isBlackjack: false,
    },
  },
};

export const DealerInitialHand: Story = {
  args: {
    hand: {
      cards: [
        { suit: 'hearts', rank: 'K', faceUp: true },
        { suit: 'spades', rank: 'A', faceUp: false },
      ],
      value: 21,
      isBust: false,
      isBlackjack: true,
    },

  },
};

export const AllFaceDown: Story = {
  args: {
    hand: {
      cards: [
        { suit: 'hearts', rank: '10', faceUp: false },
        { suit: 'diamonds', rank: '9', faceUp: false },
      ],
      value: 19,
      isBust: false,
      isBlackjack: false,
    },
  },
};

export const MixedFaceUpDown: Story = {
  args: {
    hand: {
      cards: [
        { suit: 'clubs', rank: '5', faceUp: true },
        { suit: 'hearts', rank: '6', faceUp: true },
        { suit: 'spades', rank: '10', faceUp: false },
      ],
      value: 21,
      isBust: false,
      isBlackjack: false,
    },
  },
};

export const HiddenBust: Story = {
  args: {
    hand: {
      cards: [
        { suit: 'hearts', rank: '10', faceUp: true },
        { suit: 'diamonds', rank: '9', faceUp: true },
        { suit: 'spades', rank: 'K', faceUp: false },
      ],
      value: 29,
      isBust: true,
      isBlackjack: false,
    },

  },
};