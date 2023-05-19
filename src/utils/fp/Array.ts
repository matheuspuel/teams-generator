import * as O from '@effect/data/Option'
import * as A from '@effect/data/ReadonlyArray'
import { pipe as $, constant } from 'fp-ts/function'
import * as Eq from './Eq'

export * from '@effect/data/ReadonlyArray'

export const isArray = <A>(a: A): a is Extract<A, ReadonlyArray<unknown>> =>
  Array.isArray(a)

export const getUnorderedEquivalence = <A>(
  E: Eq.Equivalence<A>,
): Eq.Equivalence<Array<A>> =>
  Eq.make((as, bs) =>
    $(
      as,
      A.matchLeft(
        () => A.isEmptyArray(bs),
        (a, as_) =>
          $(
            A.findFirstIndex(Eq.equals(E)(a))(bs),
            O.map(i => A.remove(i)(bs)),
            O.match(() => false, Eq.equals(getUnorderedEquivalence(E))(as_)),
          ),
      ),
    ),
  )

export const getPermutations: <A>(as: Array<A>) => Array<Array<A>> = A.match(
  constant([[]]),
  as =>
    $(
      as,
      A.map((a, i) => $(A.remove(i)(as), getPermutations, A.map(A.append(a)))),
      A.flatten,
    ),
)
