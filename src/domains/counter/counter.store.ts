import { create } from 'zustand'
import { CounterStore } from './counter.types'
import { getIncrementedCount, getDecrementedCount } from './counter.utils'

export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  
  increment: () => set((state) => ({ 
    count: getIncrementedCount(state.count) 
  })),
  
  decrement: () => set((state) => ({ 
    count: getDecrementedCount(state.count) 
  })),
  
  reset: () => set({ count: 0 }),
  
  setCount: (count: number) => set({ 
    count: Math.max(0, Math.min(100, count)) 
  })
}))