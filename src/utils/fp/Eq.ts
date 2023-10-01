export * from 'effect/Equivalence'
import { Equivalence } from 'effect/Equivalence'

export const equals =
  <A>(eq: Equivalence<A>) =>
  (b: A) =>
  (a: A) =>
    eq(a, b)
