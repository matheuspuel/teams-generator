import { Array as A, Equivalence, Option } from 'effect'
import { constant, pipe } from 'effect/Function'

export * from 'effect/Array'

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
