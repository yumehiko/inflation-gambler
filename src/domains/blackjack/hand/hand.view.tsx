import { FC } from 'react';
import { Hand } from './hand.types';
import { calculateVisibleValue } from './hand.utils';
import { CardView } from '../../core/card/card.view';
import styles from './hand.module.css';

type HandViewProps = {
  hand: Hand;
  label?: string;
};

const getValueDisplay = (hand: Hand): string => {
  const hasHiddenCards = hand.cards.some(card => card.faceUp === false);
  
  if (hasHiddenCards) {
    const visibleValue = calculateVisibleValue(hand.cards);
    return visibleValue > 0 ? `${visibleValue} + ?` : '?';
  }
  
  if (hand.softValue !== undefined && hand.value !== hand.softValue) {
    return `${hand.softValue} / ${hand.value}`;
  }
  return hand.value.toString();
};

export const HandView: FC<HandViewProps> = ({ hand, label }) => {
  const { cards, isBust, isBlackjack } = hand;

  return (
    <div className={styles.container}>
      {label && <h3 className={styles.label}>{label}</h3>}
      
      <div className={styles.cards}>
        {cards.length === 0 ? (
          <div className={styles.noCards}>カードなし</div>
        ) : (
          cards.map((card, index) => (
            <CardView key={`${card.suit}-${card.rank}-${index}`} card={card} />
          ))
        )}
      </div>

      <div className={styles.status}>
        <div className={styles.value}>{getValueDisplay(hand)}</div>
        {isBlackjack && !hasHiddenCards && (
          <div className={styles.blackjack}>ブラックジャック!</div>
        )}
        {isBust && !hasHiddenCards && (
          <div className={styles.bust}>バースト!</div>
        )}
      </div>
    </div>
  );
};