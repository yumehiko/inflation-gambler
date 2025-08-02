import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { createBasicStrategyTable } from './basicStrategy';
import { createEasyCpuBrain, createNormalCpuBrain, createHardCpuBrain } from './cpuBrain';
import type { Decision, DecisionContext, Brain } from './brain.types';
import type { Card } from '../../core/card/card.types';
import type { Hand } from '../hand/hand.types';

const meta = {
  title: 'Domains/Blackjack/Brain',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const createMockHand = (cards: Card[], value: number, softValue?: number): Hand => ({
  cards,
  value,
  softValue,
  isBust: false,
  isBlackjack: false,
});

const createMockCard = (rank: string, suit = 'hearts'): Card => ({
  rank: rank as Card['rank'],
  suit: suit as Card['suit'],
});

// Basic Strategy Table Visualization
const BasicStrategyTable = () => {
  const table = createBasicStrategyTable();
  const dealerCards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
  
  const getDecisionColor = (decision: string) => {
    const colors: Record<string, string> = {
      H: '#ff6b6b',   // Hit - Red
      S: '#51cf66',   // Stand - Green
      D: '#4c6ef5',   // Double - Blue
      Dh: '#748ffc',  // Double if allowed, else Hit - Light Blue
      P: '#f59f00',   // Split - Orange
      Ph: '#fab005',  // Split if allowed, else Hit - Light Orange
      Rh: '#495057',  // Surrender if allowed, else Hit - Dark Gray
      Rs: '#868e96',  // Surrender if allowed, else Stand - Gray
    };
    return colors[decision] || '#dee2e6';
  };

  const getDecisionText = (decision: string) => {
    const texts: Record<string, string> = {
      H: 'H',
      S: 'S',
      D: 'D',
      Dh: 'Dh',
      P: 'P',
      Ph: 'Ph',
      Rh: 'Rh',
      Rs: 'Rs',
    };
    return texts[decision] || decision;
  };

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <h3>Hard Hands</h3>
      <table style={{ borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #dee2e6', padding: '8px' }}>Hand</th>
            {dealerCards.map(card => (
              <th key={card} style={{ border: '1px solid #dee2e6', padding: '8px' }}>{card}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(table.hard).map(([handValue, decisions]) => (
            <tr key={handValue}>
              <td style={{ border: '1px solid #dee2e6', padding: '8px', fontWeight: 'bold' }}>
                {handValue}
              </td>
              {dealerCards.map(dealerCard => (
                <td
                  key={dealerCard}
                  style={{
                    border: '1px solid #dee2e6',
                    padding: '8px',
                    backgroundColor: getDecisionColor(decisions[dealerCard as keyof typeof decisions]),
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {getDecisionText(decisions[dealerCard as keyof typeof decisions])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Soft Hands</h3>
      <table style={{ borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #dee2e6', padding: '8px' }}>Hand</th>
            {dealerCards.map(card => (
              <th key={card} style={{ border: '1px solid #dee2e6', padding: '8px' }}>{card}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(table.soft).map(([handValue, decisions]) => (
            <tr key={handValue}>
              <td style={{ border: '1px solid #dee2e6', padding: '8px', fontWeight: 'bold' }}>
                A,{Number(handValue) - 11}
              </td>
              {dealerCards.map(dealerCard => (
                <td
                  key={dealerCard}
                  style={{
                    border: '1px solid #dee2e6',
                    padding: '8px',
                    backgroundColor: getDecisionColor(decisions[dealerCard as keyof typeof decisions]),
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {getDecisionText(decisions[dealerCard as keyof typeof decisions])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Pairs</h3>
      <table style={{ borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #dee2e6', padding: '8px' }}>Pair</th>
            {dealerCards.map(card => (
              <th key={card} style={{ border: '1px solid #dee2e6', padding: '8px' }}>{card}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(table.pairs).map(([pairCard, decisions]) => (
            <tr key={pairCard}>
              <td style={{ border: '1px solid #dee2e6', padding: '8px', fontWeight: 'bold' }}>
                {pairCard},{pairCard}
              </td>
              {dealerCards.map(dealerCard => (
                <td
                  key={dealerCard}
                  style={{
                    border: '1px solid #dee2e6',
                    padding: '8px',
                    backgroundColor: getDecisionColor(decisions[dealerCard as keyof typeof decisions]),
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {getDecisionText(decisions[dealerCard as keyof typeof decisions])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '1rem' }}>
        <h4>Legend:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <span>H = Hit</span>
          <span>S = Stand</span>
          <span>D = Double</span>
          <span>Dh = Double if allowed, else Hit</span>
          <span>P = Split</span>
          <span>Ph = Split if allowed, else Hit</span>
          <span>Rh = Surrender if allowed, else Hit</span>
          <span>Rs = Surrender if allowed, else Stand</span>
        </div>
      </div>
    </div>
  );
};

export const BasicStrategy: Story = {
  render: () => <BasicStrategyTable />,
};

// Decision Simulator
const DecisionSimulator = () => {
  const [playerCards, setPlayerCards] = useState<Card[]>([
    createMockCard('10'),
    createMockCard('6'),
  ]);
  const [dealerUpCard, setDealerUpCard] = useState<Card>(createMockCard('10'));
  const [canDouble, setCanDouble] = useState(true);
  const [canSplit, setCanSplit] = useState(false);
  const [canSurrender, setCanSurrender] = useState(true);
  const [canInsurance, setCanInsurance] = useState(false);

  const calculateHandValue = (cards: Card[]): { value: number; softValue?: number } => {
    let value = 0;
    let aces = 0;

    for (const card of cards) {
      if (card.rank === 'A') {
        aces++;
        value += 11;
      } else if (['K', 'Q', 'J'].includes(card.rank)) {
        value += 10;
      } else {
        value += parseInt(card.rank);
      }
    }

    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    const softValue = aces > 0 && value <= 21 ? value : undefined;
    return { value, softValue };
  };

  const { value, softValue } = calculateHandValue(playerCards);
  const hand = createMockHand(playerCards, value, softValue);

  const context: DecisionContext = {
    hand,
    dealerUpCard,
    canDouble,
    canSplit,
    canSurrender,
    canInsurance,
  };

  const brains: Record<string, Brain> = {
    'Basic Strategy': createNormalCpuBrain(),
    'Easy CPU': createEasyCpuBrain(),
    'Hard CPU': createHardCpuBrain(),
  };

  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  return (
    <div style={{ fontFamily: 'monospace' }}>
      <h3>Decision Simulator</h3>
      
      <div style={{ marginBottom: '2rem' }}>
        <h4>Player Hand</h4>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          {playerCards.map((card, index) => (
            <select
              key={index}
              value={card.rank}
              onChange={(e) => {
                const newCards = [...playerCards];
                newCards[index] = createMockCard(e.target.value);
                setPlayerCards(newCards);
                // Update canSplit based on new cards
                if (newCards.length === 2 && newCards[0].rank === newCards[1].rank) {
                  setCanSplit(true);
                } else {
                  setCanSplit(false);
                }
              }}
              style={{ padding: '5px' }}
            >
              {ranks.map(rank => (
                <option key={rank} value={rank}>{rank}</option>
              ))}
            </select>
          ))}
          <button
            onClick={() => setPlayerCards([...playerCards, createMockCard('2')])}
            style={{ padding: '5px' }}
          >
            Add Card
          </button>
          {playerCards.length > 2 && (
            <button
              onClick={() => setPlayerCards(playerCards.slice(0, -1))}
              style={{ padding: '5px' }}
            >
              Remove Card
            </button>
          )}
        </div>
        <div>Hand Value: {value}{softValue && softValue !== value && ` (soft ${softValue})`}</div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4>Dealer Up Card</h4>
        <select
          value={dealerUpCard.rank}
          onChange={(e) => {
            setDealerUpCard(createMockCard(e.target.value));
            // Update canInsurance based on dealer card
            setCanInsurance(e.target.value === 'A');
          }}
          style={{ padding: '5px' }}
        >
          {ranks.map(rank => (
            <option key={rank} value={rank}>{rank}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4>Available Actions</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label>
            <input
              type="checkbox"
              checked={canDouble}
              onChange={(e) => setCanDouble(e.target.checked)}
            />
            Can Double
          </label>
          <label>
            <input
              type="checkbox"
              checked={canSplit}
              onChange={(e) => setCanSplit(e.target.checked)}
              disabled={playerCards.length !== 2 || playerCards[0].rank !== playerCards[1].rank}
            />
            Can Split {playerCards.length !== 2 || playerCards[0].rank !== playerCards[1].rank ? '(requires pair)' : ''}
          </label>
          <label>
            <input
              type="checkbox"
              checked={canSurrender}
              onChange={(e) => setCanSurrender(e.target.checked)}
            />
            Can Surrender
          </label>
          <label>
            <input
              type="checkbox"
              checked={canInsurance}
              onChange={(e) => setCanInsurance(e.target.checked)}
              disabled={dealerUpCard.rank !== 'A'}
            />
            Can Insurance {dealerUpCard.rank !== 'A' ? '(requires dealer Ace)' : ''}
          </label>
        </div>
      </div>

      <div>
        <h4>Decisions</h4>
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #dee2e6', padding: '8px' }}>Strategy</th>
              <th style={{ border: '1px solid #dee2e6', padding: '8px' }}>Decision</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(brains).map(([name, brain]) => {
              let decision: Decision;
              try {
                // Stories run synchronously, so we need to handle the promise
                const decisionPromise = brain.makeDecision(context);
                decision = 'stand' as Decision; // Default for display
                decisionPromise.then(d => { decision = d; });
              } catch {
                decision = 'stand' as Decision;
              }
              
              return (
                <tr key={name}>
                  <td style={{ border: '1px solid #dee2e6', padding: '8px' }}>{name}</td>
                  <td style={{ 
                    border: '1px solid #dee2e6', 
                    padding: '8px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {decision}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const Simulator: Story = {
  render: () => <DecisionSimulator />,
};