export * from '@effect/data/Equivalence'
import { Equivalence } from '@effect/data/Equivalence'

export const equals =
  <A>(eq: Equivalence<A>) =>
  (b: A) =>
  (a: A) =>
    eq(a, b)
