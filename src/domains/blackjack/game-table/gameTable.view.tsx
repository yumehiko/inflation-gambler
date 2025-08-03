import { DealerView } from '../dealer/dealer.view';
import { PlayerView } from '../player/player.view';
import { ActionButtonsView } from '../action-buttons/actionButtons.view';
import { BettingInputView } from '../betting-input/bettingInput.view';
import { useGameTable } from './gameTable.hook';
import styles from './gameTable.module.css';
import type { GameTableProps } from './gameTable.types';

export const GameTableView = ({ className }: GameTableProps) => {
  const {
    playerId,
    actionButtonsProps,
    bettingInputProps,
    showBettingInput,
    showActionButtons,
  } = useGameTable();
  
  return (
    <div className={`${styles.gameTable} ${className || ''}`}>
      <div className={styles.dealerArea}>
        <DealerView />
      </div>
      
      <div className={styles.playerArea}>
        <PlayerView playerId={playerId} />
      </div>
      
      <div className={styles.actionArea}>
        {showBettingInput && (
          <BettingInputView {...bettingInputProps} />
        )}
        {showActionButtons && (
          <ActionButtonsView {...actionButtonsProps} />
        )}
      </div>
    </div>
  );
};