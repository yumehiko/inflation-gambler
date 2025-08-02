import { useState, useCallback } from 'react'

export const useBlackjackGameHook = () => {
  const [isGameStarted, setIsGameStarted] = useState(false)

  const handleGameStart = useCallback(() => {
    setIsGameStarted(true)
  }, [])

  const handleGameEnd = useCallback(() => {
    setIsGameStarted(false)
  }, [])

  return {
    isGameStarted,
    handleGameStart,
    handleGameEnd
  }
}