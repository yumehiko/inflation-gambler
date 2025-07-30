import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Counter } from './counter.view'
import { useCounterStore } from './counter.store'

vi.mock('./counter.hook', () => ({
  useCounter: () => useCounterMock()
}))

const useCounterMock = vi.fn()

describe('Counter', () => {
  const mockIncrement = vi.fn()
  const mockDecrement = vi.fn()
  const mockReset = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useCounterStore.setState({ count: 0 })
    useCounterMock.mockReturnValue({
      count: 0,
      increment: mockIncrement,
      decrement: mockDecrement,
      reset: mockReset,
      setCount: vi.fn()
    })
  })

  it('should display current count', () => {
    useCounterMock.mockReturnValue({
      count: 42,
      increment: mockIncrement,
      decrement: mockDecrement,
      reset: mockReset,
      setCount: vi.fn()
    })
    
    render(<Counter />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should call increment when + button is clicked', () => {
    render(<Counter />)
    const incrementButton = screen.getByRole('button', { name: '+' })
    fireEvent.click(incrementButton)
    expect(mockIncrement).toHaveBeenCalledTimes(1)
  })

  it('should call decrement when - button is clicked', () => {
    render(<Counter />)
    const decrementButton = screen.getByRole('button', { name: '-' })
    fireEvent.click(decrementButton)
    expect(mockDecrement).toHaveBeenCalledTimes(1)
  })

  it('should call reset when reset button is clicked', () => {
    render(<Counter />)
    const resetButton = screen.getByRole('button', { name: 'Reset' })
    fireEvent.click(resetButton)
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it('should have proper accessibility attributes', () => {
    render(<Counter />)
    const counterDisplay = screen.getByLabelText('Current count')
    expect(counterDisplay).toBeInTheDocument()
    expect(counterDisplay).toHaveAttribute('role', 'status')
  })
})