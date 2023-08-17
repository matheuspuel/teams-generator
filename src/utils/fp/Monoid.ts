import { Monoid } from '@effect/typeclass/Monoid'

export * from '@effect/typeclass/Monoid'

export const combineAll = <A>(m: Monoid<A>) => m.combineAll
