import { ReadonlyArray as A, Equivalence, Option } from 'effect'
import { constant, pipe } from 'effect/Function'
import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'

export * from 'effect/ReadonlyArray'

export const isArray = <A>(a: A): a is Extract<A, ReadonlyArray<unknown>> =>
  Array.isArray(a)

export const toNonEmpty = <A>(
  array: ReadonlyArray<A>,
): Option.Option<NonEmptyReadonlyArray<A>> =>
  A.match(array, { onEmpty: () => Option.none(), onNonEmpty: Option.some })

export const getUnorderedEquivalence = <A>(
  Eq: Equivalence.Equivalence<A>,
): Equivalence.Equivalence<Array<A>> =>
  Equivalence.make((as, bs) =>
    pipe(
      as,
      A.matchLeft({
        onEmpty: () => A.isEmptyArray(bs),
        onNonEmpty: (a, as_) =>
          pipe(
            A.findFirstIndex(bs, _ => Eq(_, a)),
            Option.map(i => A.remove(i)(bs)),
            Option.match({
              onNone: () => false,
              onSome: _ => getUnorderedEquivalence(Eq)(_, as_),
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
