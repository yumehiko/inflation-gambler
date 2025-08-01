import type { Meta, StoryObj } from '@storybook/react';
import { Card } from '../../core/card/card.types';
import { createHand } from '../hand/hand.utils';
import {
  createHandHolder,
  updateHandHolderStatus,
  getAvailableActions,
  addCardToHandHolder,
} from './handHolder.utils';
import { HandHolder } from './handHolder.types';

const meta = {
  title: 'Domains/Blackjack/HandHolder',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const createCard = (rank: string, suit: string, faceUp = true): Card => ({
  rank: rank as Card['rank'],
  suit: suit as Card['suit'],
  faceUp,
});

const HandHolderDisplay = ({ holder }: { holder: HandHolder }) => {
  const actions = getAvailableActions(holder);
  
  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>HandHolder: {holder.id}</h3>
      <p>Type: {holder.type}</p>
      <p>Status: {holder.status}</p>
      <p>Hand Value: {holder.hand.value}</p>
      {holder.hand.softValue && <p>Soft Value: {holder.hand.softValue}</p>}
      <p>Cards: {holder.hand.cards.length}</p>
      <div style={{ marginTop: '10px' }}>
        <h4>Available Actions:</h4>
        <ul>
          <li>Can Hit: {actions.canHit ? '✓' : '✗'}</li>
          <li>Can Stand: {actions.canStand ? '✓' : '✗'}</li>
          <li>Can Double: {actions.canDouble ? '✓' : '✗'}</li>
          <li>Can Split: {actions.canSplit ? '✓' : '✗'}</li>
        </ul>
      </div>
    </div>
  );
};

export const DealerWaiting: Story = {
  render: () => {
    const holder = createHandHolder('dealer-1', 'dealer');
    return <HandHolderDisplay holder={holder} />;
  },
};

export const ParticipantActive: Story = {
  render: () => {
    const holder = createHandHolder('player-1', 'participant');
    const cards = [createCard('7', 'hearts'), createCard('8', 'spades')];
    const hand = createHand(cards);
    const activeHolder: HandHolder = { ...holder, hand, status: 'active' };
    return <HandHolderDisplay holder={activeHolder} />;
  },
};

export const ParticipantBlackjack: Story = {
  render: () => {
    const holder = createHandHolder('player-1', 'participant');
    const cards = [createCard('A', 'spades'), createCard('K', 'hearts')];
    const hand = createHand(cards);
    const holderWithCards: HandHolder = { ...holder, hand, status: 'active' };
    const updatedHolder = updateHandHolderStatus(holderWithCards);
    return <HandHolderDisplay holder={updatedHolder} />;
  },
};

export const ParticipantBust: Story = {
  render: () => {
    const holder = createHandHolder('player-1', 'participant');
    const cards = [
      createCard('K', 'spades'),
      createCard('Q', 'hearts'),
      createCard('5', 'diamonds'),
    ];
    const hand = createHand(cards);
    const holderWithCards: HandHolder = { ...holder, hand, status: 'active' };
    const updatedHolder = updateHandHolderStatus(holderWithCards);
    return <HandHolderDisplay holder={updatedHolder} />;
  },
};

export const ParticipantCanSplit: Story = {
  render: () => {
    const holder = createHandHolder('player-1', 'participant');
    const cards = [createCard('8', 'spades'), createCard('8', 'hearts')];
    const hand = createHand(cards);
    const activeHolder: HandHolder = { ...holder, hand, status: 'active' };
    return <HandHolderDisplay holder={activeHolder} />;
  },
};

export const ParticipantCanDouble: Story = {
  render: () => {
    const holder = createHandHolder('player-1', 'participant');
    const cards = [createCard('5', 'spades'), createCard('6', 'hearts')];
    const hand = createHand(cards);
    const activeHolder: HandHolder = { ...holder, hand, status: 'active' };
    return <HandHolderDisplay holder={activeHolder} />;
  },
};

export const DealerActive: Story = {
  render: () => {
    const holder = createHandHolder('dealer-1', 'dealer');
    const cards = [createCard('7', 'hearts'), createCard('9', 'spades')];
    const hand = createHand(cards);
    const activeHolder: HandHolder = { ...holder, hand, status: 'active' };
    return <HandHolderDisplay holder={activeHolder} />;
  },
};

export const AddCardDemo: Story = {
  render: () => {
    let holder = createHandHolder('player-1', 'participant');
    holder = { ...holder, status: 'active' };
    
    const card1 = createCard('7', 'hearts');
    holder = addCardToHandHolder(holder, card1);
    
    const card2 = createCard('8', 'spades');
    holder = addCardToHandHolder(holder, card2);
    
    return (
      <div>
        <h3>After adding 7♥ and 8♠:</h3>
        <HandHolderDisplay holder={holder} />
      </div>
    );
  },
};