export type CounterState = {
  count: number
}

export type CounterActions = {
  increment: () => void
  decrement: () => void
  reset: () => void
  setCount: (count: number) => void
}

export type CounterStore = CounterState & CounterActions