/* eslint-disable functional/no-expression-statements */
import { Array, flow, pipe } from 'effect'
import * as fc from 'fast-check'
import { describe, test } from 'vitest'
import { getCombinationsIndices } from './Combinations'
import { factorial } from './Math'

describe('getCombinationsIndices', () => {
  test('should have the correct count on each combination', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 6 }),
        fc.integer({ min: 0, max: 6 }),
        (n, k) =>
          pipe(
            getCombinationsIndices(k)(n),
            Array.every(flow(Array.length, s => s === k)),
          ),
      ),
    )
  })

  test('should have the correct count of combinations', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 6 }),
        fc.integer({ min: 0, max: 6 }),
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
