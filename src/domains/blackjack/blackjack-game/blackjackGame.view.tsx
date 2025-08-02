import { GameSetup } from '../game-setup/gameSetup.view'
import { GameTableView } from '../game-controller/gameController.view'
import { useBlackjackGameHook } from './blackjackGame.hook'

export const BlackjackGame = () => {
  const { isGameStarted, handleGameStart } = useBlackjackGameHook()

  if (!isGameStarted) {
    return <GameSetup onStartGame={handleGameStart} />
  }

  return <GameTableView />
}