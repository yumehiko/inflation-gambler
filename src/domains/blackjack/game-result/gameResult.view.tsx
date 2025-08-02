import type { FC } from "react";
import type { GameResultProps } from "./gameResult.types";
import type { ParticipantResult } from "../game-controller/gameController.types";
import type { Hand } from "../hand/hand.types";
import type { Coin } from "../../core/coin/coin.types";
import styles from "./gameResult.module.css";

const getResultLabel = (result: ParticipantResult["result"]): string => {
  switch (result) {
    case "win":
      return "WIN";
    case "lose":
      return "LOSE";
    case "push":
      return "PUSH";
    case "blackjack":
      return "BLACKJACK!";
  }
};

const getHandValueDisplay = (hand: Hand | null): string => {
  if (!hand) return "FOLDED";
  if (hand.isBust) return "BUST";
  if (hand.isBlackjack) return "Blackjack";
  return hand.value.toString();
};

const getMoneyDisplay = (
  result: ParticipantResult["result"],
  amount: Coin | null
): string => {
  if (amount === null) return "";
  
  switch (result) {
    case "win":
    case "blackjack":
      return `Won: +${amount.value}`;
    case "lose":
      return `Lost: ${amount.value}`;
    case "push":
      return `Push: ${amount.value}`;
  }
};

const ResultCard: FC<{ result: ParticipantResult }> = ({ result }) => {
  const resultClass = styles[result.result];
  const handValue = getHandValueDisplay(result.finalHand);
  const moneyDisplay = getMoneyDisplay(result.result, result.winAmount);

  return (
    <div className={`${styles.resultCard} ${resultClass}`}>
      <div className={styles.playerName}>{result.name}</div>
      <div className={styles.resultLabel}>{getResultLabel(result.result)}</div>
      
      {result.finalHand ? (
        <div className={styles.handInfo}>
          <div className={styles.cards}>
            {result.finalHand.cards.map((card, index) => (
              <span key={index} className={styles.card}>
                {card.rank} {card.suit}
              </span>
            ))}
          </div>
          <div className={styles.handValue}>{handValue}</div>
        </div>
      ) : (
        <div className={styles.handInfo}>
          <div className={styles.handValue}>{handValue}</div>
        </div>
      )}
      
      {result.bet !== null && (
        <div className={styles.betInfo}>
          <div className={styles.bet}>Bet: {result.bet.value}</div>
          <div className={styles.winAmount}>{moneyDisplay}</div>
        </div>
      )}
    </div>
  );
};

const DealerCard: FC<{ hand: Hand }> = ({ hand }) => {
  return (
    <div className={styles.dealerCard}>
      <div className={styles.dealerTitle}>Dealer</div>
      <div className={styles.handInfo}>
        <div className={styles.cards}>
          {hand.cards.map((card, index) => (
            <span key={index} className={styles.card}>
              {card.rank} {card.suit}
            </span>
          ))}
        </div>
        <div className={styles.handValue}>{getHandValueDisplay(hand)}</div>
      </div>
    </div>
  );
};

export const GameResult: FC<GameResultProps> = ({
  results,
  dealerHand,
  onNextRound,
  onEndGame,
}) => {
  const totalWinnings = results.reduce(
    (sum, result) => sum + (result.winAmount?.value || 0),
    0
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Round Results</h2>
      
      <div className={styles.dealerSection}>
        <DealerCard hand={dealerHand} />
      </div>
      
      <div className={styles.resultsGrid}>
        {results.map((result) => (
          <ResultCard key={result.participantId} result={result} />
        ))}
      </div>
      
      <div className={styles.summary}>
        <div className={styles.totalDisplay}>
          Total: {totalWinnings > 0 ? "+" : ""}
          {totalWinnings}
        </div>
      </div>
      
      <div className={styles.actions}>
        <button
          className={styles.nextRoundButton}
          onClick={onNextRound}
          type="button"
        >
          Next Round
        </button>
        <button
          className={styles.endGameButton}
          onClick={onEndGame}
          type="button"
        >
          End Game
        </button>
      </div>
    </div>
  );
};