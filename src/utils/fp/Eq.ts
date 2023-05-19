export * from '@effect/data/typeclass/Equivalence'
import { Equivalence } from '@effect/data/typeclass/Equivalence'

export const equals =
  <A>(eq: Equivalence<A>) =>
  (b: A) =>
  (a: A) =>
    eq(a, b)
