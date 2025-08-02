import { FC } from "react";
import { HandView } from "../hand/hand.view";
import styles from "./gameController.module.css";
import type { Participant } from "../participant/participant.types";
import type { Dealer } from "../dealer/dealer.types";
import type { GamePhase } from "./gameController.types";

interface GameTableMockViewProps {
  phase: GamePhase;
  participants: Participant[];
  dealer: Dealer;
  currentTurnIndex?: number;
  roundNumber: number;
  deckCount: number;
  isGameInProgress: boolean;
  currentParticipant?: Participant | null;
  canPerformAction?: (id: string, action: { type: string }) => boolean;
}

export const GameTableMockView: FC<GameTableMockViewProps> = ({
  phase,
  participants,
  dealer,
  currentTurnIndex = -1,
  roundNumber,
  deckCount,
  isGameInProgress,
  currentParticipant,
  canPerformAction = () => false,
}) => {
  const getPhaseMessage = () => {
    switch (phase) {
      case "waiting":
        return "Waiting to start";
      case "betting":
        return "Place your bets";
      case "dealing":
        return "Dealing cards...";
      case "playing":
        return currentParticipant ? `${currentParticipant.name}'s turn` : "Playing";
      case "dealer-turn":
        return "Dealer's turn";
      case "settlement":
        return "Round complete";
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className={styles.gameTable}>
      {/* Game Info Area */}
      <div className={styles.gameInfo} aria-label="Game information">
        <div className={styles.phaseInfo}>
          <h2>{getPhaseMessage()}</h2>
        </div>
        <div className={styles.roundInfo}>
          <span>Round {roundNumber}</span>
          <span className={styles.deckInfo}>Cards remaining: {deckCount}</span>
        </div>
      </div>

      {/* Dealer Area */}
      <div className={styles.dealerArea} aria-label="Dealer area">
        <h3 className={styles.dealerTitle}>Dealer</h3>
        <div className={styles.dealerHand}>
          <HandView hand={dealer.hand} />
        </div>
      </div>

      {/* Players Area */}
      <div className={styles.playersArea} aria-label="Players area">
        {participants.map((participant, index) => (
          <div
            key={participant.id}
            data-testid={`player-${index}`}
            className={`${styles.playerSlot} ${
              currentTurnIndex === index ? styles.currentTurn : ""
            }`}
          >
            <div className={styles.playerInfo}>
              <h4>{participant.name}</h4>
              <div className={styles.playerStats}>
                <span>Balance: {formatCurrency(participant.balance.value)}</span>
                {isGameInProgress && participant.bet && participant.bet.value > 0 && (
                  <span>Bet: {formatCurrency(participant.bet.value)}</span>
                )}
              </div>
            </div>
            <div className={styles.playerHand}>
              {participant.hand && <HandView hand={participant.hand} />}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons Area */}
      {isGameInProgress && currentParticipant && phase === "playing" && (
        <div className={styles.actionButtons} aria-label="Action buttons">
          <button
            disabled={!canPerformAction(currentParticipant.id, { type: "hit" })}
            className={styles.actionButton}
          >
            Hit
          </button>
          <button
            disabled={!canPerformAction(currentParticipant.id, { type: "stand" })}
            className={styles.actionButton}
          >
            Stand
          </button>
          <button
            disabled={!canPerformAction(currentParticipant.id, { type: "double" })}
            className={styles.actionButton}
          >
            Double
          </button>
        </div>
      )}

      {/* Game Control Buttons */}
      {phase === "waiting" && (
        <div className={styles.gameControls}>
          <button className={styles.controlButton}>
            Start New Game
          </button>
        </div>
      )}

      {phase === "settlement" && (
        <div className={styles.gameControls}>
          <button className={styles.controlButton}>
            Next Round
          </button>
        </div>
      )}

      {phase === "dealer-turn" && (
        <div className={styles.gameControls}>
          <button className={styles.controlButton}>
            Continue Dealer Turn
          </button>
        </div>
      )}

      {phase === "settlement" && participants.every(p => p.balance.value <= 0) && (
        <div className={styles.gameOver}>
          <h2>Game Over</h2>
          <p>All players are out of money!</p>
        </div>
      )}
    </div>
  );
};