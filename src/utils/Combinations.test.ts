/* eslint-disable functional/no-expression-statements */
import * as fc from 'fast-check'
import { $, $f, A } from 'fp'
import { getCombinationsIndices } from './Combinations'
import { factorial } from './Math'

describe('getCombinationsIndices', () => {
  it('should have the correct count on each combination', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 6 }),
        fc.integer({ min: 0, max: 6 }),
        (n, k) =>
          $(getCombinationsIndices(k)(n), A.every($f(A.size, s => s === k))),
      ),
    )
  })

  it('should have the correct count of permutations', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 6 }),
        fc.integer({ min: 0, max: 6 }),
        (n, k) =>
          $(
            getCombinationsIndices(k)(n),
            A.size,
            s =>
              s ===
              (n < k ? 0 : factorial(n) / factorial(k) / factorial(n - k)),
          ),
      ),
    )
  })
})
