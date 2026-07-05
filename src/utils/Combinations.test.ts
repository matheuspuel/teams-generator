import { Array, FastCheck, flow, pipe } from 'effect'
import { describe, test } from 'vitest'
import { getCombinationsIndices } from './Combinations'
import { factorial } from './Math'

describe('getCombinationsIndices', () => {
  test('should have the correct count on each combination', () => {
    FastCheck.assert(
      FastCheck.property(
        FastCheck.integer({ min: 0, max: 6 }),
        FastCheck.integer({ min: 0, max: 6 }),
        (n, k) =>
          pipe(
            getCombinationsIndices(k)(n),
            Array.every(flow(Array.length, s => s === k)),
          ),
      ),
    )
  })

  test('should have the correct count of combinations', () => {
    FastCheck.assert(
      FastCheck.property(
        FastCheck.integer({ min: 0, max: 6 }),
        FastCheck.integer({ min: 0, max: 6 }),
        (n, k) =>
          pipe(
            getCombinationsIndices(k)(n),
            Array.length,
            s =>
              s ===
              (n < k ? 0 : factorial(n) / factorial(k) / factorial(n - k)),
          ),
      ),
    )
  })
})
