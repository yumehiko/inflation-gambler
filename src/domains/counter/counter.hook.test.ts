import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './counter.hook'
import { useCounterStore } from './counter.store'

describe('counter.hook', () => {
  beforeEach(() => {
    useCounterStore.setState({ count: 0 })
  })

  describe('useCounter', () => {
    it('should return current count', () => {
      const { result } = renderHook(() => useCounter())
      expect(result.current.count).toBe(0)
    })

    it('should increment count', () => {
      const { result } = renderHook(() => useCounter())
      
      act(() => {
        result.current.increment()
      })
      
      expect(result.current.count).toBe(1)
    })

    it('should decrement count', () => {
      useCounterStore.setState({ count: 5 })
      const { result } = renderHook(() => useCounter())
      
      act(() => {
        result.current.decrement()
      })
      
      expect(result.current.count).toBe(4)
    })

    it('should reset count', () => {
      useCounterStore.setState({ count: 42 })
      const { result } = renderHook(() => useCounter())
      
      act(() => {
        result.current.reset()
      })
      
      expect(result.current.count).toBe(0)
    })

    it('should set count to specific value', () => {
      const { result } = renderHook(() => useCounter())
      
      act(() => {
        result.current.setCount(25)
      })
      
      expect(result.current.count).toBe(25)
    })

    it('should sync with store updates', () => {
      const { result } = renderHook(() => useCounter())
      
      act(() => {
        useCounterStore.setState({ count: 99 })
      })
      
      expect(result.current.count).toBe(99)
    })
  })
})