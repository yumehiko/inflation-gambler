import { GameSetup } from '../../domains/blackjack/game-setup/gameSetup.view'
import { useNavigate } from 'react-router-dom'

export const BlackjackHome = () => {
  const navigate = useNavigate()

  const handleGameStart = () => {
    navigate('/blackjack/play')
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <h1>ブラックジャック</h1>
      <GameSetup onStartGame={handleGameStart} />
    </div>
  )
}