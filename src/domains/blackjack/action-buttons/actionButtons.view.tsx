import type { FC } from 'react';
import type { ActionButtonsProps } from './actionButtons.types';
import styles from './actionButtons.module.css';

export const ActionButtonsView: FC<ActionButtonsProps> = ({
  canHit,
  canStand,
  canDouble,
  canSplit,
  canSurrender,
  onAction,
  disabled = false,
}) => {
  const handleAction = (type: 'hit' | 'stand' | 'double' | 'split' | 'surrender') => {
    if (!disabled) {
      onAction({ type });
    }
  };

  return (
    <div className={styles.container} role="group" aria-label="Player actions">
      <button
        className={`${styles.button} ${styles.hit}`}
        onClick={() => handleAction('hit')}
        disabled={!canHit || disabled}
        aria-label="Hit - Draw another card"
      >
        Hit
      </button>
      
      <button
        className={`${styles.button} ${styles.stand}`}
        onClick={() => handleAction('stand')}
        disabled={!canStand || disabled}
        aria-label="Stand - Keep current hand"
      >
        Stand
      </button>
      
      <button
        className={`${styles.button} ${styles.double}`}
        onClick={() => handleAction('double')}
        disabled={!canDouble || disabled}
        aria-label="Double - Double bet and draw one more card"
      >
        Double
      </button>
      
      <button
        className={`${styles.button} ${styles.split}`}
        onClick={() => handleAction('split')}
        disabled={!canSplit || disabled}
        aria-label="Split - Split pair into two hands"
      >
        Split
      </button>
      
      <button
        className={`${styles.button} ${styles.surrender}`}
        onClick={() => handleAction('surrender')}
        disabled={!canSurrender || disabled}
        aria-label="Surrender - Give up half your bet"
      >
        Surrender
      </button>
    </div>
  );
};