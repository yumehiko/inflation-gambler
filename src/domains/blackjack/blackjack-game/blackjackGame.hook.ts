import { useState, useCallback } from 'react'

export const useBlackjackGameHook = () => {
  const [isGameStarted, setIsGameStarted] = useState(false)

  const handleGameStart = useCallback(() => {
    setIsGameStarted(true)
  }, [])

  return {
    isGameStarted,
    handleGameStart
  }
}