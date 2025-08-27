import { Array, flow, pipe } from 'effect'
import * as fc from 'fast-check'
import { describe, test } from 'vitest'
import { factorial } from '../Math'
import { getPermutations } from './Array'

describe('getPermutations', () => {
  test('should have the original size on each permutation', () => {
    fc.assert(
      fc.property(fc.array(fc.anything(), { maxLength: 6 }), as =>
        pipe(
          getPermutations(as),
          Array.every(flow(Array.length, s => s === Array.length(as))),
        ),
      ),
    )
  })

  test('should have the correct count of permutations', () => {
    fc.assert(
      fc.property(fc.array(fc.anything(), { maxLength: 6 }), as =>
        pipe(
          getPermutations(as),
          Array.length,
          s => s === factorial(Array.length(as)),
        ),
      ),
    )
  })
})
