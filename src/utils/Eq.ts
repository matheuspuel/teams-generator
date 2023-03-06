export * from 'fp-ts/Eq'
import { Eq } from 'fp-ts/Eq'

export const equals =
  <A>(eq: Eq<A>) =>
  (b: A) =>
  (a: A) =>
    eq.equals(a, b)
