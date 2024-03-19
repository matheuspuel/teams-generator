/* eslint-disable functional/no-expression-statements */
import { flow, pipe } from 'effect'
import * as fc from 'fast-check'
import { describe, test } from 'vitest'
import { factorial } from '../Math'
import * as A from './Array'

describe('getPermutations', () => {
  test('should have the original size on each permutation', () => {
    fc.assert(
      fc.property(fc.array(fc.anything(), { maxLength: 6 }), as =>
        pipe(
          A.getPermutations(as),
          A.every(flow(A.length, s => s === A.length(as))),
        ),
      ),
    )
  })

  test('should have the correct count of permutations', () => {
    fc.assert(
      fc.property(fc.array(fc.anything(), { maxLength: 6 }), as =>
        pipe(
          A.getPermutations(as),
          A.length,
          s => s === factorial(A.length(as)),
        ),
      ),
    )
  })
})
