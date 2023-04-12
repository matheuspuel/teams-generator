/* eslint-disable functional/no-expression-statements */
import * as fc from 'fast-check'
import { $, $f } from '.'
import { factorial } from '../Math'
import * as A from './Array'

describe('getPermutations', () => {
  it('should have the original size on each permutation', () => {
    fc.assert(
      fc.property(fc.array(fc.anything(), { maxLength: 6 }), as =>
        $(A.getPermutations(as), A.every($f(A.size, s => s === A.size(as)))),
      ),
    )
  })

  it('should have the correct count of permutations', () => {
    fc.assert(
      fc.property(fc.array(fc.anything(), { maxLength: 6 }), as =>
        $(A.getPermutations(as), A.size, s => s === factorial(A.size(as))),
      ),
    )
  })
})
