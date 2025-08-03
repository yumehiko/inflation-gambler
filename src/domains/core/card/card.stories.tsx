import type { Meta, StoryObj } from '@storybook/react'
import { CardView } from './card.view'
import type { Rank, Suit } from './card.types'

const meta = {
  title: 'Core/Card',
  component: CardView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CardView>

export default meta
type Story = StoryObj<typeof meta>

const suits: Suit[] = ['hearts', 'diamonds', 'spades', 'clubs']
const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export const Default: Story = {
  args: {
    card: { suit: 'hearts', rank: 'A' },
  },
}

export const AllSuits: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {suits.map((suit) => (
        <CardView key={suit} card={{ suit, rank: 'A' }} />
      ))}
    </div>
  ),
  args: {
    card: { suit: 'hearts', rank: 'A' },
  },
}

export const AllRanks: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {ranks.map((rank) => (
        <CardView key={rank} card={{ suit: 'spades', rank }} />
      ))}
    </div>
  ),
  args: {
    card: { suit: 'spades', rank: 'A' },
  },
}

export const FullDeck: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {suits.map((suit) => (
        <div key={suit}>
          <h3 style={{ margin: '0 0 8px 0', textTransform: 'capitalize' }}>{suit}</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {ranks.map((rank) => (
              <CardView key={`${suit}-${rank}`} card={{ suit, rank }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  args: {
    card: { suit: 'hearts', rank: 'A' },
  },
}

export const FaceCards: Story = {
  render: () => {
    const faceRanks: Rank[] = ['J', 'Q', 'K']
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {suits.map((suit) =>
          faceRanks.map((rank) => (
            <CardView key={`${suit}-${rank}`} card={{ suit, rank }} />
          ))
        )}
      </div>
    )
  },
  args: {
    card: { suit: 'hearts', rank: 'J' },
  },
}

export const Aces: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {suits.map((suit) => (
        <CardView key={suit} card={{ suit, rank: 'A' }} />
      ))}
    </div>
  ),
  args: {
    card: { suit: 'hearts', rank: 'A' },
  },
}

export const FaceDown: Story = {
  args: {
    card: { suit: 'hearts', rank: 'A', faceUp: false },
  },
}

export const FaceUpAndFaceDown: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
      <CardView card={{ suit: 'hearts', rank: 'K', faceUp: true }} />
      <CardView card={{ suit: 'spades', rank: 'A', faceUp: false }} />
      <CardView card={{ suit: 'diamonds', rank: 'Q' }} />
      <CardView card={{ suit: 'clubs', rank: '10', faceUp: false }} />
    </div>
  ),
  args: {
    card: { suit: 'hearts', rank: 'A' },
  },
}