import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Counter } from './domains/counter/counter.view'
import { BlackjackHome } from './pages/blackjack/BlackjackHome'
import { BlackjackPlay } from './pages/blackjack/BlackjackPlay'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
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
        } />
        <Route path="/blackjack" element={<BlackjackHome />} />
        <Route path="/blackjack/play" element={<BlackjackPlay />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App