import * as Ord from '@effect/data/typeclass/Order'

export * from '@effect/data/typeclass/Order'

export const equals =
  <A>(ord: Ord.Order<A>) =>
  (b: A) =>
  (a: A) =>
    ord.compare(a, b) === 0

export const lt = Ord.lessThan

export const gt = Ord.greaterThan

export const leq = Ord.lessThanOrEqualTo

export const geq = Ord.greaterThanOrEqualTo
