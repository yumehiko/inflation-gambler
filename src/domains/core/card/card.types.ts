export type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs';

export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export type Card = {
  suit: Suit;
  rank: Rank;
  faceUp?: boolean;
};

/**
 * カードが表向きかどうかを判定する
 * @param card - 判定対象のカード
 * @returns カードが表向きの場合true
 * @remarks faceUpが未定義の場合もtrueを返す（デフォルトは表向き）
 */
export const isFaceUp = (card: Card): boolean => {
  // faceUpが明示的にfalseでない限り、カードは表向きとして扱う
  // （undefined や true の場合は表向き）
  return card.faceUp !== false;
};