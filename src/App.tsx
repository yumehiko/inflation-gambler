import { Counter } from './domains/counter/counter.view'

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <h1>React Web Template</h1>
      <p style={{ marginBottom: '2rem' }}>Domain-Driven Design Demo</p>
      <Counter />
    </div>
  )
}

export default App