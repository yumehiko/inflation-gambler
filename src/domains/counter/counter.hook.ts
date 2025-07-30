import { useCounterStore } from './counter.store'

export function useCounter() {
  const count = useCounterStore((state) => state.count)
  const increment = useCounterStore((state) => state.increment)
  const decrement = useCounterStore((state) => state.decrement)
  const reset = useCounterStore((state) => state.reset)
  const setCount = useCounterStore((state) => state.setCount)

  return {
    count,
    increment,
    decrement,
    reset,
    setCount
  }
}