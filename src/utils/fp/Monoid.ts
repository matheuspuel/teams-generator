import { Monoid } from '@effect/data/typeclass/Monoid'

export * from '@effect/data/typeclass/Monoid'

export const combineAll = <A>(m: Monoid<A>) => m.combineAll
