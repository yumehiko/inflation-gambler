import { useGameFlow } from '../game-flow/gameFlow.hook';
import { usePlayerStore } from '../player/player.store';
import { useDealerStore } from '../dealer/dealer.store';
import styles from './debug.module.css';

export const DebugView = () => {
  const { game, currentPhase } = useGameFlow();
  const { players } = usePlayerStore();
  const { dealer } = useDealerStore();

  return (
    <div className={styles.debug}>
      <h3>Debug Info</h3>
      <div>
        <strong>Phase:</strong> {currentPhase}
      </div>
      <div>
        <strong>Current Player ID:</strong> {game?.currentPlayerId || 'none'}
      </div>
      <div>
        <strong>Deck Size:</strong> {game?.deck.length || 0}
      </div>
      <div>
        <strong>History Events:</strong> {game?.history.length || 0}
      </div>
      
      <h4>Players:</h4>
      {players.map(player => (
        <div key={player.id} className={styles.playerDebug}>
          <div>ID: {player.id} ({player.brain.type})</div>
          <div>Cards: {player.hand.cards.length}</div>
          <div>Hand Value: {player.hand.value}</div>
          <div>Current Bet: {player.currentBet}</div>
          <div>Chips: {player.chips}</div>
          <div>Active: {player.isActive ? 'Yes' : 'No'}</div>
        </div>
      ))}
      
      <h4>Dealer:</h4>
      {dealer && (
        <div className={styles.playerDebug}>
          <div>Cards: {dealer.hand.cards.length}</div>
          <div>Hand Value: {dealer.hand.value}</div>
        </div>
      )}
    </div>
  );
};