import { useState, useCallback } from 'react'
import { useGameController } from "../game-controller/gameController.hook"

export const useBlackjackGameHook = () => {
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [betAmount, setBetAmount] = useState(0)
  const gameController = useGameController()

  const handleGameStart = useCallback(() => {
    setIsGameStarted(true)
    setErrorMessage(undefined)
  }, [])

  const handleBetChange = useCallback((amount: number) => {
    setBetAmount(amount)
  }, [])

  const handleBetConfirm = useCallback(() => {
    try {
      setIsLoading(true)
      // ベット処理をgame-controllerに委譲
      const currentParticipant = gameController.currentParticipant
      if (currentParticipant) {
        const betsMap = new Map<string, number>()
        betsMap.set(currentParticipant.id, betAmount)
        gameController.placeBets(betsMap)
      }
      setErrorMessage(undefined)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "ベットの処理中にエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }, [gameController, betAmount])

  const handlePlayerAction = useCallback((action: "hit" | "stand" | "double" | "split" | "surrender") => {
    try {
      setIsLoading(true)
      // プレイヤーアクションをgame-controllerに委譲
      const currentParticipant = gameController.currentParticipant
      if (currentParticipant) {
        gameController.handlePlayerAction(currentParticipant.id, { type: action })
      }
      setErrorMessage(undefined)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "アクションの処理中にエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }, [gameController])

  const handleNextRound = useCallback(() => {
    try {
      // 次のラウンドを開始
      gameController.startNewRound()
      setErrorMessage(undefined)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "新しいラウンドの開始中にエラーが発生しました")
    }
  }, [gameController])

  const handleGameReset = useCallback(() => {
    setIsGameStarted(false)
    setErrorMessage(undefined)
    // game-controllerのリセット処理
    gameController.reset()
  }, [gameController])

  // 現在のプレイヤーがアクション可能かどうかを判定
  const isPlayerActionRequired = gameController.phase === "playing" && 
    gameController.currentParticipant !== null &&
    gameController.currentParticipant.brain.type === "human"

  return {
    // 状態
    isGameStarted,
    phase: gameController.phase,
    errorMessage,
    isLoading,
    isPlayerActionRequired,
    betAmount,
    
    // ハンドラー
    handleGameStart,
    handleBetChange,
    handleBetConfirm,
    handlePlayerAction,
    handleNextRound,
    handleGameReset,
    
    // game-controllerの状態を直接公開（ビューで必要な情報）
    gameState: {
      phase: gameController.phase,
      participants: gameController.participants,
      dealer: gameController.dealer,
      deck: gameController.deck,
      currentTurnIndex: gameController.currentTurnIndex,
      roundNumber: gameController.roundNumber,
      history: gameController.history,
    },
    currentPlayer: gameController.currentParticipant,
    dealer: gameController.dealer,
  }
}