import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UserDashboardView } from './userDashboard.view'
import { useUser } from '../user/user.hook'
import { useGameSetup } from '../../blackjack/game-setup/gameSetup.hook'
import { createCoin } from '../coin/coin.utils'

vi.mock('../user/user.hook')
vi.mock('../../blackjack/game-setup/gameSetup.hook')

describe('UserDashboardView', () => {
  beforeEach(() => {
    vi.mocked(useGameSetup).mockReturnValue({
      isGameActive: false,
      config: null,
      setupGame: vi.fn(),
      startGame: vi.fn(),
      endGame: vi.fn(),
      resetSetup: vi.fn(),
      setupAndStartGame: vi.fn(),
    })
  })

  it('should display user name and coin balance', () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test Player',
      coin: createCoin(1000)
    }
    
    vi.mocked(useUser).mockReturnValue({
      user: mockUser,
      updateCoin: vi.fn(),
      updateName: vi.fn(),
      reset: vi.fn()
    })

    render(<UserDashboardView />)

    expect(screen.getByText('Test Player')).toBeInTheDocument()
    expect(screen.getByText('Coins:')).toBeInTheDocument()
    expect(screen.getByText('1000')).toBeInTheDocument()
  })

  it('should display Play Blackjack button', () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test Player',
      coin: createCoin(1000)
    }
    
    vi.mocked(useUser).mockReturnValue({
      user: mockUser,
      updateCoin: vi.fn(),
      updateName: vi.fn(),
      reset: vi.fn()
    })

    render(<UserDashboardView />)

    const playButton = screen.getByRole('button', { name: 'Play Blackjack' })
    expect(playButton).toBeInTheDocument()
  })

  it('should call setupAndStartGame when Play Blackjack button is clicked', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test Player',
      coin: createCoin(1000)
    }
    
    const mockSetupAndStartGame = vi.fn()
    
    vi.mocked(useUser).mockReturnValue({
      user: mockUser,
      updateCoin: vi.fn(),
      updateName: vi.fn(),
      reset: vi.fn()
    })
    
    vi.mocked(useGameSetup).mockReturnValue({
      isGameActive: false,
      config: null,
      setupGame: vi.fn(),
      startGame: vi.fn(),
      endGame: vi.fn(),
      resetSetup: vi.fn(),
      setupAndStartGame: mockSetupAndStartGame,
    })

    render(<UserDashboardView />)

    const playButton = screen.getByRole('button', { name: 'Play Blackjack' })
    fireEvent.click(playButton)

    expect(mockSetupAndStartGame).toHaveBeenCalledWith({
      userId: 'user-1',
      userName: 'Test Player',
      userChips: 1000,
      cpuCount: 3,
      minBet: 10,
      maxBet: 1000,
      deckCount: 6,
    })
  })
})