import React from 'react';
import { useDealer } from './dealer.hook';
import { HandView } from '../hand/hand.view';
import styles from './dealer.module.css';

export const DealerView: React.FC = () => {
  const { dealer } = useDealer();

  if (!dealer) {
    return null;
  }

  return (
    <div className={styles.dealer} data-testid="dealer-view">
      <div className={styles.header}>
        <h3 className={styles.name}>Dealer</h3>
      </div>

      <div className={styles.hand}>
        <HandView hand={dealer.hand} />
      </div>

      <div className={styles.status}>
        {dealer.hand.isBust && <span className={styles.bust}>Bust!</span>}
        {!dealer.isShowingHoleCard && <span className={styles.waiting}>Waiting...</span>}
      </div>
    </div>
  );
};