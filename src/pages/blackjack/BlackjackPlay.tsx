import { GameTableView } from '../../domains/blackjack/game-controller/gameController.view'

export const BlackjackPlay = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <GameTableView />
    </div>
  )
}