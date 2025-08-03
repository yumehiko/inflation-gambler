import { GameTableView } from './domains/blackjack/game-table/gameTable.view';

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
    }}>
      <h1 style={{ 
        textAlign: 'center',
        margin: '2rem 0',
        color: '#fff',
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
      }}>Inflation Gambler</h1>
      <GameTableView />
    </div>
  )
}

export default App