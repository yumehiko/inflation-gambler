import { FC } from 'react';
import { Hand } from './hand.types';
import { calculateVisibleValue } from './hand.utils';
import { CardView } from '../../core/card/card.view';
import styles from './hand.module.css';

type HandViewProps = {
  hand: Hand;
};

const getValueDisplay = (hand: Hand): string => {
  const hasHiddenCards = hand.cards.some(card => card.faceUp === false);
  
  if (hasHiddenCards) {
    const visibleValue = calculateVisibleValue(hand.cards);
    return visibleValue > 0 ? `${visibleValue}?` : '?';
  }
  
  return hand.value.toString();
};

export const HandView: FC<HandViewProps> = ({ hand }) => {
  const { cards } = hand;

  return (
    <div className={styles.container}>
      <div className={`${styles.cards} ${cards.length >= 4 ? styles.cardsOverlap : ''}`}>
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
      </div>
    </div>
  );
};