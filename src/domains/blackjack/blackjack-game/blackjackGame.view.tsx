import { GameSetup } from '../game-setup/gameSetup.view'
import { GameTableView } from '../game-controller/gameController.view'
import { BettingInputView } from '../betting-input/bettingInput.view'
import { ActionButtonsView } from '../action-buttons/actionButtons.view'
import { GameResult } from '../game-result/gameResult.view'
import { useBlackjackGameHook } from './blackjackGame.hook'
import { getPhaseDisplayConfig, shouldShowErrorMessage, canStartNewRound } from './blackjackGame.utils'
import styles from './blackjackGame.module.css'

export const BlackjackGame = () => {
  const {
    isGameStarted,
    phase,
    errorMessage,
    isLoading,
    isPlayerActionRequired,
    betAmount,
    handleGameStart,
    handleBetChange,
    handleBetConfirm,
    handlePlayerAction,
    handleNextRound,

    gameState,
    currentPlayer,
    dealer,
  } = useBlackjackGameHook()

  // ゲームが開始されていない場合はセットアップ画面を表示
  if (!isGameStarted) {
    return <GameSetup onStartGame={handleGameStart} />
  }

  // フェーズごとの表示設定を取得
  const displayConfig = getPhaseDisplayConfig(phase)

  return (
    <div className={styles.container}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <h1 className={styles.title}>ブラックジャック</h1>
        <div className={styles.roundInfo}>
          ラウンド {gameState?.roundNumber || 1}
        </div>
      </div>

      {/* エラーメッセージ */}
      {shouldShowErrorMessage(errorMessage) && (
        <div className={styles.errorMessage}>
          {errorMessage}
        </div>
      )}

      {/* ゲームエリア */}
      <div className={styles.gameArea}>
        {/* フェーズインジケーター */}
        <div className={styles.phaseIndicator}>
          {phase === "waiting" && "待機中"}
          {phase === "betting" && "ベッティング"}
          {phase === "dealing" && "カード配布中"}
          {phase === "playing" && "プレイ中"}
          {phase === "dealer-turn" && "ディーラーターン"}
          {phase === "settlement" && "精算"}
        </div>

        {/* ゲームテーブル（カード表示） */}
        {(displayConfig.showDealerCards || displayConfig.showPlayerCards) && (
          <GameTableView />
        )}

        {/* ベッティング入力 */}
        {displayConfig.showBettingInput && currentPlayer && (
          <BettingInputView
            balance={currentPlayer.balance.value}
            minBet={1}
            maxBet={currentPlayer.balance.value}
            currentBet={betAmount}
            onBetChange={handleBetChange}
            onBetConfirm={handleBetConfirm}
          />
        )}

        {/* アクションボタン */}
        {displayConfig.showActionButtons && isPlayerActionRequired && currentPlayer && (
          <ActionButtonsView
            participantId={currentPlayer.id}
            canHit={true}
            canStand={true}
            canDouble={currentPlayer.balance.value >= (currentPlayer.bet?.value || 0)}
            canSplit={false}
            canSurrender={false}
            onAction={(action) => handlePlayerAction(action.type as "hit" | "stand" | "double" | "split" | "surrender")}
          />
        )}

        {/* ゲーム結果 */}
        {displayConfig.showGameResult && gameState && (
          <GameResult
            results={gameState.history[gameState.history.length - 1]?.participants || []}
            dealerHand={dealer.hand}
            onNextRound={handleNextRound}
            onEndGame={() => {
              // 現在の実装ではゲーム終了は未対応
            }}
          />
        )}

        {/* アクションエリア */}
        <div className={styles.actionArea}>
          {/* 次のラウンドボタン */}
          {displayConfig.showNextRoundButton && canStartNewRound(phase) && (
            <button
              className={styles.nextRoundButton}
              onClick={handleNextRound}
              disabled={isLoading}
            >
              新しいラウンドを開始
            </button>
          )}
        </div>
      </div>

      {/* ローディングオーバーレイ */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
        </div>
      )}
    </div>
  )
}