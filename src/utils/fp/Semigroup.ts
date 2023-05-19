import { Semigroup } from '@effect/data/typeclass/Semigroup'

export * from '@effect/data/typeclass/Semigroup'

export const combineAllNonEmpty =
  <A>(s: Semigroup<A>): ((as: readonly [A, ...Array<A>]) => A) =>
  ([a, ...as]) =>
    s.combineMany(a, as)
