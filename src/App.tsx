import { UserDashboardView } from './domains/core/user-dashboard/userDashboard.view';
import { GameTableView } from './domains/blackjack/game-table/gameTable.view';
import { useGameSetup } from './domains/blackjack/game-setup/gameSetup.hook';

function App() {
  const { isGameActive } = useGameSetup();
  
  console.log('App render, isGameActive:', isGameActive);
  
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
      }}>Inflation Gambler</h1>
      {isGameActive ? (
        <GameTableView />
      ) : (
        <UserDashboardView />
      )}
    </div>
  )
}

export default App