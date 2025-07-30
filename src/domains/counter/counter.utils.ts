const MIN_COUNT = 0
const MAX_COUNT = 100

export function validateCount(count: number): boolean {
  return Number.isInteger(count) && count >= MIN_COUNT && count <= MAX_COUNT
}

export function getIncrementedCount(currentCount: number): number {
  return Math.min(currentCount + 1, MAX_COUNT)
}

export function getDecrementedCount(currentCount: number): number {
  return Math.max(currentCount - 1, MIN_COUNT)
}