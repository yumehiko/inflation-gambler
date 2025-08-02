import { FC } from "react";
import { BettingInputProps } from "./bettingInput.types";
import styles from "./bettingInput.module.css";

export const BettingInputView: FC<BettingInputProps> = ({
  balance,
  minBet,
  maxBet,
  currentBet,
  onBetChange,
  onBetConfirm,
  disabled = false,
}) => {
  const chipValues = [1, 5, 10, 25, 50, 100];
  
  const handleChipClick = (chipValue: number) => {
    if (disabled) return;
    
    const newBet = currentBet + chipValue;
    const maxAllowed = Math.min(maxBet, balance);
    
    if (newBet <= maxAllowed) {
      onBetChange(newBet);
    } else {
      onBetChange(maxAllowed);
    }
  };
  
  const handleQuickAction = (action: "min" | "max" | "double" | "half" | "clear") => {
    if (disabled) return;
    
    switch (action) {
      case "min":
        onBetChange(minBet);
        break;
      case "max":
        onBetChange(Math.min(maxBet, balance));
        break;
      case "double": {
        const doubled = currentBet * 2;
        onBetChange(Math.min(doubled, Math.min(maxBet, balance)));
        break;
      }
      case "half":
        // Round down to nearest integer (casino standard)
        onBetChange(Math.floor(currentBet / 2));
        break;
      case "clear":
        onBetChange(0);
        break;
    }
  };
  
  const canAddChip = (chipValue: number) => {
    return currentBet + chipValue <= Math.min(maxBet, balance);
  };
  
  const canConfirm = currentBet >= minBet && currentBet <= maxBet && currentBet <= balance;
  
  const formatCurrency = (value: number) => `$${value}`;

  return (
    <div className={styles.container} role="group" aria-label="Betting controls">
      <div className={styles.betDisplay} aria-label="Current bet amount">
        <span className={styles.betLabel}>Current Bet:</span>
        <span className={styles.betAmount}>{formatCurrency(currentBet)}</span>
      </div>
      
      <div className={styles.chipSection}>
        <h3 className={styles.sectionTitle}>Chips</h3>
        <div className={styles.chipButtons}>
          {chipValues.map(value => (
            <button
              key={value}
              className={`${styles.chip} ${styles[`chip${value}`]}`}
              onClick={() => handleChipClick(value)}
              disabled={disabled || !canAddChip(value)}
              aria-label={`Add ${formatCurrency(value)} chip`}
            >
              {formatCurrency(value)}
            </button>
          ))}
        </div>
      </div>
      
      <div className={styles.quickActions}>
        <button
          className={`${styles.quickButton} ${styles.min}`}
          onClick={() => handleQuickAction("min")}
          disabled={disabled}
          aria-label="Set minimum bet"
        >
          Min
        </button>
        <button
          className={`${styles.quickButton} ${styles.max}`}
          onClick={() => handleQuickAction("max")}
          disabled={disabled}
          aria-label="Set maximum bet"
        >
          Max
        </button>
        <button
          className={`${styles.quickButton} ${styles.double}`}
          onClick={() => handleQuickAction("double")}
          disabled={disabled || currentBet === 0}
          aria-label="Double current bet"
        >
          2x
        </button>
        <button
          className={`${styles.quickButton} ${styles.half}`}
          onClick={() => handleQuickAction("half")}
          disabled={disabled || currentBet === 0}
          aria-label="Half current bet"
        >
          1/2
        </button>
        <button
          className={`${styles.quickButton} ${styles.clear}`}
          onClick={() => handleQuickAction("clear")}
          disabled={disabled || currentBet === 0}
          aria-label="Clear bet"
        >
          Clear
        </button>
      </div>
      
      <div className={styles.confirmSection}>
        <button
          className={styles.confirmButton}
          onClick={onBetConfirm}
          disabled={disabled || !canConfirm}
          aria-label="Confirm bet"
        >
          Confirm Bet
        </button>
      </div>
      
      <div className={styles.info}>
        <span>Balance: {formatCurrency(balance)}</span>
        <span>Min: {formatCurrency(minBet)} | Max: {formatCurrency(maxBet)}</span>
      </div>
    </div>
  );
};