import { FC } from "react";
import { useGameController } from "./gameController.hook";
import { HandView } from "../hand/hand.view";
import styles from "./gameController.module.css";

export const GameTableView: FC = () => {
  const {
    phase,
    participants,
    dealer,
    deck,
    currentParticipant,
    currentTurnIndex,
    roundNumber,
    isGameInProgress,
    initializeGame,
    startNewRound,
    handlePlayerAction,
    handleDealerTurn,
    canPerformAction,
  } = useGameController();

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

  const handleActionClick = (action: "hit" | "stand" | "double" | "split" | "surrender") => {
    if (currentParticipant) {
      handlePlayerAction(currentParticipant.id, { type: action });
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
          <span className={styles.deckInfo}>Cards remaining: {deck.length}</span>
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
            onClick={() => handleActionClick("hit")}
            disabled={!canPerformAction(currentParticipant.id, { type: "hit" })}
            className={styles.actionButton}
          >
            Hit
          </button>
          <button
            onClick={() => handleActionClick("stand")}
            disabled={!canPerformAction(currentParticipant.id, { type: "stand" })}
            className={styles.actionButton}
          >
            Stand
          </button>
          <button
            onClick={() => handleActionClick("double")}
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
          <button onClick={() => initializeGame(participants)} className={styles.controlButton}>
            Start New Game
          </button>
        </div>
      )}

      {phase === "settlement" && (
        <div className={styles.gameControls}>
          <button onClick={startNewRound} className={styles.controlButton}>
            Next Round
          </button>
        </div>
      )}

      {phase === "dealer-turn" && (
        <div className={styles.gameControls}>
          <button onClick={handleDealerTurn} className={styles.controlButton}>
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