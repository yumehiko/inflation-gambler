import React from 'react';
import { usePlayer } from './player.hook';
import { HandView } from '../hand/hand.view';
import styles from './player.module.css';

export type PlayerViewProps = {
  playerId: string;
};

export const PlayerView: React.FC<PlayerViewProps> = ({ playerId }) => {
  const { player, isActive, isHuman } = usePlayer(playerId);

  if (!player) {
    return null;
  }

  return (
    <div 
      className={`${styles.player} ${isActive ? styles.active : ''}`}
      data-testid="player-view"
    >
      <div className={styles.header}>
        <h3 className={styles.name}>{player.name}</h3>
        <span className={styles.type}>{isHuman ? 'Human' : 'CPU'}</span>
        {isActive && <span className={styles.activeIndicator}>Active</span>}
      </div>

      <div className={styles.info}>
        <div className={styles.chips}>Chips: {player.chips}</div>
        <div className={styles.bet}>Bet: {player.currentBet}</div>
      </div>

      <div className={styles.hand}>
        <HandView hand={player.hand} />
      </div>

      <div className={styles.status}>
        {player.hasBusted && <span className={styles.bust}>Bust!</span>}
        {player.hasStood && !player.hasBusted && <span className={styles.stand}>Stand</span>}
      </div>
    </div>
  );
};