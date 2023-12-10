export * from 'effect/Equivalence'
import { Equivalence, make, strict } from 'effect/Equivalence'
import * as A from 'effect/ReadonlyArray'
import * as Rec from './Record'

export const equals =
  <A>(eq: Equivalence<A>) =>
  (b: A) =>
  (a: A) =>
    eq(a, b)

export const shallow = <A extends Readonly<Record<string, unknown>>>() =>
  Rec.getEquivalence<keyof A & string, A[keyof A]>(strict())

export const deep = <A>(): Equivalence<A> =>
  make((a, b) =>
    a === b
      ? true
      : Array.isArray(a)
        ? Array.isArray(b) && A.getEquivalence(deep())(a, b)
        : typeof a === 'object' &&
          typeof b === 'object' &&
          a !== null &&
          b !== null &&
          Rec.getEquivalence(deep())(
            a as Record<string, unknown>,
            b as Record<string, unknown>,
          ),
  )
