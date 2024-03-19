import { constant, pipe } from 'effect/Function'
import * as O from 'effect/Option'
import { Option } from 'effect/Option'
import * as A from 'effect/ReadonlyArray'
import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
import * as Eq from './Equivalence'

export * from 'effect/ReadonlyArray'

export const isArray = <A>(a: A): a is Extract<A, ReadonlyArray<unknown>> =>
  Array.isArray(a)

export const toNonEmpty = <A>(
  array: ReadonlyArray<A>,
): Option<NonEmptyReadonlyArray<A>> =>
  A.match(array, { onEmpty: () => O.none(), onNonEmpty: O.some })

export const getUnorderedEquivalence = <A>(
  E: Eq.Equivalence<A>,
): Eq.Equivalence<Array<A>> =>
  Eq.make((as, bs) =>
    pipe(
      as,
      A.matchLeft({
        onEmpty: () => A.isEmptyArray(bs),
        onNonEmpty: (a, as_) =>
          pipe(
            A.findFirstIndex(bs, Eq.equals(E)(a)),
            O.map(i => A.remove(i)(bs)),
            O.match({
              onNone: () => false,
              onSome: Eq.equals(getUnorderedEquivalence(E))(as_),
            }),
          ),
      }),
    ),
  )

export const getPermutations: <A>(as: Array<A>) => Array<Array<A>> = A.match({
  onEmpty: constant([[]]),
  onNonEmpty: as =>
    pipe(
      as,
      A.map((a, i) =>
        pipe(A.remove(i)(as), getPermutations, A.map(A.append(a))),
      ),
      A.flatten,
    ),
})
