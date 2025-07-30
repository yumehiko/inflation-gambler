import { describe, it, expect, beforeEach } from 'vitest'
import { useCounterStore } from './counter.store'

describe('counter.store', () => {
  beforeEach(() => {
    useCounterStore.setState({ count: 0 })
  })

  describe('initial state', () => {
    it('should have count of 0', () => {
      const state = useCounterStore.getState()
      expect(state.count).toBe(0)
    })
  })

  describe('increment', () => {
    it('should increase count by 1', () => {
      const { increment } = useCounterStore.getState()
      increment()
      expect(useCounterStore.getState().count).toBe(1)
    })

    it('should not exceed maximum value of 100', () => {
      useCounterStore.setState({ count: 100 })
      const { increment } = useCounterStore.getState()
      increment()
      expect(useCounterStore.getState().count).toBe(100)
    })
  })

  describe('decrement', () => {
    it('should decrease count by 1', () => {
      useCounterStore.setState({ count: 5 })
      const { decrement } = useCounterStore.getState()
      decrement()
      expect(useCounterStore.getState().count).toBe(4)
    })

    it('should not go below 0', () => {
      const { decrement } = useCounterStore.getState()
      decrement()
      expect(useCounterStore.getState().count).toBe(0)
    })
  })

  describe('reset', () => {
    it('should reset count to 0', () => {
      useCounterStore.setState({ count: 50 })
      const { reset } = useCounterStore.getState()
      reset()
      expect(useCounterStore.getState().count).toBe(0)
    })
  })

  describe('setCount', () => {
    it('should set count to specified value', () => {
      const { setCount } = useCounterStore.getState()
      setCount(42)
      expect(useCounterStore.getState().count).toBe(42)
    })

    it('should clamp value to valid range', () => {
      const { setCount } = useCounterStore.getState()
      setCount(-10)
      expect(useCounterStore.getState().count).toBe(0)
      
      setCount(150)
      expect(useCounterStore.getState().count).toBe(100)
    })
  })
})