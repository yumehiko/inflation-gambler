import { describe, it, expect } from 'vitest'
import { validateCount, getIncrementedCount, getDecrementedCount } from './counter.utils'

describe('counter.utils', () => {
  describe('validateCount', () => {
    it('should return true for valid counts within range', () => {
      expect(validateCount(0)).toBe(true)
      expect(validateCount(50)).toBe(true)
      expect(validateCount(100)).toBe(true)
    })

    it('should return false for counts outside range', () => {
      expect(validateCount(-1)).toBe(false)
      expect(validateCount(101)).toBe(false)
    })

    it('should return false for non-integer values', () => {
      expect(validateCount(1.5)).toBe(false)
      expect(validateCount(NaN)).toBe(false)
    })
  })

  describe('getIncrementedCount', () => {
    it('should increment count by 1', () => {
      expect(getIncrementedCount(0)).toBe(1)
      expect(getIncrementedCount(5)).toBe(6)
    })

    it('should not exceed maximum value', () => {
      expect(getIncrementedCount(100)).toBe(100)
    })
  })

  describe('getDecrementedCount', () => {
    it('should decrement count by 1', () => {
      expect(getDecrementedCount(5)).toBe(4)
      expect(getDecrementedCount(1)).toBe(0)
    })

    it('should not go below minimum value', () => {
      expect(getDecrementedCount(0)).toBe(0)
    })
  })
})