import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UserDashboardView } from './userDashboard.view'
import { useUser } from '../user/user.hook'
import { createCoin } from '../coin/coin.utils'

vi.mock('../user/user.hook')

describe('UserDashboardView', () => {
  it('should display user name and coin balance', () => {
    const mockUser = {
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

  it('should log message when Play Blackjack button is clicked', () => {
    const mockUser = {
      name: 'Test Player',
      coin: createCoin(1000)
    }
    
    vi.mocked(useUser).mockReturnValue({
      user: mockUser,
      updateCoin: vi.fn(),
      updateName: vi.fn(),
      reset: vi.fn()
    })

    const consoleSpy = vi.spyOn(console, 'log')

    render(<UserDashboardView />)

    const playButton = screen.getByRole('button', { name: 'Play Blackjack' })
    fireEvent.click(playButton)

    expect(consoleSpy).toHaveBeenCalledWith('Play Blackjack clicked')
  })
})