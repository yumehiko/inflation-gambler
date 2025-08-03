import { UserDashboardView } from './domains/core/user-dashboard/userDashboard.view';

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
      }}>Inflation Gambler</h1>
      <UserDashboardView />
    </div>
  )
}

export default App