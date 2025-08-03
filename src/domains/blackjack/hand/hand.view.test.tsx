import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HandView } from './hand.view';
import { Hand } from './hand.types';

describe('HandView', () => {
  it('手札のカードを表示する', () => {
    const hand: Hand = {
      cards: [
        { suit: 'hearts', rank: '10' },
        { suit: 'diamonds', rank: 'K' },
      ],
      value: 20,
      isBust: false,
      isBlackjack: false,
    };

    render(<HandView hand={hand} />);

    expect(screen.getByLabelText('10 of hearts')).toBeInTheDocument();
    expect(screen.getByLabelText('K of diamonds')).toBeInTheDocument();
  });

  it('手札の合計値を表示する', () => {
    const hand: Hand = {
      cards: [
        { suit: 'hearts', rank: '7' },
        { suit: 'spades', rank: '8' },
      ],
      value: 15,
      isBust: false,
      isBlackjack: false,
    };

    render(<HandView hand={hand} />);

    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('ソフトハンドの場合も単一の値を表示する', () => {
    const hand: Hand = {
      cards: [
        { suit: 'hearts', rank: 'A' },
        { suit: 'spades', rank: '6' },
      ],
      value: 17,
      softValue: 7,
      isBust: false,
      isBlackjack: false,
    };

    render(<HandView hand={hand} />);

    expect(screen.getByText('17')).toBeInTheDocument();
  });

  it('ブラックジャックの場合も通常の値を表示する', () => {
    const hand: Hand = {
      cards: [
        { suit: 'hearts', rank: 'A' },
        { suit: 'spades', rank: 'K' },
      ],
      value: 21,
      isBust: false,
      isBlackjack: true,
    };

    render(<HandView hand={hand} />);

    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.queryByText('ブラックジャック!')).not.toBeInTheDocument();
  });

  it('バーストの場合も通常の値を表示する', () => {
    const hand: Hand = {
      cards: [
        { suit: 'hearts', rank: '10' },
        { suit: 'spades', rank: '9' },
        { suit: 'diamonds', rank: '5' },
      ],
      value: 24,
      isBust: true,
      isBlackjack: false,
    };

    render(<HandView hand={hand} />);

    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.queryByText('バースト!')).not.toBeInTheDocument();
  });

  it('空の手札の場合、「カードなし」と表示する', () => {
    const hand: Hand = {
      cards: [],
      value: 0,
      isBust: false,
      isBlackjack: false,
    };

    render(<HandView hand={hand} />);

    expect(screen.getByText('カードなし')).toBeInTheDocument();
  });

  it('スーツのシンボルを正しく表示する', () => {
    const hand: Hand = {
      cards: [
        { suit: 'hearts', rank: '2' },
        { suit: 'diamonds', rank: '3' },
        { suit: 'clubs', rank: '4' },
        { suit: 'spades', rank: '5' },
      ],
      value: 14,
      isBust: false,
      isBlackjack: false,
    };

    render(<HandView hand={hand} />);

    expect(screen.getByLabelText('2 of hearts')).toBeInTheDocument();
    expect(screen.getByLabelText('3 of diamonds')).toBeInTheDocument();
    expect(screen.getByLabelText('4 of clubs')).toBeInTheDocument();
    expect(screen.getByLabelText('5 of spades')).toBeInTheDocument();
  });


  it('裏向きのカードがある場合、値を「?」形式で表示する', () => {
    const hand: Hand = {
      cards: [
        { suit: 'hearts', rank: '10', faceUp: true },
        { suit: 'spades', rank: 'K', faceUp: false },
      ],
      value: 20,
      isBust: false,
      isBlackjack: false,
    };

    render(<HandView hand={hand} />);

    expect(screen.getByText('10?')).toBeInTheDocument();
    expect(screen.getByLabelText('Face down card')).toBeInTheDocument();
  });

  it('すべてのカードが裏向きの場合、値を「?」と表示する', () => {
    const hand: Hand = {
      cards: [
        { suit: 'hearts', rank: '10', faceUp: false },
        { suit: 'spades', rank: 'K', faceUp: false },
      ],
      value: 20,
      isBust: false,
      isBlackjack: false,
    };

    render(<HandView hand={hand} />);

    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Face down card')).toHaveLength(2);
  });


});